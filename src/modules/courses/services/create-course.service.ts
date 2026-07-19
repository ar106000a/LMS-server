import { CourseStatus, Course } from "../../../../generated/prisma/client";
import { CourseRepository } from "../repositories/course.repository";
import { InstructorRepository } from "../repositories/instructor.repository";
import { CreateCourseDto } from "../dtos/create-course.dto";
import { NotFoundError } from "../../../utils/error";
import { generateSlug } from "../../../shared/utils/slug";
import { CloudinaryService } from "../../../shared/services/cloudinary.service";

export class CreateCourseService {
  constructor(
    private courseRepo = new CourseRepository(),
    private instructorRepo = new InstructorRepository(),
    private cloudinaryService= new CloudinaryService(),
  ) {}

  async execute(userId: string, dto: CreateCourseDto, fileBuffer?:Buffer): Promise<Course> {
    // 1. Verify corresponding InstructorProfile exists for the given active User ID
    const instructorProfile = await this.instructorRepo.findByUserId(userId);
    if (!instructorProfile) {
      throw new NotFoundError("Instruction Profile not found for "+ userId);
    }

    // 2. Generate a resilient unique URL slug
    let slug = generateSlug(dto.title);
    let existingCourse = await this.courseRepo.findBySlug(slug);

    // Fallback collision handler loop (rare)
    while (existingCourse) {
      slug = generateSlug(dto.title);
      existingCourse = await this.courseRepo.findBySlug(slug);
    }

    // 3. Handle synchronous image upload if a file was provided
    let finalThumbnailUrl = dto.thumbnailUrl || null;
    
    if (fileBuffer) {
      const uploadResult = await this.cloudinaryService.uploadImage(fileBuffer);
      finalThumbnailUrl = uploadResult.imageUrl;
    }

    // 3. Persist entry inside database forcing standard initial status to DRAFT
    const newCourse = await this.courseRepo.create({
      title: dto.title,
      description: dto.description,
      price: dto.price,
      thumbnailUrl: finalThumbnailUrl,
      slug,
      status: CourseStatus.DRAFT,
      instructorId: instructorProfile.id,
    });

    return newCourse;
  }
}
