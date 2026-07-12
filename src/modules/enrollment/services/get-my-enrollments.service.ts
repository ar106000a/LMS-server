import { EnrollmentRepository } from "../repositories/enrollments.repository";

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GetEnrollmentsResponse {
  enrollments: any[];
  pagination: PaginationMeta;
}

export class GetMyEnrollmentsService {
  constructor(private enrollmentRepo = new EnrollmentRepository()) {}

  async execute(
    userId: string,
    query: {
      page: number;
      limit: number;
      status?: "ACTIVE" | "COMPLETED" | "SUSPENDED";
    },
  ): Promise<GetEnrollmentsResponse> {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    // Run count and dataset reads concurrently to optimize database access speeds
    const [enrollments, totalRecords] = await Promise.all([
      this.enrollmentRepo.findByUserId(userId, { status, skip, limit }),
      this.enrollmentRepo.countByUserId(userId, status),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      enrollments,
      pagination: {
        total: totalRecords,
        page,
        limit,
        totalPages: totalPages === 0 ? 1 : totalPages,
      },
    };
  }
}
