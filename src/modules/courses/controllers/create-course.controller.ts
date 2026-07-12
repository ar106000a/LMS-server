import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../shared/middleware/authenticate";
import { CreateCourseService } from "../services/create-course.service";
import { AppError } from "../../../utils/error";

export class CreateCourseController {
  constructor(private createCourseService = new CreateCourseService()) {}

  handle = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.userId; // Assured by authentication middleware layer

      const course = await this.createCourseService.execute(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Course shell created successfully as draft.",
        data: {
          course,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      next(error);
    }
  };
}
