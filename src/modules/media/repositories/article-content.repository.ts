import prisma from "../../../config/prisma";
import { ArticleContent } from "../../../../generated/prisma/client";

export class ArticleContentRepository {
  async updateByLessonId(
    lessonId: string,
    bodyText: string,
  ): Promise<ArticleContent> {
    return prisma.articleContent.update({
      where: { lessonId },
      data: { bodyText },
    });
  }

  async findByLessonId(lessonId: string): Promise<ArticleContent | null> {
    return prisma.articleContent.findUnique({
      where: { lessonId },
    });
  }
}
