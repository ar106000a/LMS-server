import { z } from "zod";

export const createLessonSchema = z.object({
  params: z.object({
    sectionId: z.string().min(1, "Section ID parameter is required").trim(),
  }),
  body: z.object({
    title: z
      .string()
      .min(2, "Lesson title must be at least 2 characters long")
      .max(150)
      .trim(),
    type: z.enum(["VIDEO", "ARTICLE"], {
      error: () => "Lesson type must be either VIDEO or ARTICLE",
    }),
    isPreview: z.boolean().default(false),
  }),
});

export type CreateLessonSchema = z.infer<typeof createLessonSchema>;
