import prisma from "../../../config/prisma";
import {
  Course,
  CourseStatus,
  Prisma,
} from "../../../../generated/prisma/client";

export class CourseRepository {
  async findBySlug(slug: string): Promise<Course | null> {
    return prisma.course.findUnique({
      where: { slug },
    });
  }

  async create(data: Prisma.CourseUncheckedCreateInput): Promise<Course> {
    return prisma.course.create({ data });
  }

  async findManyAndCount(params: {
    skip: number;
    take: number;
    where: Prisma.CourseWhereInput;
    orderBy: Prisma.CourseOrderByWithRelationInput;
  }): Promise<[Course[], number]> {
    // Run both queries in parallel to avoid database bottleneck performance issues
    return prisma.$transaction([
      prisma.course.findMany({
        where: params.where,
        orderBy: params.orderBy,
        skip: params.skip,
        take: Number(params.take),
      }),
      prisma.course.count({
        where: params.where,
      }),
    ]);
  }
  async findById(id: string): Promise<Course | null> {
    return prisma.course.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.CourseUncheckedUpdateInput,
  ): Promise<Course> {
    return prisma.course.update({
      where: { id },
      data,
    });
  }
  async findByIdWithStructure(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            lessons: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: CourseStatus): Promise<Course> {
    return prisma.course.update({
      where: { id },
      data: { status },
    });
  }
  async delete(id: string): Promise<Course> {
    return prisma.course.delete({
      where: { id },
    });
  }
}
