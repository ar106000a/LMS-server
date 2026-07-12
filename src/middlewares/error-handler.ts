import { NextFunction, Response } from "express";
import { AppError } from "../utils/error";
import { errorResponse } from "../utils/response";

export async function errorHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.message, error.statusCode, error.code);
    }

    //ducktyping for test debugging
    if (error && typeof error === "object" && "statusCode" in error) {
      return errorResponse(
        res,
        (error as any).message,
        (error as any).statusCode,
        (error as any).code,
      );
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return errorResponse(res, "Resource already exists", 409, "CONFLICT");
    }

    console.error("unhandled error:", error);
    return errorResponse(res, "Internal server error", 500, "INTERNAL_ERROR");
  }
}
