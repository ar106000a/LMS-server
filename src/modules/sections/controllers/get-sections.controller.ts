import { Response, NextFunction, Request } from "express";
import { GetSectionsSchema } from "../schemas/get-sections.schema";
import { GetSectionsService } from "../services/get-sections.service";
import { AppError } from "../../../utils/error";

export class GetSectionsController {
  constructor(private getSectionsService = new GetSectionsService()) {}

  handle = async (
    req: Request<GetSectionsSchema["params"]>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userContext = (req as any).user; // Populated optionally via authenticateOptional

      const sections = await this.getSectionsService.execute(courseId, userContext);

      res.status(200).json({
        success: true,
        message: "Sections retrieved successfully.",
        data: {
          sections,
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