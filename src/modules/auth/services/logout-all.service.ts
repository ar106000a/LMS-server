import prisma from "../../../config/prisma";
import { SessionRepository } from "../repositories/session.repository";
import { RefreshTokenBlacklistRepository } from "../repositories/refresh-token-blacklist.repository";
import { verifyRefreshToken } from "../../../shared/auth/jwt";

export class LogoutAllService {
  constructor(
    private sessionRepo = new SessionRepository(),
    private blacklistRepo = new RefreshTokenBlacklistRepository(),
  ) {}

  async execute(userId: string, rawRefreshToken?: string): Promise<void> {
    let currentJti: string | null = null;
    let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Fallback window

    // 1. Try to extract JTI from the current device's refresh token if it exists
    if (rawRefreshToken) {
      try {
        const decoded = verifyRefreshToken(rawRefreshToken);
        currentJti = decoded.jti;
      } catch (error) {
        // Ignore if signature checks fail
      }
    }

    // 2. Atomic state clean up across the entire user profile
    await prisma.$transaction(async (tx) => {
      // Revoke every active session matching this user ID
      await this.sessionRepo.revokeAllByUserId(userId, tx);

      // If a current JTI was successfully parsed, invalidate it as a safety guard
      if (currentJti) {
        await this.blacklistRepo.create(
          {
            jti: currentJti,
            expiresAt,
          },
          tx,
        );
      }
    });
  }
}
