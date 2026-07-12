import { Response, NextFunction, Request } from "express";
import { CompleteLessonSchema } from "../schemas/complete-lesson.schema";
import { CompleteLessonService } from "../services/complete-lesson.service";
import { AppError } from "../../../utils/error";

export class CompleteLessonController {
  constructor(private completeLessonService = new CompleteLessonService()) {}

  handle = async (
    req: Request<CompleteLessonSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const { lessonId } = req.params;

      const completedAt = await this.completeLessonService.execute(
        userId,
        lessonId,
      );

      // Return explicit structured HTTP 201 Created mapping payload response
      res.status(201).json({
        success: true,
        message:
          "Lesson successfully marked as complete. Progress analytics recalculated.",
        data: {
          lessonId,
          completedAt,
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
