import {
  CourseStatus,
  Course,
  Prisma,
} from "../../../../generated/prisma/client";
import { CourseRepository } from "../repositories/course.repository";
import { GetCoursesDto } from "../dtos/get-courses.dto";

interface PaginatedCoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class GetCoursesService {
  constructor(private courseRepo = new CourseRepository()) {}

  async execute(dto: GetCoursesDto): Promise<PaginatedCoursesResponse> {
    const { page, limit, search, sort, order, minPrice, maxPrice } = dto;

    const skip = (page - 1) * limit;
    const take = limit;

    // 1. Enforce strict visibility isolation: Lock state down to PUBLISHED only
    const whereClause: Prisma.CourseWhereInput = {
      status: CourseStatus.PUBLISHED,
    };

    // 2. Map textual query params safely into standard search filters
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // 3. Build range logic constraints if price limits are set
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    // 4. Set dynamically parsed sorting order configurations
    const orderByClause: Prisma.CourseOrderByWithRelationInput = {
      [sort]: order,
    };

    // 5. Fetch dataset arrays from repository layer
    const [courses, totalCount] = await this.courseRepo.findManyAndCount({
      skip,
      take,
      where: whereClause,
      orderBy: orderByClause,
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      courses,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    };
  }
}
