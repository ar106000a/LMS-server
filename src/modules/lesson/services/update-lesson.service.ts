import { Lesson } from "../../../../generated/prisma/client";
import { LessonRepository } from "../repositories/lesson.repository";
import { SectionRepository } from "../../sections/repositories/section.repository";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { UpdateLessonDto } from "../dtos/update-lesson.dto";
import { NotFoundError, ForbiddenError } from "../../../utils/error";

export class UpdateLessonService {
  constructor(
    private lessonRepo = new LessonRepository(),
    private sectionRepo = new SectionRepository(),
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    lessonId: string,
    dto: UpdateLessonDto,
  ): Promise<Lesson> {
    // 1. Locate the target lesson record
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError("Lesson");
    }

    // 2. Locate parent section container
    const section = await this.sectionRepo.findById(lesson.sectionId);
    if (!section) {
      throw new NotFoundError("Section");
    }

    // 3. Locate top-level parent course container
    const course = await this.courseRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 4. Authorization check (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to modify this lesson.",
        );
      }
    }

    // 5. Commit mutations safely (type remains immutable as it's excluded from the input object map)
    return this.lessonRepo.update(lessonId, {
      title: dto.title,
      isPreview: dto.isPreview,
    });
  }
}
