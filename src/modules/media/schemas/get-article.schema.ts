import { z } from "zod";

export const getArticleSchema = z.object({
  params: z.object({
    lessonId: z.string().min(1, "Lesson ID parameter is required").trim(),
  }),
});

export type GetArticleSchema = z.infer<typeof getArticleSchema>;
