import { z } from "zod";

export const updateCourseSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID parameter is required").trim(),
  }),
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(100)
      .trim()
      .optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .trim()
      .optional(),
    price: z.number().min(0, "Price cannot be a negative value").optional(),
    thumbnailUrl: z

      .url("Invalid thumbnail image URL format")
      .nullable()
      .optional(),
  }),
});

export type UpdateCourseSchema = z.infer<typeof updateCourseSchema>;
