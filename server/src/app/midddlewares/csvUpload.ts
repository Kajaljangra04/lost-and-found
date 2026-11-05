import multer from "multer";

export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowed = ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"];
    if (!allowed.includes(file.mimetype) && !file.originalname.toLowerCase().endsWith(".csv")) {
      callback(new Error("Upload a CSV file. XLSX is not enabled in this deployment."));
      return;
    }
    callback(null, true);
  },
}).single("file");
