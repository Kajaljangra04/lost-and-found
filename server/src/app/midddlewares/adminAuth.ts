import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../global/error";
import prisma from "../config/prisma";

const adminAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (typeof userId !== "string" || !userId) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, activated: true, isDeleted: true },
    });

    if (!user || !user.activated || user.isDeleted) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "Account is inactive or unavailable."
      );
    }

    if (user.role !== "ADMIN") {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Administrator access required."
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default adminAuth;
