import { Response, NextFunction, Request } from "express";
import { CreateSectionSchema } from "../schemas/create-section.schema";
import { CreateSectionService } from "../services/create-section.service";
import { AppError } from "../../../utils/error";

export class CreateSectionController {
  constructor(private createSectionService = new CreateSectionService()) {}

  handle = async (
    req: Request<
      CreateSectionSchema["params"],
      any,
      CreateSectionSchema["body"]
    >,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { courseId } = req.params;

      const section = await this.createSectionService.execute(
        userId,
        role,
        courseId,
        req.body,
      );

      res.status(201).json({
        success: true,
        message: "Section created successfully.",
        data: {
          section,
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
