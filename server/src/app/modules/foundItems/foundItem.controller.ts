import fs from "fs";
import { StatusCodes } from "http-status-codes";
import sendResponse, { Tmeta } from "../../global/response";
import { Request, Response } from "express";
import { foundItemService } from "./foundItem.service";
import { utils } from "../../utils/utils";
import { matchingService } from "../aiMatches/matching.service";

const createFoundItem = async (req: Request, res: Response) => {
  try {
    //   console.log({a:req.body,b:req.user})

    const result = await foundItemService.createFoundItem(
      req.body,
      req.user.id
    );
    const matches = await matchingService.forFoundItem(result.id).catch((error) => {
      console.error("Automatic matching after found report failed:", error);
      return [];
    });
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Found item reported successfully",
      data: { ...result, matching: { candidatesFound: matches.length } },
    });
  } catch (error: any) {
    const uploadedPath = (req as any).uploadedImagePath as string | undefined;
    if (uploadedPath) {
      await fs.promises.unlink(uploadedPath).catch(() => {});
    }
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: error?.message,
      data: null,
    });
  }
};

const getFoundItem = async (req: Request, res: Response) => {
  try {
    const meta = await utils.calculateMeta(req.query);

    const result = await foundItemService.getFoundItem(req.query);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Found items retrieved successfully",
      meta,
      data: result,
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

const getSingleFoundItem = async (req: Request, res: Response) => {
  try {
    const id: any = req?.params.id;

    const result = await foundItemService.getSingleFoundItem(id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Found item retrieved successfully",
      data: result,
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

const getMyFoundItem = async (req: Request, res: Response) => {
  try {
    const result = await foundItemService.getMyFoundItem(req.user);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Found item retrieved successfully",
      data: result,
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

const editMyFoundItem = async (req: Request, res: Response) => {
  try {
    const result = await foundItemService.editMyFoundItem(req.body, req.user.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Found item edited successfully",
      data: result,
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

const deleteMyFoundItem = async (req: Request, res: Response) => {
  try {
    await foundItemService.deleteMyFoundItem(req.params.id, req.user.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Found item deleted successfully",
      data: null,
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

export const foundItemController = {
  createFoundItem,
  getFoundItem,
  getSingleFoundItem,
  getMyFoundItem,
  editMyFoundItem,
  deleteMyFoundItem
};
