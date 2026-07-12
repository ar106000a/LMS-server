import { z } from "zod";

export const enrollCourseSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID parameter is required").trim(),
  }),
});

export type EnrollCourseSchema = z.infer<typeof enrollCourseSchema>;