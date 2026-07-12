import { Response, NextFunction, Request } from "express";
import { GetCourseProgressSchema } from "../schemas/get-course-progress.schema";
import { GetCourseProgressService } from "../services/get-course-progress.service";
import { AppError } from "../../../utils/error";

export class GetCourseProgressController {
  constructor(
    private getCourseProgressService = new GetCourseProgressService(),
  ) {}

  handle = async (
    req: Request<GetCourseProgressSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const { courseId } = req.params;

      const progressData = await this.getCourseProgressService.execute(
        userId,
        courseId,
      );

      res.status(200).json({
        success: true,
        message:
          "Course-wide student progress parameters generated successfully.",
        data: progressData,
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
