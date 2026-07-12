import { z } from "zod";

export const completeEnrollmentSchema = z.object({
  params: z.object({
    enrollmentId: z.string().min(1, "Enrollment ID parameter is required").trim(),
  }),
});

export type CompleteEnrollmentSchema = z.infer<typeof completeEnrollmentSchema>;