import { Request,Response, NextFunction } from "express";
import { GetInstructorCoursesService } from "../services/get-instructor-courses.service";
import { AppError } from "../../../utils/error";
import { AuthenticatedRequest } from "../../../shared/middleware/authenticate";

export class GetInstructorCoursesController {
  constructor(
    private getInstructorCoursesService = new GetInstructorCoursesService(),
  ) {}

  handle = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError("Authentication required.", 401);
      }

      const courses = await this.getInstructorCoursesService.execute(userId);

      res.status(200).json({
        success: true,
        message: "Instructor courses retrieved successfully.",
        data: {
          courses,
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