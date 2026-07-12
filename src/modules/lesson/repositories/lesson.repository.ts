import prisma from "../../../config/prisma";
import {
  Lesson,
  LessonType,
  Prisma,
} from "../../../../generated/prisma/client";
import { ReorderLessonItem } from "../dtos/reorder-lessons.dto";

export class LessonRepository {
  async getNextSortOrder(sectionId: string): Promise<number> {
    const aggregation = await prisma.lesson.aggregate({
      where: { sectionId },
      _max: {
        sortOrder: true,
      },
    });

    const maxOrder = aggregation._max.sortOrder;
    return maxOrder !== null ? maxOrder + 1 : 1;
  }

  async create(data: {
    title: string;
    type: "VIDEO" | "ARTICLE";
    isPreview: boolean;
    sectionId: string;
    sortOrder: number;
  }): Promise<Lesson> {
    const { title, type, isPreview, sectionId, sortOrder } = data;

    // Use a nested operational write to enforce structural integrity
    return prisma.lesson.create({
      data: {
        title,
        type: type as LessonType,
        isPreview,
        sectionId,
        sortOrder,
        // Day-One Guarantee: provision empty child schemas immediately
        videoContent:
          type === "VIDEO"
            ? { create: { videoUrl: "", duration: 0 } }
            : undefined,
        articleContent:
          type === "ARTICLE" ? { create: { bodyText: "" } } : undefined,
      },
      include: {
        videoContent: type === "VIDEO",
        articleContent: type === "ARTICLE",
      },
    });
  }

  async findBySectionId(sectionId: string): Promise<Lesson[]> {
    return prisma.lesson.findMany({
      where: { sectionId },
      orderBy: {
        sortOrder: "asc", // Business Rule: Enforce sequential ordering
      },
      include: {
        videoContent: true, // Dynamically resolves video content metadata if polymorphic type matches
        articleContent: true, // Dynamically resolves article content metadata if polymorphic type matches
      },
    });
  }

  async findById(id: string): Promise<Lesson | null> {
    return prisma.lesson.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.LessonUncheckedUpdateInput,
  ): Promise<Lesson> {
    return prisma.lesson.update({
      where: { id },
      data,
    });
  }
  async delete(id: string): Promise<Lesson> {
    return prisma.lesson.delete({
      where: { id },
    });
  }

  async decrementSortOrdersAfter(
    sectionId: string,
    deletedSortOrder: number,
  ): Promise<void> {
    await prisma.lesson.updateMany({
      where: {
        sectionId,
        sortOrder: {
          gt: deletedSortOrder, // Targets all subsequent items within this specific section container
        },
      },
      data: {
        sortOrder: {
          decrement: 1, // Close the sequence gap atomically
        },
      },
    });
  }

  async updateSortOrders(lessons: ReorderLessonItem[]): Promise<void> {
    // Execute all updates inside a single database transaction block
    await prisma.$transaction(
      lessons.map((item) =>
        prisma.lesson.update({
          where: { id: item.lessonId },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  }

  async countByCourseId(courseId: string): Promise<number> {
    return prisma.lesson.count({
      where: {
        section: {
          courseId: courseId,
        },
      },
    });
  }
}
