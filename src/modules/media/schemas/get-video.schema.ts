import { z } from "zod";

export const getVideoSchema = z.object({
  params: z.object({
    lessonId: z.string().min(1, "Lesson ID parameter is required").trim(),
  }),
});

export type GetVideoSchema = z.infer<typeof getVideoSchema>;
