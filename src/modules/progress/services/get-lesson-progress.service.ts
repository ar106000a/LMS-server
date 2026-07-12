import { LessonRepository } from "../../lesson/repositories/lesson.repository";
import { SectionRepository } from "../../sections/repositories/section.repository";
import { EnrollmentRepository } from "../../enrollment/repositories/enrollments.repository";
import { LessonProgressRepository } from "../repositories/lesson-progress.repository";
import { NotFoundError, ForbiddenError } from "../../../utils/error";

interface LessonProgressPayload {
  completed: boolean;
  completedAt: Date | null;
}

export class GetLessonProgressService {
  constructor(
    private lessonRepo = new LessonRepository(),
    private sectionRepo = new SectionRepository(),
    private enrollmentRepo = new EnrollmentRepository(),
    private lessonProgressRepo = new LessonProgressRepository(),
  ) {}

  async execute(
    userId: string,
    lessonId: string,
  ): Promise<LessonProgressPayload> {
    // 1. Locate the Lesson structural context
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson");

    // 2. Resolve parent section to pull the required courseId boundary map
    const section = await this.sectionRepo.findById(lesson.sectionId);
    if (!section) throw new NotFoundError("Section");

    // 3. Business Rule: Ensure user is enrolled in the course tracking network
    const enrollment = await this.enrollmentRepo.findByUserAndCourse(
      userId,
      section.courseId,
    );
    if (!enrollment) {
      throw new ForbiddenError(
        "Access denied. You must be enrolled to check lesson completion profiles.",
      );
    }

    // Business Rule: Suspended tokens cannot evaluate content metadata streams
    if (enrollment.status === "SUSPENDED") {
      throw new ForbiddenError(
        "Your access privileges for this course framework are currently SUSPENDED.",
      );
    }

    // 4. Extract progress row matching our data layer model layout
    const progress = await this.lessonProgressRepo.findByUserAndLesson(
      userId,
      lessonId,
    );

    // Business Rule: Handle the absence of progress records gracefully without throwing an error
    if (!progress || !progress.completedAt) {
      return {
        completed: false,
        completedAt: null,
      };
    }

    return {
      completed: true,
      completedAt: progress.completedAt,
    };
  }
}
