import { Certificate } from "../../../../generated/prisma/client";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { EnrollmentRepository } from "../../enrollment/repositories/enrollments.repository";
import { CertificateRepository } from "../repositories/certificate.repository";
import { NotFoundError, AppError, ForbiddenError } from "../../../utils/error";

export class GenerateCertificateService {
  constructor(
    private courseRepo = new CourseRepository(),
    private enrollmentRepo = new EnrollmentRepository(),
    private certificateRepo = new CertificateRepository(),
  ) {}

  async execute(userId: string, courseId: string): Promise<Certificate> {
    // 1. Verify target course exists
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Locate target enrollment profile mapping
    const enrollment = await this.enrollmentRepo.findByUserAndCourse(
      userId,
      courseId,
    );
    if (!enrollment) {
      throw new NotFoundError("Enrollment");
    }

    // 3. Business Rule: Block issuance if the course milestones are incomplete
    if (enrollment.status !== "COMPLETED") {
      throw new AppError(
        "Certificate locked. You must fulfill all course requirements and lessons before claiming.",
        400,
      );
    }

    // 4. Idempotency Check: Intercept request if certificate was already generated
    const existingCertificate = await this.certificateRepo.findByUserAndCourse(
      userId,
      courseId,
    );
    if (existingCertificate) {
      return existingCertificate; // Returns the existing certificate directly to prevent error states
    }

    // 5. Mint new immutable validation record
    return this.certificateRepo.create(userId, courseId);
  }
}
