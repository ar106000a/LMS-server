import { Response, NextFunction, Request } from "express";
import { GetMyCertificatesSchema } from "../schemas/get-my-certificates.schema";
import { GetMyCertificatesService } from "../services/get-my-certificates.service";
import { AppError } from "../../../utils/error";

export class GetMyCertificatesController {
  constructor(
    private getMyCertificatesService = new GetMyCertificatesService(),
  ) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const { page, limit } = req.query as unknown as GetMyCertificatesSchema["query"];

      const result = await this.getMyCertificatesService.execute(
        userId,
        page,
        limit,
      );

      res.status(200).json({
        success: true,
        message:
          "Student certificate portfolio metadata compiled successfully.",
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
