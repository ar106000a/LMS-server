import { LessonRepository } from "../../lesson/repositories/lesson.repository";
import { SectionRepository } from "../../sections/repositories/section.repository";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { VideoContentRepository } from "../repositories/video-content.repository";
import { CloudinaryService } from "../../../shared/services/cloudinary.service";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../../utils/error";

export class UpdateVideoService {
  constructor(
    private lessonRepo = new LessonRepository(),
    private sectionRepo = new SectionRepository(),
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
    private videoContentRepo = new VideoContentRepository(),
    private cloudinaryService = new CloudinaryService(),
  ) {}

  async execute(
    userId: string,
    userRole: string,
    lessonId: string,
    fileBuffer: Buffer,
  ): Promise<string> {
    // 1. Structural Dependency Validations
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson");

    // Business Rule: Strict validation on polymorphic content type alignment
    if (lesson.type !== "VIDEO") {
      throw new ValidationError(
        "Cannot modify video content on an ARTICLE type lesson.",
      );
    }

    const section = await this.sectionRepo.findById(lesson.sectionId);
    if (!section) throw new NotFoundError("Section");

    const course = await this.courseRepo.findById(section.courseId);
    if (!course) throw new NotFoundError("Course");

    // 2. Clear Identity Permissions (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to modify media for this lesson.",
        );
      }
    }

    // 3. Verify target record exists before initiating replacement pipeline
    const existingVideoContent =
      await this.videoContentRepo.findByLessonId(lessonId);
    if (!existingVideoContent)
      throw new NotFoundError("Video Content layout record");

    // 4. Business Rule: Lock state immediately to PROCESSING and reset metadata properties
    const currentProcessingStatus = "PROCESSING";
    await this.videoContentRepo.updateByLessonId(lessonId, {
      processingStatus: currentProcessingStatus,
      duration: 0, // Resets duration track until the new file metadata is parsed
    });

    // 5. Fire-and-Forget Background Task: Execute asset swap asynchronously
    this.runBackgroundReplacementPipeline(
      lessonId,
      fileBuffer,
      existingVideoContent.videoUrl,
    ).catch((err) =>
      console.error(
        `Background video replacement failure on lesson ${lessonId}:`,
        err,
      ),
    );

    return currentProcessingStatus;
  }

  private async runBackgroundReplacementPipeline(
    lessonId: string,
    fileBuffer: Buffer,
    oldVideoUrl: string | null,
  ): Promise<void> {
    try {
      // Business Rule: Remove old Cloudinary asset to avoid leaving orphaned files
      if (oldVideoUrl && oldVideoUrl.trim() !== "") {
        await this.cloudinaryService.deleteVideo(oldVideoUrl);
      }

      // Stream the new asset up to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadVideo(fileBuffer);

      // Finalize database record with the new secure streaming URLs and state configuration
      await this.videoContentRepo.updateByLessonId(lessonId, {
        videoUrl: uploadResult.videoUrl,
        originalUrl: uploadResult.videoUrl,
        duration: uploadResult.duration,
        processingStatus: "READY",
      });
    } catch (error) {
      // Transition processing state flag to FAILED if the background swap breaks
      await this.videoContentRepo.updateByLessonId(lessonId, {
        processingStatus: "FAILED",
      });
      throw error;
    }
  }
}
