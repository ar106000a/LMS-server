import { Response, NextFunction, Request } from "express";
import { GetVideoSchema } from "../schemas/get-video.schema";
import { GetVideoService } from "../services/get-video.service";
import { AppError } from "../../../utils/error";

export class GetVideoController {
  constructor(private getVideoService = new GetVideoService()) {}

  handle = async (
    req: Request<GetVideoSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { lessonId } = req.params;
      const userContext = (req as any).user; // Decoded cleanly via authenticateOptional filter middleware

      const videoData = await this.getVideoService.execute(
        lessonId,
        userContext,
      );

      res.status(200).json({
        success: true,
        message: "Video data fetched successfully.",
        data: videoData,
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
