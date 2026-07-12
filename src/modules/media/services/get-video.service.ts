import { LessonRepository } from "../../lesson/repositories/lesson.repository";
import { SectionRepository } from "../../sections/repositories/section.repository";
import { CourseRepository } from "../../courses/repositories/course.repository";
import { InstructorRepository } from "../../courses/repositories/instructor.repository";
import { VideoContentRepository } from "../repositories/video-content.repository";
import { EnrollmentRepository } from "../../enrollment/repositories/enrollments.repository";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../../utils/error";

interface VideoResponseData {
  videoUrl: string | null;
  duration: number;
  processingStatus: string;
  thumbnailUrl: string | null;
}

export class GetVideoService {
  constructor(
    private lessonRepo = new LessonRepository(),
    private sectionRepo = new SectionRepository(),
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
    private videoContentRepo = new VideoContentRepository(),
    private enrollmentRepo = new EnrollmentRepository(),
  ) {}

  async execute(
    lessonId: string,
    userContext?: { userId: string; role: string },
  ): Promise<VideoResponseData> {
    // 1. Structural Layer Validations
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson");

    if (lesson.type !== "VIDEO") {
      throw new ValidationError(
        "Requested lesson is an ARTICLE and does not contain video metadata.",
      );
    }

    const section = await this.sectionRepo.findById(lesson.sectionId);
    if (!section) throw new NotFoundError("Section");

    const course = await this.courseRepo.findById(section.courseId);
    if (!course) throw new NotFoundError("Course");

    // 2. Fetch Core Video Content Data
    const videoContent = await this.videoContentRepo.findByLessonId(lessonId);
    if (!videoContent) throw new NotFoundError("Video Content configuration");

    // 3. Evaluate Access Control Gates
    let hasAccess = false;

    if (userContext) {
      // Gate A: Admins bypass all checks
      if (userContext.role === "ADMIN") {
        hasAccess = true;
      } else {
        // Gate B: Check Instructor Course Ownership
        const instructorProfile = await this.instructorRepo.findByUserId(
          userContext.userId,
        );
        if (instructorProfile && instructorProfile.id === course.instructorId) {
          hasAccess = true;
        } else {
          // Gate C: Check Student Enrollment (Only valid if the course is published)
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

    // Gate D: Public / Unenrolled Preview Access (Requires course to be actively published)
    if (!hasAccess && course.status === "PUBLISHED" && lesson.isPreview) {
      hasAccess = true;
    }

    // Fallback Reject: Lock down streaming data if no access gates resolve to true
    if (!hasAccess) {
      throw new ForbiddenError(
        "You must be enrolled in this course to view its content components.",
      );
    }

    // 4. Generate Cloudinary Transformation Thumbnail dynamically if file is uploaded
    let thumbnailUrl: string | null = null;
    if (videoContent.videoUrl) {
      // Replaces the video file extension with .jpg and injects a standard video frame grab
      thumbnailUrl = videoContent.videoUrl.replace(/\.[^/.]+$|$/, ".jpg");
    }

    return {
      videoUrl: videoContent.videoUrl,
      duration: videoContent.duration,
      processingStatus: videoContent.processingStatus,
      thumbnailUrl,
    };
  }
}
