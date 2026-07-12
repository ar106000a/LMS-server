import { Response, NextFunction, Request } from "express";
import { ReorderSectionsSchema } from "../schemas/reorder-sections.schema";
import { ReorderSectionsService } from "../services/reorder-sections.service";
import { AppError } from "../../../utils/error";

export class ReorderSectionsController {
  constructor(private reorderSectionsService = new ReorderSectionsService()) {}

  handle = async (
    req: Request<any, any, ReorderSectionsSchema["body"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;

      await this.reorderSectionsService.execute(userId, role, req.body);

      res.status(200).json({
        success: true,
        message: "Curriculum sections reordered successfully.",
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
