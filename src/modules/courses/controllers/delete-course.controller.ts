import { Response, NextFunction, Request } from "express";
import { DeleteCourseSchema } from "../schemas/delete-course.schema";
import { DeleteCourseService } from "../services/delete-course.service";
import { AppError } from "../../../utils/error";

export class DeleteCourseController {
  constructor(private deleteCourseService = new DeleteCourseService()) {}

  handle = async (
    req: Request<DeleteCourseSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { courseId } = req.params;

      await this.deleteCourseService.execute(userId, role, courseId);

      // Return standardized 204 No Content header
      res.status(204).send();
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
