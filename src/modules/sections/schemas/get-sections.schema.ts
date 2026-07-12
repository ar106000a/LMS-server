import { z } from "zod";

export const getSectionsSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID parameter is required").trim(),
  }),
});

export type GetSectionsSchema = z.infer<typeof getSectionsSchema>;
