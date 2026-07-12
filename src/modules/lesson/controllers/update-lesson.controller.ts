import { Response, NextFunction, Request } from "express";
import { UpdateLessonSchema } from "../schemas/update-lesson.schema";
import { UpdateLessonService } from "../services/update-lesson.service";
import { AppError } from "../../../utils/error";

export class UpdateLessonController {
  constructor(private updateLessonService = new UpdateLessonService()) {}

  handle = async (
    req: Request<UpdateLessonSchema["params"], any, UpdateLessonSchema["body"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { lessonId } = req.params;

      const updatedLesson = await this.updateLessonService.execute(
        userId,
        role,
        lessonId,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: "Lesson metadata updated successfully.",
        data: {
          lesson: updatedLesson,
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
