import { Response, NextFunction, Request } from "express";
import { PublishCourseSchema } from "../schemas/publish-course.schema";
import { PublishCourseService } from "../services/publish-course.service";
import { AppError } from "../../../utils/error";

export class PublishCourseController {
  constructor(private publishCourseService = new PublishCourseService()) {}

  handle = async (
    req: Request<PublishCourseSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { courseId } = req.params;

      const publishedCourse = await this.publishCourseService.execute(
        userId,
        role,
        courseId,
      );

      res.status(200).json({
        success: true,
        message:
          "Course has been successfully validated and published to the live public catalog.",
        data: {
          course: publishedCourse,
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
