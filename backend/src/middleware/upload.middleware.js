import multer from "multer";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max file size

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    const isAudio = file.mimetype.startsWith("audio/");

    if (!isImage && !isVideo && !isAudio) {
      cb(new Error("Only image, video, and audio files are allowed"));
      return;
    }

    cb(null, true);
  },
});