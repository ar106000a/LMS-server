import { Enrollment } from "../../../../generated/prisma/client";
import { EnrollmentRepository } from "../repositories/enrollments.repository";
import { LessonRepository } from "../../lesson/repositories/lesson.repository";
import { LessonProgressRepository } from "../../progress/repositories/lesson-progress.repository";
import { NotFoundError, ForbiddenError, ValidationError, AppError } from "../../../utils/error";

export class CompleteEnrollmentService {
  constructor(
    private enrollmentRepo = new EnrollmentRepository(),
    private lessonRepo = new LessonRepository(),
    private progressRepo = new LessonProgressRepository()
  ) {}

  async execute(userId: string, enrollmentId: string): Promise<Enrollment> {
    // 1. Locate existing enrollment
    const enrollment = await this.enrollmentRepo.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError("Enrollment");
    }

    // 2. Business Rule: Ensure identity ownership alignment
    if (enrollment.userId !== userId) {
      throw new ForbiddenError("You cannot modify completion states for another student's enrollment.");
    }

    // 3. Business Rule: Prevent duplicate processing iterations
    if (enrollment.status === "COMPLETED") {
      throw new AppError("This course enrollment track has already been finalized and completed.", 400);
    }

    if (enrollment.status !== "ACTIVE") {
      throw new ValidationError("Only active course tracks can transition into a completed state.");
    }

    // 4. Verification Check: Compare total structural lessons against marked student progress
    const [totalLessons, completedLessons] = await Promise.all([
      this.lessonRepo.countByCourseId(enrollment.courseId),
      this.progressRepo.countCompletedLessons(userId, enrollment.courseId),
    ]);

    // Safety fallback for edge courses with zero lessons published
    if (totalLessons === 0) {
      throw new ValidationError("Cannot complete a course path that does not contain any published lessons.");
    }

    if (completedLessons < totalLessons) {
      throw new AppError(
        `Course criteria unfulfilled. Completed ${completedLessons} out of ${totalLessons} standard lessons.`,
        400
      );
    }

    // 5. Update Status Transition
    const updatedEnrollment = await this.enrollmentRepo.updateStatus(enrollmentId, "COMPLETED");

    // Future Cascade Event Hook Trigger:
    // await this.certificateService.generate({ userId, courseId: enrollment.courseId });

    return updatedEnrollment;
  }
}