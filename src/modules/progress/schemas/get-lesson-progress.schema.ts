import { z } from "zod";

export const getLessonProgressSchema = z.object({
  params: z.object({
    lessonId: z.string().min(1, "Lesson ID parameter is required").trim(),
  }),
});

export type GetLessonProgressSchema = z.infer<typeof getLessonProgressSchema>;
