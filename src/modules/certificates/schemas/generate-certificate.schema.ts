import { z } from "zod";

export const generateCertificateSchema = z.object({
  params: z.object({
    courseId: z
      .string()
      .min(1, "Course ID parameter is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
      .trim(),
  }),
});

export type GenerateCertificateSchema = z.infer<
  typeof generateCertificateSchema
>;
