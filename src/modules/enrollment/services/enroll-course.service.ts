import { Enrollment } from "../../../../generated/prisma/client";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { EnrollmentRepository } from "../repositories/enrollments.repository";
import { NotFoundError, ValidationError, AppError } from "../../../utils/error";

export class EnrollCourseService {
  constructor(
    private courseRepo = new CourseRepository(),
    private enrollmentRepo = new EnrollmentRepository()
  ) {}

  async execute(userId: string, courseId: string): Promise<Enrollment> {
    // 1. Locate Course Context
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Business Rule: Disallow user acquisition of un-published content paths
    if (course.status !== "PUBLISHED") {
      throw new ValidationError("Cannot enroll in an unpublished course.");
    }

    // 3. Business Rule: Strictly enforce 1-to-1 singular enrollment mappings per student user context
    const existingEnrollment = await this.enrollmentRepo.findByUserAndCourse(userId, courseId);
    if (existingEnrollment) {
      // 409 Conflict equivalent using a generic structured custom operational application error block
      throw new AppError("You are already actively enrolled within this course track framework.", 409);
    }

    // Future Payment Verification integration hooks insert cleanly right here:
    // await this.paymentService.verifyTransaction(userId, courseId);

    // 4. Record Initialization inside structural data tables
    return this.enrollmentRepo.create(userId, courseId);
  }
}