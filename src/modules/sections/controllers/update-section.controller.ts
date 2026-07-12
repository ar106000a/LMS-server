import { Response, NextFunction, Request } from "express";
import { UpdateSectionSchema } from "../schemas/update-section.schema";
import { UpdateSectionService } from "../services/update-section.service";
import { AppError } from "../../../utils/error";

export class UpdateSectionController {
  constructor(private updateSectionService = new UpdateSectionService()) {}

  handle = async (
    req: Request<
      UpdateSectionSchema["params"],
      any,
      UpdateSectionSchema["body"]
    >,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { sectionId } = req.params;

      const updatedSection = await this.updateSectionService.execute(
        userId,
        role,
        sectionId,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: "Section updated successfully.",
        data: {
          section: updatedSection,
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
