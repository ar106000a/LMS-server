import { z } from "zod";

export const getCourseBySlugSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .min(1, "Course slug identifier parameter is required")
      .trim(),
  }),
});

export type GetCourseBySlugSchema = z.infer<typeof getCourseBySlugSchema>;
