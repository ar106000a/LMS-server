import { Response, NextFunction, Request } from "express";
import { UnpublishCourseSchema } from "../schemas/unpublish-course.schema";
import { UnpublishCourseService } from "../services/unpublish-course.service";
import { AppError } from "../../../utils/error";

export class UnpublishCourseController {
  constructor(private unpublishCourseService = new UnpublishCourseService()) {}

  handle = async (
    req: Request<UnpublishCourseSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { courseId } = req.params;

      const updatedCourse = await this.unpublishCourseService.execute(
        userId,
        role,
        courseId,
      );

      res.status(200).json({
        success: true,
        message:
          "Course has been successfully unpublished and reverted to draft status.",
        data: {
          course: updatedCourse,
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
