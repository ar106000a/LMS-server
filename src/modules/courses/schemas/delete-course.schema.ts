import { z } from "zod";

export const deleteCourseSchema = z.object({
  params: z.object({
    courseId: z
      .string()
      .min(1, "Course ID parameter is required for deletion")
      .trim(),
  }),
});

export type DeleteCourseSchema = z.infer<typeof deleteCourseSchema>;
