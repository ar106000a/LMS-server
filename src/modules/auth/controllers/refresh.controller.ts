import { Request, Response, NextFunction } from "express";
import { RefreshService } from "../services/refresh.service";
import { AppError, ValidationError } from "../../../utils/error";
import { env } from "../../../config/env";

export class RefreshController {
  constructor(private refreshService = new RefreshService()) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // 1. Extract refresh token from HttpOnly cookies
      const rawRefreshToken = req.cookies?.refreshToken;
      if (!rawRefreshToken) {
        throw new ValidationError("Token is absent!");
      }

      // 2. Delegate parsing and database rotation to service layer
      const result = await this.refreshService.execute(rawRefreshToken);

      // 3. Overwrite cookies with newly rotated tokens
      // res.cookie("accessToken", result.accessToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: "strict",
      //   maxAge: 15 * 60 * 1000, // 15 mins
      // });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
        expires: result.refreshTokenExpiresAt,
      });

      // 4. Return success status code
      res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully.",
        accessToken: result.accessToken,
        user: result.user,
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
