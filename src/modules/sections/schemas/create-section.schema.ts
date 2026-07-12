import { z } from "zod";

export const createSectionSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID parameter is required").trim(),
  }),
  body: z.object({
    title: z
      .string()
      .min(2, "Section title must be at least 2 characters long")
      .max(100)
      .trim(),
  }),
});

export type CreateSectionSchema = z.infer<typeof createSectionSchema>;
