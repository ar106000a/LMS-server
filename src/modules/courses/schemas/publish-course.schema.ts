import { z } from "zod";

export const publishCourseSchema = z.object({
  params: z.object({
    courseId: z
      .string()
      .min(1, "Course ID parameter is required for publication")
      .trim(),
  }),
});

export type PublishCourseSchema = z.infer<typeof publishCourseSchema>;
