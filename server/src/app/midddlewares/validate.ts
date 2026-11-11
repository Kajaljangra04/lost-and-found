import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

const validateRequest =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
      });
      return next();
    } catch (err) {
      const uploadedPath = (req as any).uploadedImagePath as string | undefined;
      if (uploadedPath) await fs.promises.unlink(uploadedPath).catch(() => {});
      next(err);
    }
  };

export default validateRequest;
