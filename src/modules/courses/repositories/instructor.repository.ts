import prisma from "../../../config/prisma";
import { InstructorProfile } from "../../../../generated/prisma/client";

export class InstructorRepository {
  async findByUserId(userId: string): Promise<InstructorProfile | null> {
    return prisma.instructorProfile.findUnique({
      where: { userId },
    });
  }
}
