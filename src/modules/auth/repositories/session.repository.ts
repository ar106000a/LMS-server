import prisma from "../../../config/prisma";
import { Session, Prisma } from "../../../../generated/prisma/client";

export class SessionRepository {
  async create(data: Prisma.SessionUncheckedCreateInput): Promise<Session> {
    return prisma.session.create({ data });
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return prisma.session.findMany({
      where: { userId },
    });
  }

  async updateRefreshToken(
    sessionId: string,
    newHash: string,
    expiresAt: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<Session> {
    const client = tx || prisma;
    return client.session.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: newHash,
        expiresAt,
        updatedAt: new Date(),
      },
    });
  }

  async updateLastUsed(
    sessionId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Session> {
    const client = tx || prisma;
    return client.session.update({
      where: { id: sessionId },
      data: {
        lastUsedAt: new Date(),
      },
    });
  }

  async revoke(
    sessionId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Session> {
    const client = tx || prisma;
    return client.session.update({
      where: { id: sessionId },
      data: {
        revokedAt: new Date(),
      },
    });
  }
  async findByTokenHash(refreshTokenHash: string): Promise<Session | null> {
    return prisma.session.findFirst({
      where: { refreshTokenHash },
    });
  }

  async revokeAllByUserId(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    const client = tx || prisma;
    return client.session.updateMany({
      where: {
        userId,
        revokedAt: null, // Only revoke active sessions
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
