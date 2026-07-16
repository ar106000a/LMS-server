import { Course } from "../../../../generated/prisma/client";
import { CourseRepository } from "../repositories/course.repository";
import { InstructorRepository } from "../repositories/instructor.repository";
import { ForbiddenError } from "../../../utils/error";

export class GetInstructorCoursesService {
  constructor(
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
  ) {}

  async execute(userId: string): Promise<Course[]> {
    // 1. Verify the user has an instructor profile
    const instructorProfile = await this.instructorRepo.findByUserId(userId);

    if (!instructorProfile) {
      throw new ForbiddenError(
        "Instructor profile not found. Please register as an instructor.",
      );
    }

    // 2. Fetch all courses linked to this specific instructor profile
    // Note: Ensure `findManyByInstructorId` exists in your CourseRepository!
    return this.courseRepo.findManyByInstructorId(instructorProfile.id);
  }
}