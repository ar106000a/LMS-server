import { Request, Response, NextFunction } from "express";
import { VerifyEmailService } from "../services/verify-email.service";
import { VerifyEmailDto } from "../dto/verify-email.dto";
import { AppError } from "../../../utils/error";

export class VerifyEmailController {
  constructor(private verifyEmailService = new VerifyEmailService()) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Structure the data into our clean DTO format
      const verifyEmailDto: VerifyEmailDto = {
        email: req.body.email,
        otp: req.body.otp,
      };

      await this.verifyEmailService.execute(verifyEmailDto);

      res.status(200).json({
        success: true,
        message: "Email verified successfully.",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      next(error);
    }
  };
}
