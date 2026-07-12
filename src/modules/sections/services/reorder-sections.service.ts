import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { SectionRepository } from "../repositories/section.repository";
import { ReorderSectionsDto } from "../dtos/reorder-sections.dto";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../../utils/error";

export class ReorderSectionsService {
  constructor(
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
    private sectionRepo = new SectionRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    dto: ReorderSectionsDto,
  ): Promise<void> {
    const { courseId, sections } = dto;

    // 1. Verify parent course existence
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Identity and permission clearance (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to modify this curriculum structure.",
        );
      }
    }

    // 3. Business Rule: Ensure sortOrder values are unique within the batch request
    const uniqueSortOrders = new Set(sections.map((s) => s.sortOrder));
    if (uniqueSortOrders.size !== sections.length) {
      throw new ValidationError("Duplicate sortOrder values are not allowed.");
    }

    // 4. Pull actual sections currently recorded for this course in the database
    const existingSections = await this.sectionRepo.findByCourseId(courseId);
    const existingSectionIds = new Set(existingSections.map((s) => s.id));

    // 5. Business Rule: Verify batch payload size matches database record footprint exactly
    if (sections.length !== existingSections.length) {
      throw new ValidationError(
        "The reorder list must contain all sections belonging to the course.",
      );
    }

    // 6. Business Rule: Confirm every input sectionId belongs strictly to this course container
    const allBelongToCourse = sections.every((item) =>
      existingSectionIds.has(item.sectionId),
    );
    if (!allBelongToCourse) {
      throw new ValidationError(
        "One or more section IDs are invalid or do not belong to this course.",
      );
    }

    // 7. Commit changes safely inside the transaction boundary
    await this.sectionRepo.updateSortOrders(sections);
  }
}
