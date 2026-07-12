import { Response, NextFunction, Request } from "express";
import { ArchiveCourseSchema } from "../schemas/archive-course.schema";
import { ArchiveCourseService } from "../services/archive-course.service";
import { AppError } from "../../../utils/error";

export class ArchiveCourseController {
  constructor(private archiveCourseService = new ArchiveCourseService()) {}

  handle = async (
    req: Request<ArchiveCourseSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { courseId } = req.params;

      const archivedCourse = await this.archiveCourseService.execute(
        userId,
        role,
        courseId,
      );

      res.status(200).json({
        success: true,
        message:
          "Course has been successfully archived and removed from public view.",
        data: {
          course: archivedCourse,
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
