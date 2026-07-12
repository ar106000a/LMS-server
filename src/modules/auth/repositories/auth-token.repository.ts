import prisma from "../../../config/prisma";
import {
  AuthToken,
  AuthTokenPurpose,
  Prisma,
} from "../../../../generated/prisma/client";

export class AuthTokenRepository {
  async create(
    data: Prisma.AuthTokenCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<AuthToken> {
    const client = tx || prisma;
    return client.authToken.create({ data });
  }

  async findValidToken(
    codeHash: string,
    purpose: AuthTokenPurpose,
    tx?: Prisma.TransactionClient,
  ): Promise<AuthToken | null> {
    const client = tx || prisma;
    return client.authToken.findFirst({
      where: {
        codeHash,
        purpose,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async markAsUsed(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<AuthToken> {
    const client = tx || prisma;
    return client.authToken.update({
      where: { id },
      data: { isUsed: true },
    });
  }

  async deleteExpired(
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    const client = tx || prisma;
    return client.authToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        isUsed: false, // Only delete expired and unused tokens
      },
    });
  }

  async invalidateUnusedTokens(
    userId: string,
    purpose: AuthTokenPurpose,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    const client = tx || prisma;
    return client.authToken.updateMany({
      where: {
        userId,
        purpose,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });
  }
}
