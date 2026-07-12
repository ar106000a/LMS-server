import { z } from "zod";

export const deleteLessonSchema = z.object({
  params: z.object({
    lessonId: z.string().min(1, "Lesson ID parameter is required").trim(),
  }),
});

export type DeleteLessonSchema = z.infer<typeof deleteLessonSchema>;
