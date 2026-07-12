import { Response, NextFunction, Request } from "express";
import { SuspendEnrollmentSchema } from "../schemas/suspend-enrollment.schema";
import { SuspendEnrollmentService } from "../services/suspend-enrollment.service";
import { AppError } from "../../../utils/error";

export class SuspendEnrollmentController {
  constructor(
    private suspendEnrollmentService = new SuspendEnrollmentService(),
  ) {}

  handle = async (
    req: Request<SuspendEnrollmentSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { enrollmentId } = req.params;

      const enrollment =
        await this.suspendEnrollmentService.execute(enrollmentId);

      res.status(200).json({
        success: true,
        message:
          "Enrollment tracking privileges successfully SUSPENDED for this user.",
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
