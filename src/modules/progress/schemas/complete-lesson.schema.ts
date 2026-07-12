import { z } from "zod";

export const completeLessonSchema = z.object({
  params: z.object({
    lessonId: z.string().min(1, "Lesson ID parameter is required").trim(),
  }),
});

export type CompleteLessonSchema = z.infer<typeof completeLessonSchema>;
