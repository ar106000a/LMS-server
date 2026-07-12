import { LessonRepository } from "../repositories/lesson.repository";
import { SectionRepository } from "../../sections/repositories/section.repository";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { NotFoundError, ForbiddenError } from "../../../utils/error";

export class DeleteLessonService {
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
  ): Promise<void> {
    // 1. Locate the target lesson record
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError("Lesson");
    }

    // 2. Resolve the parent section mapping
    const section = await this.sectionRepo.findById(lesson.sectionId);
    if (!section) {
      throw new NotFoundError("Section");
    }

    // 3. Resolve the top-level parent course container
    const course = await this.courseRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 4. Access control verification (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to delete this lesson.",
        );
      }
    }

    // 5. Delete the lesson record (Cascades automatically to clear related VideoContent or ArticleContent rows)
    await this.lessonRepo.delete(lessonId);

    // 6. Shift subsequent lesson order indexes inside the section container to keep them contiguous
    await this.lessonRepo.decrementSortOrdersAfter(
      lesson.sectionId,
      lesson.sortOrder,
    );
  }
}
