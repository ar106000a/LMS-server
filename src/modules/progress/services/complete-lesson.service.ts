import { LessonRepository } from "../../lesson/repositories/lesson.repository";
import { SectionRepository } from "../../sections/repositories/section.repository";
import { EnrollmentRepository } from "../../enrollment/repositories/enrollments.repository";
import { LessonProgressRepository } from "../repositories/lesson-progress.repository";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  AppError,
} from "../../../utils/error";

export class CompleteLessonService {
  constructor(
    private lessonRepo = new LessonRepository(),
    private sectionRepo = new SectionRepository(),
    private enrollmentRepo = new EnrollmentRepository(),
    private lessonProgressRepo = new LessonProgressRepository(),
  ) {}

  async execute(userId: string, lessonId: string): Promise<Date> {
    // 1. Locate Structural Nodes
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson");

    const section = await this.sectionRepo.findById(lesson.sectionId);
    if (!section) throw new NotFoundError("Section");

    // 2. Validate Active Enrollment Footprint using section.courseId
    const enrollment = await this.enrollmentRepo.findByUserAndCourse(
      userId,
      section.courseId,
    );
    if (!enrollment) {
      throw new ForbiddenError(
        "You must be explicitly enrolled within this course path to track progress.",
      );
    }

    if (enrollment.status === "SUSPENDED") {
      throw new ForbiddenError(
        "Your access privileges for this course framework are currently SUSPENDED.",
      );
    }
    if (enrollment.status === "COMPLETED") {
      throw new ValidationError(
        "This course track has already been completed and finalized.",
      );
    }

    // 3. Double-completion check guard
    const existingProgress = await this.lessonProgressRepo.findByUserAndLesson(
      userId,
      lessonId,
    );
    if (existingProgress && existingProgress.completedAt !== null) {
      throw new AppError(
        "This target lesson has already been marked complete by this student profile.",
        409,
      );
    }

    // 4. Generate timestamp and pass section.courseId downstream
    const executionTimestamp = new Date();
    await this.lessonProgressRepo.create(
      userId,
      lessonId,
      section.courseId,
      executionTimestamp,
    );

    // 5. Recalculate Course metrics completely
    const [totalLessons, completedCount] = await Promise.all([
      this.lessonRepo.countByCourseId(section.courseId),
      this.lessonProgressRepo.countCompletedLessons(userId, section.courseId),
    ]);

    const progressPercent =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const finalStatus = progressPercent >= 100 ? "COMPLETED" : "ACTIVE";

    await this.enrollmentRepo.updateProgress(
      enrollment.id,
      progressPercent,
      finalStatus,
    );

    return executionTimestamp;
  }
}
