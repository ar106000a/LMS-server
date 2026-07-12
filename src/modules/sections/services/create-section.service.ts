import { Section, CourseStatus } from "../../../../generated/prisma/client";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { SectionRepository } from "../repositories/section.repository";
import { CreateSectionDto } from "../dtos/create-section.dto";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../../utils/error";

export class CreateSectionService {
  constructor(
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
    private sectionRepo = new SectionRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    courseId: string,
    dto: CreateSectionDto,
  ): Promise<Section> {
    // 1. Verify parent course existence
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Role & Ownership verification
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to manage this course's curriculum.",
        );
      }
    }

    // 3. Lifecycle Guardrail: block alterations to archived content
    if (course.status === CourseStatus.ARCHIVED) {
      throw new ValidationError("Cannot add sections to an archived course.");
    }

    // 4. Safely calculate the trailing order position index
    const nextSortOrder = await this.sectionRepo.getNextSortOrder(courseId);

    // 5. Commit new section structure to the database
    return this.sectionRepo.create({
      title: dto.title,
      courseId,
      sortOrder: nextSortOrder,
    });
  }
}
