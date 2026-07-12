import { Section, CourseStatus } from "../../../../generated/prisma/client";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { SectionRepository } from "../repositories/section.repository";
import { NotFoundError, ForbiddenError } from "../../../utils/error";

export class GetSectionsService {
  constructor(
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
    private sectionRepo = new SectionRepository(),
  ) {}

  async execute(
    courseId: string,
    userContext?: { userId: string; role: string },
  ): Promise<Section[]> {
    // 1. Verify parent course exists
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Enforce visibility isolation rules for DRAFT or ARCHIVED elements
    if (course.status !== CourseStatus.PUBLISHED) {
      // Public guest visits are blocked from viewing non-published outlines
      if (!userContext) {
        throw new ForbiddenError(
          "You do not have permission to view this course's curriculum outline.",
        );
      }

      // Allow platform admins to pass through instantly
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
            "You do not have permission to view this course's curriculum outline.",
          );
        }
      }
    }

    // 3. Retrieve database collection array sorted cleanly in ascending sequence
    return this.sectionRepo.findByCourseId(courseId);
  }
}
