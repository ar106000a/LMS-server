import { Course } from "../../../../generated/prisma/client";
import { CourseRepository } from "../repositories/course.repository";
import { InstructorRepository } from "../repositories/instructor.repository";
import { UpdateCourseDto } from "../dtos/update-course.dto";
import { NotFoundError, ForbiddenError } from "../../../utils/error";
import { generateSlug } from "../../../shared/utils/slug";

export class UpdateCourseService {
  constructor(
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    courseId: string,
    dto: UpdateCourseDto,
  ): Promise<Course> {
    // 1. Locate the target course profile record
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Enforce structural permissions check (Owner vs. Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);

      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to modify this course.",
        );
      }
    }

    // 3. Prepare payload, cleanly scrubbing and ignoring any client-sent status or instructorId injections
    const updatePayload: any = {
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.thumbnailUrl !== undefined && { thumbnailUrl: dto.thumbnailUrl }),
    };

    // 4. Regenerate a unique slug only if the title changes
    if (dto.title && dto.title !== course.title) {
      updatePayload.title = dto.title;

      let newSlug = generateSlug(dto.title);
      let existingCourse = await this.courseRepo.findBySlug(newSlug);

      while (existingCourse) {
        newSlug = generateSlug(dto.title);
        existingCourse = await this.courseRepo.findBySlug(newSlug);
      }

      updatePayload.slug = newSlug;
    }

    // 5. Commit updates cleanly to the database
    return this.courseRepo.update(courseId, updatePayload);
  }
}
