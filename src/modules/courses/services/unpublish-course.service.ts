import { CourseStatus, Course } from "../../../../generated/prisma/client";
import { CourseRepository } from "../repositories/course.repository";
import { InstructorRepository } from "../repositories/instructor.repository";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../../utils/error";

export class UnpublishCourseService {
  constructor(
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    courseId: string,
  ): Promise<Course> {
    // 1. Locate the course
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Access control check (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to unpublish this course.",
        );
      }
    }

    // 3. State integrity check: Prevent unpublishing archived content
    if (course.status === CourseStatus.ARCHIVED) {
      throw new ValidationError("Cannot unpublish an archived course.");
    }

    // 4. Idempotency guard: Stop if the course is already a draft
    if (course.status === CourseStatus.DRAFT) {
      throw new ValidationError("This course is already in draft status.");
    }

    // 5. Demote status back to DRAFT, pulling it from the public catalog search view
    return this.courseRepo.updateStatus(courseId, CourseStatus.DRAFT);
  }
}
