import { z } from "zod";

export const getCourseProgressSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID parameter is required").trim(),
  }),
});

export type GetCourseProgressSchema = z.infer<typeof getCourseProgressSchema>;
