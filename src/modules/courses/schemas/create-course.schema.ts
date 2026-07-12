import { z } from "zod";

export const createCourseSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(100)
      .trim(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .trim(),
    price: z.number().min(0, "Price cannot be a negative value"),
    thumbnailUrl: z.url("Invalid thumbnail image URL format").optional(),
  }),
});

export type CreateCourseSchema = z.infer<typeof createCourseSchema>;
