import { Response, NextFunction, Request } from "express";
import { UpdateCourseSchema } from "../schemas/update-course.schema";
import { UpdateCourseService } from "../services/update-course.service";
import { AppError } from "../../../utils/error";

export class UpdateCourseController {
  constructor(private updateCourseService = new UpdateCourseService()) {}

  handle = async (
    req: Request<UpdateCourseSchema["params"], any, UpdateCourseSchema["body"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user; // Set via authentication middleware
      const { courseId } = req.params;

      const updatedCourse = await this.updateCourseService.execute(
        userId,
        role,
        courseId,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: "Course updated successfully.",
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
