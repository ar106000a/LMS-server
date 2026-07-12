import { Enrollment } from "../../../../generated/prisma/client";
import { EnrollmentRepository } from "../repositories/enrollments.repository";
import { NotFoundError, AppError } from "../../../utils/error";

export class SuspendEnrollmentService {
  constructor(private enrollmentRepo = new EnrollmentRepository()) {}

  async execute(enrollmentId: string): Promise<Enrollment> {
    // 1. Locate Target Enrollment Record
    const enrollment = await this.enrollmentRepo.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError("Enrollment");
    }

    // 2. Business Rule: Block redundant modification operations
    if (enrollment.status === "SUSPENDED") {
      throw new AppError(
        "This course enrollment track is already in a SUSPENDED state.",
        400,
      );
    }

    // 3. Mutate and Return Updated Record State
    return this.enrollmentRepo.updateStatus(enrollmentId, "SUSPENDED");
  }
}
