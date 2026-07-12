import { Response, NextFunction, Request } from "express";
import { UpdateVideoSchema } from "../schemas/update-video.schema";
import { UpdateVideoService } from "../services/update-video.service";
import { ValidationError, AppError } from "../../../utils/error";

export class UpdateVideoController {
  constructor(private updateVideoService = new UpdateVideoService()) {}

  handle = async (
    req: Request<UpdateVideoSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { lessonId } = req.params;

      // Validate that the request contains the new file binary intercept payload
      if (!req.file) {
        throw new ValidationError(
          "No new video file payload was detected in the multipart data stream.",
        );
      }

      const processingStatus = await this.updateVideoService.execute(
        userId,
        role,
        lessonId,
        req.file.buffer,
      );

      // Return explicit HTTP 202 Accepted payload response
      res.status(202).json({
        success: true,
        message:
          "New video asset accepted. Background replacement pipeline initialized.",
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
