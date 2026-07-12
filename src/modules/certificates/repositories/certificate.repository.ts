import prisma from "../../../config/prisma";
import { Certificate } from "../../../../generated/prisma/client";

export class CertificateRepository {
  async findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<Certificate | null> {
    return prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
  }

  async create(userId: string, courseId: string): Promise<Certificate> {
    return prisma.certificate.create({
      data: {
        userId,
        courseId,
        issuedAt: new Date(),
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    });
  }

  async findByUserId(
    userId: string,
    skip: number,
    take: number,
  ): Promise<Certificate[]> {
    return prisma.certificate.findMany({
      where: { userId },
      skip,
      take,
      orderBy: {
        issuedAt: "desc", // Business Rule: Newest credentials bubble up to the top
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true, // Useful for the frontend to generate a direct link back to the course player
          },
        },
      },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.certificate.count({
      where: { userId },
    });
  }

  async findById(id: string): Promise<Certificate | null> {
    return prisma.certificate.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            title: true,
            description: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
  async findByIdWithRelations(id: string) {
    return prisma.certificate.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });
  }
}
