import { z } from "zod";

export const updateVideoSchema = z.object({
  params: z.object({
    lessonId: z.string().min(1, "Lesson ID parameter is required").trim(),
  }),
});

export type UpdateVideoSchema = z.infer<typeof updateVideoSchema>;
