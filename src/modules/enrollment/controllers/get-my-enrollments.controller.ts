import { Response, NextFunction, Request } from "express";
import { GetMyEnrollmentsSchema } from "../schemas/get-my-enrollments.schema";
import { GetMyEnrollmentsService } from "../services/get-my-enrollments.service";
import { AppError } from "../../../utils/error";

export class GetMyEnrollmentsController {
  constructor(
    private getMyEnrollmentsService = new GetMyEnrollmentsService(),
  ) {}

  handle = async (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as any).user;

      // Captured cleanly as strict primitive types post-Zod validation execution
      const { page, limit, status } = (req as any).validatedQuery;

      const result = await this.getMyEnrollmentsService.execute(userId, {
        page,
        limit,
        status,
      });

      res.status(200).json({
        success: true,
        message: "Student enrollment inventory fetched successfully.",
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
