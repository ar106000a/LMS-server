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

export class DeleteVideoService {
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
  ): Promise<void> {
    // 1. Structural Dependency Validations
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson");

    // Business Rule: Confirm type integrity before executing video logic
    if (lesson.type !== "VIDEO") {
      throw new ValidationError(
        "Cannot delete video content from an ARTICLE type lesson.",
      );
    }

    const section = await this.sectionRepo.findById(lesson.sectionId);
    if (!section) throw new NotFoundError("Section");

    const course = await this.courseRepo.findById(section.courseId);
    if (!course) throw new NotFoundError("Course");

    // 2. Identity Permission Verification (Owner vs Admin)
    if (userRole !== "ADMIN") {
      const instructorProfile = await this.instructorRepo.findByUserId(userId);
      if (!instructorProfile || instructorProfile.id !== course.instructorId) {
        throw new ForbiddenError(
          "You do not have permission to delete media for this lesson.",
        );
      }
    }

    // 3. Confirm target record exists
    const videoContent = await this.videoContentRepo.findByLessonId(lessonId);
    if (!videoContent) throw new NotFoundError("Video Content layout record");

    // 4. Business Rule: Remove the cloud asset first to prevent orphaned storage bloat
    if (videoContent.videoUrl && videoContent.videoUrl.trim() !== "") {
      await this.cloudinaryService.deleteVideo(videoContent.videoUrl);
    }

    // 5. Business Rule: Clear fields but keep the relational record intact
    await this.videoContentRepo.updateByLessonId(lessonId, {
      videoUrl: null,
      originalUrl: null,
      duration: 0,
      processingStatus: "NOT_UPLOADED", // Resets back to base status
    });
  }
}
