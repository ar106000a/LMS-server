import { Request, Response, NextFunction } from "express";
import { ForgotPasswordService } from "../services/forgot-password.service";
import { VerifyResetService } from "../services/verify-reset.service";
import { ResetPasswordService } from "../services/reset-password.service";
import { AppError, AuthenticationError } from "../../../utils/error";

export class PasswordResetController {
  constructor(
    private forgotPasswordService = new ForgotPasswordService(),
    private verifyResetService = new VerifyResetService(),
    private resetPasswordService = new ResetPasswordService(),
  ) {}

  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.forgotPasswordService.execute(req.body);

      res.status(200).json({
        success: true,
        message:
          "If the email is valid and registered, a password reset link has been sent.",
      });
    } catch (error) {
      next(error);
    }
  };

  verifyReset = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.verifyResetService.execute(req.body);
      res.cookie("resetJWT", result.resetJWT, {
        maxAge: 15 * 60 * 1000,
        httpOnly: true,
      });
      res.status(200).json({
        success: true,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      next(error);
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const resetJWT = req.cookies["resetJWT"];
      if (!resetJWT) {
        throw new AuthenticationError("Reset token is absent");
      }
      req.body.resetJWT = resetJWT;
      await this.resetPasswordService.execute(req.body);

      // Clear any cookies during explicit global session reset
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.status(200).json({
        success: true,
        message:
          "Password updated successfully. All other devices have been logged out.",
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
