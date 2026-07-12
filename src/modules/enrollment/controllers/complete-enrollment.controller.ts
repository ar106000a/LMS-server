import { Response, NextFunction, Request } from "express";
import { CompleteEnrollmentSchema } from "../schemas/complete-enrollment.schema";
import { CompleteEnrollmentService } from "../services/complete-enrollment.service";
import { AppError } from "../../../utils/error";

export class CompleteEnrollmentController {
  constructor(
    private completeEnrollmentService = new CompleteEnrollmentService(),
  ) {}

  handle = async (
    req: Request<CompleteEnrollmentSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const { enrollmentId } = req.params;

      const enrollment = await this.completeEnrollmentService.execute(
        userId,
        enrollmentId,
      );

      res.status(200).json({
        success: true,
        message:
          "Congratulations! Course requirements satisfied. Track marked as COMPLETED.",
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
