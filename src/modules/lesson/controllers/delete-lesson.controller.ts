import { Response, NextFunction, Request } from "express";
import { DeleteLessonSchema } from "../schemas/delete-lesson.schema";
import { DeleteLessonService } from "../services/delete-lesson.service";
import { AppError } from "../../../utils/error";

export class DeleteLessonController {
  constructor(private deleteLessonService = new DeleteLessonService()) {}

  handle = async (
    req: Request<DeleteLessonSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { lessonId } = req.params;

      await this.deleteLessonService.execute(userId, role, lessonId);

      // Return standard HTTP 204 No Content header
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
