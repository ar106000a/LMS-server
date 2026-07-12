import { z } from "zod";

export const updateArticleSchema = z.object({
  params: z.object({
    lessonId: z.string().min(1, "Lesson ID parameter is required").trim(),
  }),
  body: z.object({
    bodyText: z.string({
      error: "Body content text string is required",
    }),
  }),
});

export type UpdateArticleSchema = z.infer<typeof updateArticleSchema>;
