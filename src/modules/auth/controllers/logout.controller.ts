import { Request, Response, NextFunction } from "express";
import { LogoutService } from "../services/logout.service";

export class LogoutController {
  constructor(private logoutService = new LogoutService()) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;

      if (rawRefreshToken) {
        await this.logoutService.execute(rawRefreshToken);
      }

      // Clear authentication cookies immediately
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
        message: "Logged out successfully from this device.",
      });
    } catch (error) {
      next(error);
    }
  };
}
