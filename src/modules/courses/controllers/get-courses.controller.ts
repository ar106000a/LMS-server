import { Request, Response, NextFunction } from "express";
import { GetCoursesService } from "../services/get-courses.service";
import { AppError } from "../../../utils/error";

export class GetCoursesController {
  constructor(private getCoursesService = new GetCoursesService()) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // The parsed query parameters come cleanly out of the req.query object via Zod mapping
      const result = await this.getCoursesService.execute(req.query as any);

      res.status(200).json({
        success: true,
        message: "Courses retrieved successfully.",
        data: result,
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
