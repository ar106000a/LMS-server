import { Response, NextFunction, Request } from "express";
import { EnrollCourseSchema } from "../schemas/enroll-course.schema";
import { EnrollCourseService } from "../services/enroll-course.service";
import { AppError } from "../../../utils/error";

export class EnrollCourseController {
  constructor(private enrollCourseService = new EnrollCourseService()) {}

  handle = async (
    req: Request<EnrollCourseSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as any).user; // Enforced cleanly by authentication authorization layers upstream
      const { courseId } = req.params;

      const enrollment = await this.enrollCourseService.execute(userId, courseId);

      // Return formal HTTP 201 Created mapping payload response
      res.status(201).json({
        success: true,
        message:
          "Course intake pipeline execution successful. Enrollment record initialized.",
        data: {
          enrollment,
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
