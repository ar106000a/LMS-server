import { z } from "zod";

export const archiveCourseSchema = z.object({
  params: z.object({
    courseId: z
      .string()
      .min(1, "Course ID parameter is required for archiving")
      .trim(),
  }),
});

export type ArchiveCourseSchema = z.infer<typeof archiveCourseSchema>;
