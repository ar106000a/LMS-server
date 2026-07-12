import { Response, NextFunction, Request } from "express";
import { GetCertificateSchema } from "../schemas/get-certificate.schema";
import { GetCertificateService } from "../services/get-certificate.service";
import { AppError } from "../../../utils/error";

export class GetCertificateController {
  constructor(private getCertificateService = new GetCertificateService()) {}

  handle = async (
    req: Request<GetCertificateSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Deconstruct identity fields injected directly by your core authentication middleware layers
      const { userId, role } = (req as any).user;
      const { certificateId } = req.params;

      const certificate = await this.getCertificateService.execute(
        certificateId,
        userId,
        role,
      );

      res.status(200).json({
        success: true,
        message: "Certificate secure data profile extracted successfully.",
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
