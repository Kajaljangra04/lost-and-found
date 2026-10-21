import { NextFunction, Request, Response } from "express";
import { utils } from "../utils/utils";
import AppError from "../global/error";
import { StatusCodes } from "http-status-codes";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
      }

      const [scheme, ...tokenParts] = authorization.trim().split(/\s+/);
      if (scheme.toLowerCase() !== "bearer" || tokenParts.length !== 1 || !tokenParts[0]) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid authorization header.");
      }

      const token = tokenParts[0];
      const verifiedUser = utils.verifyToken(token);
      req.user = verifiedUser;

      if (!verifiedUser) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
      }

      // if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
      //   throw new AppError(StatusCodes.FORBIDDEN, "Forbidden");
      // }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
