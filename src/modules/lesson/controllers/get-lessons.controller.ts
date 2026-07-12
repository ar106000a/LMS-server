import { Response, NextFunction, Request } from "express";
import { GetLessonsSchema } from "../schemas/get-lessons.schema";
import { GetLessonsService } from "../services/get-lessons.service";
import { AppError } from "../../../utils/error";

export class GetLessonsController {
  constructor(private getLessonsService = new GetLessonsService()) {}

  handle = async (
    req: Request<GetLessonsSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sectionId } = req.params;
      const userContext = (req as any).user; // Safely populated via authenticateOptional middleware pipeline

      const lessons = await this.getLessonsService.execute(
        sectionId,
        userContext,
      );

      res.status(200).json({
        success: true,
        message: "Lessons retrieved successfully.",
        data: {
          lessons,
        },
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
