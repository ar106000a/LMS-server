import { Enrollment } from "../../../../generated/prisma/client";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { EnrollmentRepository } from "../repositories/enrollments.repository";
import { NotFoundError } from "../../../utils/error";

export class CheckEnrollmentService {
  constructor(
    private courseRepo = new CourseRepository(),
    private enrollmentRepo = new EnrollmentRepository(),
  ) {}

  async execute(userId: string, courseId: string): Promise<Enrollment | null> {
    // 1. Structural Layer Verification
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Fetch the student's status mapping directly (Returns object data or null)
    return this.enrollmentRepo.findByUserAndCourse(userId, courseId);
  }
}
