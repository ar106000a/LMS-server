import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate";
import { AppError } from "../../utils/error";

export const authorize = (...allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    try {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        throw new AppError(
          "Access denied. You do not have permission to access this resource.",
          403,
        );
      }
      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      next(error);
    }
  };
};
