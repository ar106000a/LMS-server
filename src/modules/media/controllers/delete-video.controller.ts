import { Response, NextFunction, Request } from "express";
import { DeleteVideoSchema } from "../schemas/delete-video.schema";
import { DeleteVideoService } from "../services/delete-video.service";
import { AppError } from "../../../utils/error";

export class DeleteVideoController {
  constructor(private deleteVideoService = new DeleteVideoService()) {}

  handle = async (
    req: Request<DeleteVideoSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { lessonId } = req.params;

      await this.deleteVideoService.execute(userId, role, lessonId);

      // Return explicit standard HTTP 204 No Content response
      res.status(204).send();
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
