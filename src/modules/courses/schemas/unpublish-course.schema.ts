import { z } from "zod";

export const unpublishCourseSchema = z.object({
  params: z.object({
    courseId: z
      .string()
      .min(1, "Course ID parameter is required for unpublishing")
      .trim(),
  }),
});

export type UnpublishCourseSchema = z.infer<typeof unpublishCourseSchema>;
