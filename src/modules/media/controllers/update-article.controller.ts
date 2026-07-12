import { Response, NextFunction, Request } from "express";
import { UpdateArticleSchema } from "../schemas/update-article.schema";
import { UpdateArticleService } from "../services/update-article.service";
import { AppError } from "../../../utils/error";

export class UpdateArticleController {
  constructor(private updateArticleService = new UpdateArticleService()) {}

  handle = async (
    req: Request<
      UpdateArticleSchema["params"],
      any,
      UpdateArticleSchema["body"]
    >,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, role } = (req as any).user;
      const { lessonId } = req.params;
      const { bodyText } = req.body;

      const updatedArticle = await this.updateArticleService.execute(
        userId,
        role,
        lessonId,
        bodyText,
      );

      res.status(200).json({
        success: true,
        message: "Article content layout text updated successfully.",
        data: {
          article: updatedArticle,
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
