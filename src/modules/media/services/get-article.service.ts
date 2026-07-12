import { LessonRepository } from "../../lesson/repositories/lesson.repository";
import { SectionRepository } from "../../sections/repositories/section.repository";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { ArticleContentRepository } from "../repositories/article-content.repository";
import { EnrollmentRepository } from "../../enrollment/repositories/enrollments.repository";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../../utils/error";

export class GetArticleService {
  constructor(
    private lessonRepo = new LessonRepository(),
    private sectionRepo = new SectionRepository(),
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
    private articleContentRepo = new ArticleContentRepository(),
    private enrollmentRepo = new EnrollmentRepository(),
  ) {}

  async execute(
    lessonId: string,
    userContext?: { userId: string; role: string },
  ): Promise<string> {
    // 1. Structural Layer Validations
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson");

    // Business Rule: Restrict node traversal to strictly ARTICLE type rows
    if (lesson.type !== "ARTICLE") {
      throw new ValidationError(
        "Requested lesson is a VIDEO track and does not contain article content.",
      );
    }

    const section = await this.sectionRepo.findById(lesson.sectionId);
    if (!section) throw new NotFoundError("Section");

    const course = await this.courseRepo.findById(section.courseId);
    if (!course) throw new NotFoundError("Course");

    // 2. Fetch Targeted Content Payload
    const articleContent =
      await this.articleContentRepo.findByLessonId(lessonId);
    if (!articleContent)
      throw new NotFoundError("Article Content layer container");

    // 3. Matrix Authorization Check Loop
    let hasAccess = false;

    if (userContext) {
      // Gate A: Global Administrators
      if (userContext.role === "ADMIN") {
        hasAccess = true;
      } else {
        // Gate B: Course Creator/Instructor
        const instructorProfile = await this.instructorRepo.findByUserId(
          userContext.userId,
        );
        if (instructorProfile && instructorProfile.id === course.instructorId) {
          hasAccess = true;
        } else {
          // Gate C: Valid Registered Student Enrollment (Only active if course is live)
          const isEnrolled = await this.enrollmentRepo.isEnrolled(
            userContext.userId,
            course.id,
          );
          if (isEnrolled && course.status === "PUBLISHED") {
            hasAccess = true;
          }
        }
      }
    }

    // Gate D: Public Unauthenticated Visitor (Checks preview configuration rules)
    if (!hasAccess && course.status === "PUBLISHED" && lesson.isPreview) {
      hasAccess = true;
    }

    // Fallback Rejection
    if (!hasAccess) {
      throw new ForbiddenError(
        "You must enroll in this course path to read this article document.",
      );
    }

    // Return the clean markdown formatting body string raw
    return articleContent.bodyText;
  }
}
