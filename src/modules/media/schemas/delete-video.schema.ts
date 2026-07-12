import { z } from "zod";

export const deleteVideoSchema = z.object({
  params: z.object({
    lessonId: z.string().min(1, "Lesson ID parameter is required").trim(),
  }),
});

export type DeleteVideoSchema = z.infer<typeof deleteVideoSchema>;
