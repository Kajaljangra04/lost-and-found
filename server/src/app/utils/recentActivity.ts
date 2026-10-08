import { Request, Response } from "express";
import prisma from "../config/prisma";
import sendResponse from "../global/response";
import { StatusCodes } from "http-status-codes";

type ActivityType = "found" | "lost" | "claim";

type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  time: Date;
  status: string;
};

export const recentActivity = async (req: Request, res: Response) => {
  try {
    const limit = 10;

    const [foundItems, lostItems, claims] = await Promise.all([
      prisma.foundItem.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { user: { select: { name: true, username: true } } },
      }),
      prisma.lostItem.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { user: { select: { name: true, username: true } } },
      }),
      prisma.claim.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { foundItem: { select: { foundItemName: true } } },
      }),
    ]);

    const activities: Activity[] = [
      ...foundItems.map((item) => ({
        id: `found-${item.id}`,
        type: "found" as ActivityType,
        title: `Found item reported: "${item.foundItemName}" (${item.location})`,
        time: item.createdAt,
        status: "new",
      })),
      ...lostItems.map((item) => ({
        id: `lost-${item.id}`,
        type: "lost" as ActivityType,
        title: `Lost item reported: "${item.lostItemName}" (${item.location})`,
        time: item.createdAt,
        status: "reported",
      })),
      ...claims.map((claim) => ({
        id: `claim-${claim.id}`,
        type: "claim" as ActivityType,
        title: `Claim ${claim.status.toLowerCase()} for "${claim.foundItem.foundItemName}"`,
        time: claim.createdAt,
        status: claim.status.toLowerCase(),
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.time).getTime() - new Date(a.time).getTime()
      )
      .slice(0, limit);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Recent activity retrieved successfully",
      data: activities,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: error?.message,
      data: null,
    });
  }
};