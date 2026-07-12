import { z } from "zod";

export const getMyCertificatesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 10)),
  }),
});

export type GetMyCertificatesSchema = z.infer<typeof getMyCertificatesSchema>;
