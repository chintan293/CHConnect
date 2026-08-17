import multer from "multer";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB max file size

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});