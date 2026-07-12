import { z } from "zod";

export const deleteSectionSchema = z.object({
  params: z.object({
    sectionId: z.string().min(1, "Section ID parameter is required").trim(),
  }),
});

export type DeleteSectionSchema = z.infer<typeof deleteSectionSchema>;
