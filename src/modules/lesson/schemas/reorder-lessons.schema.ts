import { z } from "zod";

export const reorderLessonsSchema = z.object({
  body: z.object({
    sectionId: z.string().min(1, "Section ID is required").trim(),
    lessons: z
      .array(
        z.object({
          lessonId: z.string().min(1, "Lesson ID is required").trim(),
          sortOrder: z
            .number()
            .int()
            .min(1, "Sort order must be a positive integer"),
        }),
      )
      .min(1, "At least one lesson must be provided for reordering"),
  }),
});

export type ReorderLessonsSchema = z.infer<typeof reorderLessonsSchema>;
