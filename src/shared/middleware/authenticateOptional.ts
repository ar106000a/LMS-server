import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate";
import { verifyAccessToken } from "../auth/jwt";

export const authenticateOptional = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    let token: string | undefined = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Treat invalid/expired tokens gently on optional routes by degrading to guest status
    req.user = undefined;
    next();
  }
};
