import { Section } from "../../../../generated/prisma/client";
import { SectionRepository } from "../repositories/section.repository";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { UpdateSectionDto } from "../dtos/update-section.dto";
import { NotFoundError, ForbiddenError } from "../../../utils/error";

export class UpdateSectionService {
  constructor(
    private sectionRepo = new SectionRepository(),
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    sectionId: string,
    dto: UpdateSectionDto,
  ): Promise<Section> {
    // 1. Locate the target section
    const section = await this.sectionRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundError("Section");
    }

    // 2. Resolve upward to find the parent course container
    const course = await this.courseRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 3. Authorization check (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to modify this section.",
        );
      }
    }

    // 4. Update the section title exclusively (ignoring other metadata inputs)
    return this.sectionRepo.update(sectionId, {
      title: dto.title,
    });
  }
}
