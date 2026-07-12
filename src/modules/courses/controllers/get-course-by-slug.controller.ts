import { Request, Response, NextFunction } from "express";
import { GetCourseBySlugService } from "../services/get-course-by-slug.service";
import { AppError } from "../../../utils/error";
import { GetCourseBySlugSchema } from "../schemas/get-course-by-slug";

export class GetCourseBySlugController {
  constructor(private getCourseBySlugService = new GetCourseBySlugService()) {}

  handle = async (
    req: Request<GetCourseBySlugSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { slug } = req.params;
      const userContext = (req as any).user; // Injected optionally via authenticateOptional middleware context

      const course = await this.getCourseBySlugService.execute(
        slug,
        userContext,
      );

      res.status(200).json({
        success: true,
        message: "Course retrieved successfully.",
        data: {
          course,
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
