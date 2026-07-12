import prisma from "../../../config/prisma";
import { Section, Prisma } from "../../../../generated/prisma/client";
import { ReorderSectionItem } from "../dtos/reorder-sections.dto";

export class SectionRepository {
  async getNextSortOrder(courseId: string): Promise<number> {
    const aggregation = await prisma.section.aggregate({
      where: { courseId },
      _max: {
        sortOrder: true,
      },
    });

    const maxOrder = aggregation._max.sortOrder;
    // If no sections exist yet, start the sequence at 1
    return maxOrder !== null ? maxOrder + 1 : 1;
  }

  async create(data: Prisma.SectionUncheckedCreateInput): Promise<Section> {
    return prisma.section.create({
      data,
    });
  }
  async findByCourseId(courseId: string): Promise<Section[]> {
    return prisma.section.findMany({
      where: { courseId },
      orderBy: {
        sortOrder: "asc", // Business Rule: Enforce ascending sequential order
      },
    });
  }
  async findById(id: string): Promise<Section | null> {
    return prisma.section.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.SectionUncheckedUpdateInput,
  ): Promise<Section> {
    return prisma.section.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Section> {
    return prisma.section.delete({
      where: { id },
    });
  }

  async decrementSortOrdersAfter(
    courseId: string,
    deletedSortOrder: number,
  ): Promise<void> {
    await prisma.section.updateMany({
      where: {
        courseId,
        sortOrder: {
          gt: deletedSortOrder, // Target all subsequent items in the course sequence
        },
      },
      data: {
        sortOrder: {
          decrement: 1, // Shift down atomically to close the index gap
        },
      },
    });
  }

  async updateSortOrders(sections: ReorderSectionItem[]): Promise<void> {
    // Execute all updates inside a single isolated transaction block
    await prisma.$transaction(
      sections.map((item) =>
        prisma.section.update({
          where: { id: item.sectionId },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  }
}
