import { z } from "zod";

export const updateSectionSchema = z.object({
  params: z.object({
    sectionId: z.string().min(1, "Section ID parameter is required").trim(),
  }),
  body: z.object({
    title: z
      .string()
      .min(2, "Section title must be at least 2 characters long")
      .max(100)
      .trim(),
  }),
});

export type UpdateSectionSchema = z.infer<typeof updateSectionSchema>;
