import { Request, Response, NextFunction } from "express";
import { LogoutAllService } from "../services/logout-all.service";

export class LogoutAllController {
  constructor(private logoutAllService = new LogoutAllService()) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // User payload extracted seamlessly from your authentication middleware
      const userId = (req as any).user.userId;
      const rawRefreshToken = req.cookies?.refreshToken;

      await this.logoutAllService.execute(userId, rawRefreshToken);

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
        message: "Logged out successfully from all active devices.",
      });
    } catch (error) {
      next(error);
    }
  };
}
