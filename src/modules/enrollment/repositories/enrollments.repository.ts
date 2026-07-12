import prisma from "../../../config/prisma";
import { Enrollment } from "../../../../generated/prisma/client";

export class EnrollmentRepository {
  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
    return !!enrollment;
  }

  async findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    return prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
  }

  async create(userId: string, courseId: string): Promise<Enrollment> {
    return prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: "ACTIVE", // Business Rule: Initial entry footprint must be explicitly ACTIVE
      },
    });
  }

  async findByUserId(
    userId: string,
    filters: {
      status?: "ACTIVE" | "COMPLETED" | "SUSPENDED";
      skip: number;
      limit: number;
    },
  ): Promise<any[]> {
    return prisma.enrollment.findMany({
      where: {
        userId,
        ...(filters.status && { status: filters.status }),
      },
      orderBy: {
        enrolledAt: "desc", // Business Rule: Always return newest selections first
      },
      skip: filters.skip,
      take: filters.limit,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            subtitle: true,
            thumbnailUrl: true,
            status: true,
          },
        },
      },
    });
  }

  async countByUserId(
    userId: string,
    status?: "ACTIVE" | "COMPLETED" | "SUSPENDED",
  ): Promise<number> {
    return prisma.enrollment.count({
      where: {
        userId,
        ...(status && { status }),
      },
    });
  }

  async findById(id: string): Promise<Enrollment | null> {
    return prisma.enrollment.findUnique({
      where: { id },
    });
  }

  async updateStatus(
    id: string,
    status: "ACTIVE" | "COMPLETED" | "SUSPENDED",
  ): Promise<Enrollment> {
    return prisma.enrollment.update({
      where: { id },
      data: { status },
    });
  }

  async updateProgress(
    id: string,
    progressPercent: number,
    status?: "ACTIVE" | "COMPLETED",
  ): Promise<Enrollment> {
    return prisma.enrollment.update({
      where: { id },
      data: {
        progressPercent,
        ...(status && { status }),
      },
    });
  }
}
