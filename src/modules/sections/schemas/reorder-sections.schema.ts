import { z } from "zod";

export const reorderSectionsSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, "Course ID parameter is required").trim(),
    sections: z
      .array(
        z.object({
          sectionId: z.string().min(1, "Section ID is required").trim(),
          sortOrder: z
            .number()
            .int()
            .min(1, "Sort order must be a positive integer"),
        }),
      )
      .min(1, "At least one section must be provided for reordering"),
  }),
});

export type ReorderSectionsSchema = z.infer<typeof reorderSectionsSchema>;
