import { Request, Response, NextFunction } from "express";
import { LoginService } from "../services/login.service";
import { AppError } from "../../../utils/error";
import { env } from "../../../config/env";

export class LoginController {
  constructor(private loginService = new LoginService()) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await this.loginService.execute({
        email,
        password,
        ipAddress,
        userAgent,
      });

      // Set HTTP-Only cookies for tokens
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
        // short expiration for access token (e.g., 15 minutes)
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
        expires: result.refreshTokenExpiresAt,
      });

      // Send the public user profile data back
      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
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
