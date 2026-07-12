import { Response, NextFunction, Request } from "express";
import { GetLessonProgressSchema } from "../schemas/get-lesson-progress.schema";
import { GetLessonProgressService } from "../services/get-lesson-progress.service";
import { AppError } from "../../../utils/error";

export class GetLessonProgressController {
  constructor(
    private getLessonProgressService = new GetLessonProgressService(),
  ) {}

  handle = async (
    req: Request<GetLessonProgressSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const { lessonId } = req.params;

      const progressState = await this.getLessonProgressService.execute(
        userId,
        lessonId,
      );

      res.status(200).json({
        success: true,
        message: "Lesson validation progress query execution complete.",
        data: progressState,
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
