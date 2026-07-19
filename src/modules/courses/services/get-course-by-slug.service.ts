import { CourseStatus, Course } from "../../../../generated/prisma/client";
import { CourseRepository } from "../repositories/course.repository";
import { InstructorRepository } from "../repositories/instructor.repository";
import { NotFoundError } from "../../../utils/error";

export class GetCourseBySlugService {
  constructor(
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
  ) {}

  async execute(
    slug: string,
    userContext?: { userId: string; role: string },
  ): Promise<Course> {
    // 1. Fetch data profile matching target slug parameter
    let course = await this.courseRepo.findBySlug(slug);
    if (!course && /^[0-9a-fA-F]{24}$/.test(slug)) {
      course = await this.courseRepo.findById(slug);
    }
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Open Visibility Gate: Instantly serve the record if it is public/published
    if (course.status === CourseStatus.PUBLISHED) {
      return course;
    }

    // 3. Isolated Guardrail: Obfuscate DRAFT or ARCHIVED states from unauthenticated visitors
    if (!userContext) {
      throw new NotFoundError("Course");
    }

    // 4. Admin Override Gate: Instantly allow full access to platform administrators
    if (userContext.role === "ADMIN") {
      return course;
    }

    // 5. Object Ownership Verification Gate: Allow access only if the token matches the Course Instructor profile
    if (userContext.role === "INSTRUCTOR") {
      const instructorProfile = await this.instructorRepo.findByUserId(
        userContext.userId,
      );

      if (instructorProfile && instructorProfile.id === course.instructorId) {
        return course;
      }
    }

    // Fallback protection: Mask unauthorized access to private courses as standard 404
    throw new NotFoundError("Course");
  }
}
