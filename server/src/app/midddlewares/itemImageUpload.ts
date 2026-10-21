import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";

const uploadDir = path.resolve(process.cwd(), "uploads");
const publicBase = (
  process.env.PUBLIC_SERVER_URL || "http://localhost:5001"
).replace(/\/+$/, "");

fs.mkdirSync(uploadDir, { recursive: true });

const receiveImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 12,
    fieldSize: 100 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      callback(new Error("Upload a JPEG, PNG, or WebP image."));
      return;
    }
    callback(null, true);
  },
}).single("image");

export function uploadItemImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  receiveImage(req, res, async (uploadError: any) => {
    if (uploadError) {
      res.status(uploadError.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
        success: false,
        message: uploadError.message || "Image upload failed.",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please select an image to upload.",
      });
      return;
    }

    let savedPath = "";

    try {
      const image = sharp(req.file.buffer, {
        failOn: "error",
        limitInputPixels: 25_000_000,
        animated: false,
      });

      const metadata = await image.metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format || "")) {
        throw new Error("Only valid JPEG, PNG, and WebP images are supported.");
      }

      const filename = `${randomUUID().replace(/-/g, "")}.webp`;
      savedPath = path.join(uploadDir, filename);

      await sharp(req.file.buffer, {
        failOn: "error",
        limitInputPixels: 25_000_000,
        animated: false,
      })
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85, effort: 4 })
        .toFile(savedPath);

      req.body.img = `${publicBase}/uploads/${filename}`;
      (req as any).uploadedImagePath = savedPath;
      next();
    } catch (error: any) {
      if (savedPath) await fs.promises.unlink(savedPath).catch(() => {});
      res.status(400).json({
        success: false,
        message: error?.message || "The uploaded file is not a valid image.",
      });
    }
  });
}
