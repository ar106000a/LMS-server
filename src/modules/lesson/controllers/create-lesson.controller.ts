import { Response, NextFunction, Request } from "express";
import { CreateLessonSchema } from "../schemas/create-lesson.schema";
import { CreateLessonService } from "../services/create-lesson.service";
import { AppError } from "../../../utils/error";

export class CreateLessonController {
  constructor(private createLessonService = new CreateLessonService()) {}

  handle = async (
    req: Request<CreateLessonSchema["params"], any, CreateLessonSchema["body"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { sectionId } = req.params;

      const lesson = await this.createLessonService.execute(
        userId,
        role,
        sectionId,
        req.body,
      );

      res.status(201).json({
        success: true,
        message:
          "Lesson created successfully with baseline content schemas initialized.",
        data: {
          lesson,
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
