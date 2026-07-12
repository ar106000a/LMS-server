import { Response } from "express";

export function successResponse<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
) {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}
export function errorResponse(
  res: Response,
  message: string,
  statusCode: number = 500,
  code: string = "INTERNAL_ERROR",
) {
  return res.status(statusCode).json({
    success: false,
    error: { message, code },
    timestamp: new Date().toISOString(),
  });
}
