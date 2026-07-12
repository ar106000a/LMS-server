import multer from "multer";
import { ValidationError } from "../../utils/error";

// Configure multer to hold the file in memory temporarily as a Buffer
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB limit (adjust as needed for high-res video)
  },
  fileFilter: (req, file, cb) => {
    // Basic validation gate for content types
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(
        new ValidationError(
          "Invalid file type. Only video uploads are permitted.",
        ),
      );
    }
  },
});
