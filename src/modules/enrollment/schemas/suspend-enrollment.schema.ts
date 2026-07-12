import { z } from "zod";

export const suspendEnrollmentSchema = z.object({
  params: z.object({
    enrollmentId: z
      .string()
      .min(1, "Enrollment ID parameter is required")
      .trim(),
  }),
});

export type SuspendEnrollmentSchema = z.infer<typeof suspendEnrollmentSchema>;
