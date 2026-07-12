import { z } from "zod";

export const getLessonsSchema = z.object({
  params: z.object({
    sectionId: z.string().min(1, "Section ID parameter is required").trim(),
  }),
});

export type GetLessonsSchema = z.infer<typeof getLessonsSchema>;
