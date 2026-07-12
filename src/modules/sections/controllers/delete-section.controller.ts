import { Response, NextFunction, Request } from "express";
import { DeleteSectionSchema } from "../schemas/delete-section.schema";
import { DeleteSectionService } from "../services/delete-section.service";
import { AppError } from "../../../utils/error";

export class DeleteSectionController {
  constructor(private deleteSectionService = new DeleteSectionService()) {}

  handle = async (
    req: Request<DeleteSectionSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { sectionId } = req.params;

      await this.deleteSectionService.execute(userId, role, sectionId);

      // Return explicit 204 No Content clean payload structure
      res.status(204).send();
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
