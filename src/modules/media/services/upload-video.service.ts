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

export class UploadVideoService {
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

    const section = await this.sectionRepo.findById(lesson.sectionId);
    if (!section) throw new NotFoundError("Section");

    const course = await this.courseRepo.findById(section.courseId);
    if (!course) throw new NotFoundError("Course");

    // 2. Clear Identity Permissions (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to manage media for this lesson.",
        );
      }
    }

    // 3. Business Rule: Strict validation on polymorphic content type alignment
    if (lesson.type !== "VIDEO") {
      throw new ValidationError(
        "Cannot upload video content to an ARTICLE type lesson.",
      );
    }

    // 4. Locate pre-allocated content row
    const existingVideoContent =
      await this.videoContentRepo.findByLessonId(lessonId);
    if (!existingVideoContent)
      throw new NotFoundError("Video Content layout record");

    // 5. Business Rule: Set status to PROCESSING immediately to lock the interface
    const currentProcessingStatus = "PROCESSING";
    await this.videoContentRepo.updateByLessonId(lessonId, {
      processingStatus: currentProcessingStatus,
    });

    // 6. Fire-and-Forget Background Task: Hand off the heavy lifting to avoid thread-blocking
    this.runBackgroundUploadPipeline(
      lessonId,
      fileBuffer,
      existingVideoContent.videoUrl,
    ).catch((err) =>
      console.error(
        `Background transcoding failure on lesson ${lessonId}:`,
        err,
      ),
    );

    // Return the active status string straight away for the 202 response body
    return currentProcessingStatus;
  }

  private async runBackgroundUploadPipeline(
    lessonId: string,
    fileBuffer: Buffer,
    oldVideoUrl: string | null,
  ): Promise<void> {
    try {
      // Business Rule: Wipe previous asset if an old URL reference exists
      if (oldVideoUrl && oldVideoUrl.trim() !== "") {
        await this.cloudinaryService.deleteVideo(oldVideoUrl);
      }

      // Stream upload file binary directly into Cloudinary
      const uploadResult = await this.cloudinaryService.uploadVideo(fileBuffer);

      // Save the finalized storage URLs back to the database and update state to READY
      await this.videoContentRepo.updateByLessonId(lessonId, {
        videoUrl: uploadResult.videoUrl,
        // originalUrl: uploadResult.videoUrl, // Storing Cloudinary master secure link
        duration: uploadResult.duration,
        processingStatus: "READY",
      });
    } catch (error) {
      // Mark the database record as FAILED if the upload pipeline crashes
      await this.videoContentRepo.updateByLessonId(lessonId, {
        processingStatus: "FAILED",
      });
      throw error;
    }
  }
}
