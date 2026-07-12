import prisma from "../../../config/prisma";
import { LessonProgress } from "../../../../generated/prisma/client";

export class LessonProgressRepository {
  async findByUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<LessonProgress | null> {
    return prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });
  }

  // Included courseId into the initialization parameters
  async create(
    userId: string,
    lessonId: string,
    courseId: string,
    completedAt: Date,
  ): Promise<LessonProgress> {
    return prisma.lessonProgress.create({
      data: {
        userId,
        lessonId,
        courseId, // Enforces compliance with your mandatory schema relation
        completedAt,
      },
    });
  }

  async countCompletedLessons(
    userId: string,
    courseId: string,
  ): Promise<number> {
    return prisma.lessonProgress.count({
      where: {
        userId,
        courseId, // Simplifies this check completely since the field is local!
        completedAt: { not: null },
      },
    });
  }
  async findCompletedLessonIds(
    userId: string,
    courseId: string,
  ): Promise<string[]> {
    const progressRecords = await prisma.lessonProgress.findMany({
      where: {
        userId,
        courseId,
        completedAt: { not: null }, // Matches our implicit completion design pattern
      },
      select: {
        lessonId: true,
      },
    });

    // Flatten data down into a string array of raw IDs for client-side evaluation convenience
    return progressRecords.map((record) => record.lessonId);
  }
}
