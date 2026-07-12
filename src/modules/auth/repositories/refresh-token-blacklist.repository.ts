import prisma from "../../../config/prisma";
import { RefreshTokenBlacklist, Prisma } from "../../../../generated/prisma/client";

export class RefreshTokenBlacklistRepository {
  async exists(jti: string): Promise<boolean> {
    const record = await prisma.refreshTokenBlacklist.findUnique({
      where: { jti },
    });
    return record !== null;
  }

  async create(data: Prisma.RefreshTokenBlacklistCreateInput, tx?: Prisma.TransactionClient): Promise<RefreshTokenBlacklist> {
    const client = tx || prisma;
    return client.refreshTokenBlacklist.create({ data });
  }
}