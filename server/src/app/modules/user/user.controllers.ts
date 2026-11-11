import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import sendResponse from "../../global/response";
import { StatusCodes } from "http-status-codes";
import { emailVerificationService } from "./emailVerification.service";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.body;
    const result = await userService.registerUser(user);

    await emailVerificationService.issueEmailVerificationOtp(result.id);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Account created. Verify your email before logging in.",
      data: {
        id: result.id,
        username: result.username,
        email: result.email,
        emailVerified: result.emailVerified,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    const result = await emailVerificationService.verifyEmailOtp(email, otp);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const result =
      await emailVerificationService.resendEmailVerificationOtp(email);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const result = await userService.blockUser(id);

    if (result == "active") {
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User Activated successfully",
        data: result,
      });
    } else {
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User Blocked successfully",
        data: result,
      });
    }
  } catch (error: any) {
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: true,
      message: "User failed to blocked",
      data: null,
    });
  }
};
const changeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const { role } = req.body;
    const result = await userService.changeUserRole(id, role);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User role changed successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "Failed to change user role",
      data: null,
    });
  }
};
const softDeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const result = await userService.softDeleteUser(id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User deleted successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "Failed to delete user",
      data: null,
    });
  }
};
const allUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.allUsers();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const userController = {
  verifyEmail,
  resendVerification,
  registerUser,
  allUsers,
  blockUser,
  changeUserRole,
  softDeleteUser,
};
