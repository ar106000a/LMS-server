import { SectionRepository } from "../../sections/repositories/section.repository";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { LessonRepository } from "../repositories/lesson.repository";
import { ReorderLessonsDto } from "../dtos/reorder-lessons.dto";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../../utils/error";

export class ReorderLessonsService {
  constructor(
    private sectionRepo = new SectionRepository(),
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
    private lessonRepo = new LessonRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    dto: ReorderLessonsDto,
  ): Promise<void> {
    const { sectionId, lessons } = dto;

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

    // 3. Authorization verification (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to modify this curriculum structure.",
        );
      }
    }

    // 4. Business Rule: Ensure sortOrder values are unique within the batch request
    const uniqueSortOrders = new Set(lessons.map((l) => l.sortOrder));
    if (uniqueSortOrders.size !== lessons.length) {
      throw new ValidationError("Duplicate sortOrder values are not allowed.");
    }

    // 5. Fetch actual lessons currently recorded for this section
    const existingLessons = await this.lessonRepo.findBySectionId(sectionId);
    const existingLessonIds = new Set(existingLessons.map((l) => l.id));

    // 6. Business Rule: Verify batch payload size matches database record footprint exactly
    if (lessons.length !== existingLessons.length) {
      throw new ValidationError(
        "The reorder list must contain all lessons belonging to the section.",
      );
    }

    // 7. Business Rule: Confirm every input lessonId belongs strictly to this section container
    const allBelongToSection = lessons.every((item) =>
      existingLessonIds.has(item.lessonId),
    );
    if (!allBelongToSection) {
      throw new ValidationError(
        "One or more lesson IDs are invalid or do not belong to this section.",
      );
    }

    // 8. Commit structural updates safely within the transaction boundary
    await this.lessonRepo.updateSortOrders(lessons);
  }
}
