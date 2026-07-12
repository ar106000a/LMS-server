import { Lesson, CourseStatus } from "../../../../generated/prisma/client";
import { SectionRepository } from "../../sections/repositories/section.repository";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { LessonRepository } from "../repositories/lesson.repository";
import { NotFoundError, ForbiddenError } from "../../../utils/error";

export class GetLessonsService {
  constructor(
    private sectionRepo = new SectionRepository(),
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
    private lessonRepo = new LessonRepository(),
  ) {}

  async execute(
    sectionId: string,
    userContext?: { userId: string; role: string },
  ): Promise<Lesson[]> {
    // 1. Locate the parent section
    const section = await this.sectionRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundError("Section");
    }

    // 2. Locate the parent course container
    const course = await this.courseRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 3. Enforce lifecycle content isolation rules for DRAFT / ARCHIVED elements
    if (course.status !== CourseStatus.PUBLISHED) {
      // Unauthenticated guests cannot access non-public content outlines
      if (!userContext) {
        throw new ForbiddenError(
          "You do not have permission to view this section's content.",
        );
      }

      // Bypass checks immediately for platform managers
      if (userContext.role !== "ADMIN") {
        const instructorProfile = await this.instructorRepo.findByUserId(
          userContext.userId,
        );

        // Verify structural creator profile ownership
        if (
          !instructorProfile ||
          instructorProfile.id !== course.instructorId
        ) {
          throw new ForbiddenError(
            "You do not have permission to view this section's content.",
          );
        }
      }
    }

    // 4. Retrieve database list along with polymorph tables ordered ascending
    return this.lessonRepo.findBySectionId(sectionId);
  }
}
