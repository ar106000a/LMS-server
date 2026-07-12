import { Course } from "../../../../generated/prisma/client";
import { CourseRepository } from "../repositories/course.repository";
import { InstructorRepository } from "../repositories/instructor.repository";
import { NotFoundError, ForbiddenError } from "../../../utils/error";

export class DeleteCourseService {
  constructor(
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    courseId: string,
  ): Promise<void> {
    // 1. Locate target record
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Access control verification (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to delete this course.",
        );
      }
    }

    // 3. Trigger hard deletion (Prisma cascading rules clean up sections/lessons automatically)
    await this.courseRepo.delete(courseId);
  }
}
