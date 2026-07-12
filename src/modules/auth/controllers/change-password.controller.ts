import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../shared/middleware/authenticate";
import { ChangePasswordService } from "../services/change-password.service";
import { AppError } from "../../../utils/error";

export class ChangePasswordController {
  constructor(private changePasswordService = new ChangePasswordService()) {}

  handle = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      await this.changePasswordService.execute(userId, req.body);

      // Wipe cookies right out so the client must re-authenticate with the fresh credentials
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        success: true,
        message:
          "Password updated successfully. You have been logged out of all active devices.",
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
