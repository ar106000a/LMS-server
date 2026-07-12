import prisma from "../../../config/prisma";
import { User, Prisma } from "../../../../generated/prisma/client";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput, tx?:Prisma.TransactionClient): Promise<User> {
    const client=tx||prisma;
    return client.user.update({
      where: { id },
      data,
    });
  }

  async findByUsernameExcludingId(
    username: string,
    id: string,
  ): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        username,
        id: { not: id },
      },
    });
  }

  /**
   * Updates user verification status. Supports running inside a transaction.
   */
  async verifyUser(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const client = tx || prisma;
    return client.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  }
}
