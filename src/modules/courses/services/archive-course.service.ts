import { CourseStatus, Course } from "../../../../generated/prisma/client";
import { CourseRepository } from "../repositories/course.repository";
import { InstructorRepository } from "../repositories/instructor.repository";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../../utils/error";

export class ArchiveCourseService {
  constructor(
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    courseId: string,
  ): Promise<Course> {
    // 1. Locate the course profile record
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Validate user authorization context (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to archive this course.",
        );
      }
    }

    // 3. Idempotency Guard: Terminate processing if the course is already archived
    if (course.status === CourseStatus.ARCHIVED) {
      throw new ValidationError("This course is already archived.");
    }

    // 4. Update the lifecycle status state to ARCHIVED
    return this.courseRepo.updateStatus(courseId, CourseStatus.ARCHIVED);
  }
}
