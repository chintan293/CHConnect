import multer from "multer";


const MAX_FILE_SIZE = 25 * 1024 * 1024; //25mb


export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, res, cb) => {
        const isImage = file.mimetype.startWith("image/");
        const isVideo = file.mimetype.startWith("video/");

        if(!isImage && !isVideo) {
            cb(new Error("Only image and video uploads are allowed"));
            return;
        }

        cb(null, true);
    },
});