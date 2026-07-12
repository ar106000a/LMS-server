import { Lesson } from "../../../../generated/prisma/client";
import { SectionRepository } from "../../sections/repositories/section.repository";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { LessonRepository } from "../repositories/lesson.repository";
import { CreateLessonDto } from "../dtos/create-lesson.dto";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../../utils/error";

export class CreateLessonService {
  constructor(
    private sectionRepo = new SectionRepository(),
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
    private lessonRepo = new LessonRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    sectionId: string,
    dto: CreateLessonDto,
  ): Promise<Lesson> {
    // 1. Locate parent section
    const section = await this.sectionRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundError("Section");
    }

    // 2. Locate top-level course container
    const course = await this.courseRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 3. Authorization check (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to add lessons to this curriculum.",
        );
      }
    }

    // 4. Lifecycle Guardrail: block alterations to archived content
    if (course.status === "ARCHIVED") {
      throw new ValidationError(
        "Cannot create lessons within an archived course.",
      );
    }

    // 5. Calculate sequential trailing position within the section container
    const nextSortOrder = await this.lessonRepo.getNextSortOrder(sectionId);

    // 6. Commit lesson along with its empty polymorphic child rows
    return this.lessonRepo.create({
      title: dto.title,
      type: dto.type,
      isPreview: dto.isPreview,
      sectionId,
      sortOrder: nextSortOrder,
    });
  }
}
