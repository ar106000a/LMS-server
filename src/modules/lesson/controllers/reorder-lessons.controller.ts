import { Response, NextFunction, Request } from "express";
import { ReorderLessonsSchema } from "../schemas/reorder-lessons.schema";
import { ReorderLessonsService } from "../services/reorder-lessons.service";
import { AppError } from "../../../utils/error";

export class ReorderLessonsController {
  constructor(private reorderLessonsService = new ReorderLessonsService()) {}

  handle = async (
    req: Request<any, any, ReorderLessonsSchema["body"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;

      await this.reorderLessonsService.execute(userId, role, req.body);

      res.status(200).json({
        success: true,
        message: "Lessons reordered successfully.",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
        return;
      }
      next(error);
    }
  };
}
