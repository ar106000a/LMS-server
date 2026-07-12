import { CourseRepository } from "../../courses/repositories/course.repository";
import { EnrollmentRepository } from "../../enrollment/repositories/enrollments.repository";
import { LessonRepository } from "../../lesson/repositories/lesson.repository";
import { LessonProgressRepository } from "../repositories/lesson-progress.repository";
import { NotFoundError, ForbiddenError } from "../../../utils/error";

interface CourseProgressPayload {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  completedLessonIds: string[];
}

export class GetCourseProgressService {
  constructor(
    private courseRepo = new CourseRepository(),
    private enrollmentRepo = new EnrollmentRepository(),
    private lessonRepo = new LessonRepository(),
    private lessonProgressRepo = new LessonProgressRepository(),
  ) {}

  async execute(
    userId: string,
    courseId: string,
  ): Promise<CourseProgressPayload> {
    // 1. Verify target path structural existence
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course");
    }

    // 2. Fetch enrollment status verification track
    const enrollment = await this.enrollmentRepo.findByUserAndCourse(
      userId,
      courseId,
    );
    if (!enrollment) {
      throw new ForbiddenError(
        "Access denied. You must be explicitly enrolled to inspect progress paths.",
      );
    }

    // Business Rule: Suspended tokens are restricted from accessing learning analytics loops
    if (enrollment.status === "SUSPENDED") {
      throw new ForbiddenError(
        "Your access privileges for this course framework are currently SUSPENDED.",
      );
    }

    // 3. Batch processing structural and analytics dataset reads
    const [totalLessons, completedLessons, completedLessonIds] =
      await Promise.all([
        this.lessonRepo.countByCourseId(courseId),
        this.lessonProgressRepo.countCompletedLessons(userId, courseId),
        this.lessonProgressRepo.findCompletedLessonIds(userId, courseId),
      ]);

    // 4. Calculate robust percentage metrics safely handling empty-course boundaries
    const percentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      totalLessons,
      completedLessons,
      percentage,
      completedLessonIds,
    };
  }
}
