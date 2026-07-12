import { z } from "zod";

export const checkEnrollmentSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID parameter is required").trim(),
  }),
});

export type CheckEnrollmentSchema = z.infer<typeof checkEnrollmentSchema>;
