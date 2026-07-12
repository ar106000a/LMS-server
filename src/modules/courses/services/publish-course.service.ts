import { CourseStatus, Course } from "../../../../generated/prisma/client";
import { CourseRepository } from "../repositories/course.repository";
import { InstructorRepository } from "../repositories/instructor.repository";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../../utils/error";

export class PublishCourseService {
  constructor(
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    courseId: string,
  ): Promise<Course> {
    // 1. Fetch course along with its nested sections and lessons structure
    const course = await this.courseRepo.findByIdWithStructure(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Evaluate access privileges (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to publish this course.",
        );
      }
    }

    // 3. Idempotency Guard: Stop processing if the course is already live
    if (course.status === CourseStatus.PUBLISHED) {
      throw new ValidationError("This course is already published.");
    }

    // 4. MVP Structural Check: Verify required baseline metadata fields are populated
    if (!course.title.trim() || !course.description.trim()) {
      throw new ValidationError(
        "Course must have a complete title and description before going live.",
      );
    }

    // 5. MVP Layout Integrity: Ensure the course contains sections
    if (!course.sections || course.sections.length === 0) {
      throw new ValidationError(
        "Course cannot be published without at least one section layout.",
      );
    }

    // 6. MVP Lesson Footprint Check: Ensure there is at least one lesson inside those sections
    const absoluteLessonCount = course.sections.reduce(
      (acc, section) => acc + (section.lessons?.length || 0),
      0,
    );

    if (absoluteLessonCount === 0) {
      throw new ValidationError(
        "Course must contain at least one lesson before it can be published.",
      );
    }

    // 7. Transition status and record changes in the database
    return this.courseRepo.updateStatus(courseId, CourseStatus.PUBLISHED);
  }
}
