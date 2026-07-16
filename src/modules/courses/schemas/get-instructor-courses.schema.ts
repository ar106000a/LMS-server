import { z } from "zod";

export const getInstructorCoursesSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().min(1).optional().default(1),
      limit: z.coerce.number().min(1).max(50).optional().default(10),
      status: z.string().optional(), // Could be strictly typed to CourseStatus enum if you prefer
    })
    .optional(),
});

export type GetInstructorCoursesSchema = z.infer<typeof getInstructorCoursesSchema>;