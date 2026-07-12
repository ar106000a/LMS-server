import { SectionRepository } from "../repositories/section.repository";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { NotFoundError, ForbiddenError } from "../../../utils/error";

export class DeleteSectionService {
  constructor(
    private sectionRepo = new SectionRepository(),
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    sectionId: string,
  ): Promise<void> {
    // 1. Locate the target section record
    const section = await this.sectionRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundError("Section");
    }

    // 2. Identify and resolve the parent course mapping
    const course = await this.courseRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 3. Evaluate identity clearance parameters (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to delete this curriculum section.",
        );
      }
    }

    // 4. Wipe out the target section (Cascades natively to clear child lessons)
    await this.sectionRepo.delete(sectionId);

    // 5. Shift trailing order positions up to preserve contiguous indexing
    await this.sectionRepo.decrementSortOrdersAfter(
      section.courseId,
      section.sortOrder,
    );
  }
}
