import { z } from "zod";

export const getMyEnrollmentsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default("1")
      .transform((val) => {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) || parsed < 1 ? 1 : parsed;
      }),
    limit: z
      .string()
      .optional()
      .default("10")
      .transform((val) => {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) || parsed < 1 ? 10 : parsed;
      }),
    status: z.enum(["ACTIVE", "COMPLETED", "SUSPENDED"]).optional(),
  }),
});

export type GetMyEnrollmentsSchema = z.infer<typeof getMyEnrollmentsSchema>;