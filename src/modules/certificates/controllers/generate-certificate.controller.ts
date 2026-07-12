import { Response, NextFunction, Request } from "express";
import { GenerateCertificateSchema } from "../schemas/generate-certificate.schema";
import { GenerateCertificateService } from "../services/generate-certificate.service";
import { AppError } from "../../../utils/error";

export class GenerateCertificateController {
  constructor(
    private generateCertificateService = new GenerateCertificateService(),
  ) {}

  handle = async (
    req: Request<GenerateCertificateSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const { courseId } = req.params;

      const certificate = await this.generateCertificateService.execute(
        userId,
        courseId,
      );

      // Consistently return a 21 Created block wrapping the data payload
      res.status(201).json({
        success: true,
        message:
          "Academic validation achievement certificate processed successfully.",
        data: {
          certificate,
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
