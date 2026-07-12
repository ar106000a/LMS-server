import { z } from "zod";

export const getCoursesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(100, "Maximum limit allowed is 100")
      .default(10),
    search: z.string().trim().optional(),
    sort: z.enum(["createdAt", "price", "title"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    minPrice: z.coerce
      .number()
      .min(0, "Minimum price cannot be negative")
      .optional(),
    maxPrice: z.coerce
      .number()
      .min(0, "Maximum price cannot be negative")
      .optional(),
  }),
});

export type GetCoursesSchema = z.infer<typeof getCoursesSchema>;
