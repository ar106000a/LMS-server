import { ArticleContent } from "../../../../generated/prisma/client";
import { LessonRepository } from "../../lesson/repositories/lesson.repository";
import { SectionRepository } from "../../sections/repositories/section.repository";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { ArticleContentRepository } from "../repositories/article-content.repository";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../../utils/error";

export class UpdateArticleService {
  constructor(
    private lessonRepo = new LessonRepository(),
    private sectionRepo = new SectionRepository(),
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
    private articleContentRepo = new ArticleContentRepository(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    lessonId: string,
    bodyText: string,
  ): Promise<ArticleContent> {
    // 1. Structural Layer Validations
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson");

    // Business Rule: Ensure polymorphic alignment matches expected text type
    if (lesson.type !== "ARTICLE") {
      throw new ValidationError(
        "Cannot update article text payload on a VIDEO type lesson.",
      );
    }

    const section = await this.sectionRepo.findById(lesson.sectionId);
    if (!section) throw new NotFoundError("Section");

    const course = await this.courseRepo.findById(section.courseId);
    if (!course) throw new NotFoundError("Course");

    // 2. Authorization Rules Execution (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to modify content for this lesson.",
        );
      }
    }

    // 3. Commit mutations directly (Storing Markdown layout raw text as-is)
    return this.articleContentRepo.updateByLessonId(lessonId, bodyText);
  }
}
