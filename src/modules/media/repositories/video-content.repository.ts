import prisma from "../../../config/prisma";
import { VideoContent } from "../../../../generated/prisma/client";

export class VideoContentRepository {
  async findByLessonId(lessonId: string): Promise<VideoContent | null> {
    return prisma.videoContent.findUnique({
      where: { lessonId },
    });
  }

  async updateByLessonId(lessonId: string, data: any): Promise<VideoContent> {
    return prisma.videoContent.update({
      where: { lessonId },
      data,
    });
  }
}
