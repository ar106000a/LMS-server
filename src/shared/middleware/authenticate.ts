import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/error";
import { verifyAccessToken } from "..//auth/jwt";

// Extend Express Request type to include the authenticated user payload
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    let token: string | undefined = req.cookies?.accessToken;

    // 1. Fallback: Check Authorization Header if cookie isn't present
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. If no token is found anywhere, block the request
    if (!token) {
      throw new AppError("Authentication required. Please log in.", 401);
    }

    // 3. Verify the token signature and expiration
    try {
      const decoded = verifyAccessToken(token);

      // 4. Attach the decoded payload directly to the request object
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };

      next();
    } catch (error) {
      // Catch token expiration or tampering specifically
      throw new AppError("Invalid or expired access token.", 401);
    }
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};
