import { z } from "zod";

export const uploadVideoSchema = z.object({
  params: z.object({
    lessonId: z.string().min(1, "Lesson ID parameter is required").trim(),
  }),
});

export type UploadVideoSchema = z.infer<typeof uploadVideoSchema>;
