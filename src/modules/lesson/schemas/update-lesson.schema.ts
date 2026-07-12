import { z } from "zod";

export const updateLessonSchema = z.object({
  params: z.object({
    lessonId: z.string().min(1, "Lesson ID parameter is required").trim(),
  }),
  body: z.object({
    title: z
      .string()
      .min(2, "Lesson title must be at least 2 characters long")
      .max(150)
      .trim()
      .optional(),
    isPreview: z.boolean().optional(),
  }),
});

export type UpdateLessonSchema = z.infer<typeof updateLessonSchema>;
