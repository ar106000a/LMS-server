import { Response, NextFunction, Request } from "express";
import { GetArticleSchema } from "../schemas/get-article.schema";
import { GetArticleService } from "../services/get-article.service";
import { AppError } from "../../../utils/error";

export class GetArticleController {
  constructor(private getArticleService = new GetArticleService()) {}

  handle = async (
    req: Request<GetArticleSchema["params"]>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { lessonId } = req.params;
      const userContext = (req as any).user; // Intercepted cleanly by authenticateOptional

      const bodyText = await this.getArticleService.execute(
        lessonId,
        userContext,
      );

      res.status(200).json({
        success: true,
        message: "Article content read operation executed successfully.",
        data: {
          bodyText,
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
