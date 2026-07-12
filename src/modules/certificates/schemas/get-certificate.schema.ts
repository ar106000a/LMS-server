import { z } from "zod";

export const getCertificateSchema = z.object({
  params: z.object({
    certificateId: z
      .string()
      .min(1, "Certificate ID parameter is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
      .trim(),
  }),
});

export type GetCertificateSchema = z.infer<typeof getCertificateSchema>;
