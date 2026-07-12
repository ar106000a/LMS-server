import prisma from "../../../config/prisma";
import { SessionRepository } from "../repositories/session.repository";
import { RefreshTokenBlacklistRepository } from "../repositories/refresh-token-blacklist.repository";
import { hashToken } from "../../../shared/utils/crypto";
import { verifyRefreshToken } from "../../../shared/auth/jwt";

export class LogoutService {
  constructor(
    private sessionRepo = new SessionRepository(),
    private blacklistRepo = new RefreshTokenBlacklistRepository(),
  ) {}

  async execute(rawRefreshToken: string): Promise<void> {
    let decoded: { userId: string; jti: string } | null = null;

    // 1. Safely extract JWT contents without throwing if it's expired or malformed
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (error) {
      // Gracefully fall back to clearing by hash lookup if verification fails
    }

    const currentTokenHash = hashToken(rawRefreshToken);

    // 2. Wrap state transitions in a safe database transaction block
    await prisma.$transaction(async (tx) => {
      // Find the active session using the token hash
      const activeSession =
        await this.sessionRepo.findByTokenHash(currentTokenHash);

      if (activeSession) {
        // Revoke the exact matched session row
        await this.sessionRepo.revoke(activeSession.id, tx);
      }

      // If the token parse succeeded and provided a JTI, blacklist it explicitly
      if (decoded?.jti) {
        await this.blacklistRepo.create(
          {
            jti: decoded.jti,
            expiresAt:
              activeSession?.expiresAt ||
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          tx,
        );
      }
    });
  }
}
