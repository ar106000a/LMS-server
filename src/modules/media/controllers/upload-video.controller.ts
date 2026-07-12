import { Response, NextFunction, Request } from "express";
import { UploadVideoSchema } from "../schemas/upload-video.schema";
import { UploadVideoService } from "../services/upload-video.service";
import { ValidationError, AppError } from "../../../utils/error";

export class UploadVideoController {
  constructor(private uploadVideoService = new UploadVideoService()) {}

  handle = async (
    req: Request<UploadVideoSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { lessonId } = req.params;

      // Ensure that file data was caught and processed by the Multer interceptor layer
      if (!req.file) {
        throw new ValidationError(
          "No video file payload was found in the multipart body data request.",
        );
      }

      const processingStatus = await this.uploadVideoService.execute(
        userId,
        role,
        lessonId,
        req.file.buffer,
      );

      // Return explicit HTTP 202 Accepted payload response
      res.status(202).json({
        success: true,
        message:
          "Video file upload accepted. Transcoding pipeline initiated asynchronously.",
        data: {
          processingStatus,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
        return;
      }
      next(error);
    }
  };
}
