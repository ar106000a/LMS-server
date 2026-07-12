import { Response, NextFunction, Request } from "express";
import { VerifyCertificateSchema } from "../schemas/verify-certificate.schema";
import { VerifyCertificateService } from "../services/verify-certificate.service";
import { AppError } from "../../../utils/error";

export class VerifyCertificateController {
  constructor(
    private verifyCertificateService = new VerifyCertificateService(),
  ) {}

  handle = async (
    req: Request<VerifyCertificateSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { certificateId } = req.params;

      const verificationData =
        await this.verifyCertificateService.execute(certificateId);

      res.status(200).json({
        success: true,
        message: "Credential verification profile validated successfully.",
        data: verificationData,
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
