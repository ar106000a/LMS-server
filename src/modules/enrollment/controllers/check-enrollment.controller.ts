import { Response, NextFunction, Request } from "express";
import { CheckEnrollmentSchema } from "../schemas/check-enrollment.schema";
import { CheckEnrollmentService } from "../services/check-enrollment.service";
import { AppError } from "../../../utils/error";

export class CheckEnrollmentController {
  constructor(private checkEnrollmentService = new CheckEnrollmentService()) {}

  handle = async (
    req: Request<CheckEnrollmentSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const { courseId } = req.params;

      const enrollment = await this.checkEnrollmentService.execute(
        userId,
        courseId,
      );

      // Business Rule: Standardize 200 OK structure regardless of access state
      res.status(200).json({
        success: true,
        message: "Enrollment verification track evaluated successfully.",
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
