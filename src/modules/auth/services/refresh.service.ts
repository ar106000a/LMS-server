import prisma from "../../../config/prisma";
import { SessionRepository } from "../repositories/session.repository";
import { RefreshTokenBlacklistRepository } from "../repositories/refresh-token-blacklist.repository";
import { UserRepository } from "../repositories/user.repository";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "../../../utils/error";
import { hashToken } from "../../../shared/utils/crypto";
import { generateJti } from "../../../shared/utils/generateJti";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../../../shared/auth/jwt";

interface RefreshResponse {
  user: {};
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export class RefreshService {
  constructor(
    private sessionRepo = new SessionRepository(),
    private blacklistRepo = new RefreshTokenBlacklistRepository(),
    private userRepo = new UserRepository(),
  ) {}

  async execute(rawRefreshToken: string): Promise<RefreshResponse> {
    let decoded: { userId: string; jti: string; role: string };

    // 1 & 2. Verify JWT signature and structure
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (error) {
      throw new AuthenticationError("Invalid Token!");
    }

    const { userId, jti, role } = decoded;

    // 3. Check if JTI is blacklisted (Replay attack detection)
    const isBlacklisted = await this.blacklistRepo.exists(jti!);
    if (isBlacklisted) {
      throw new AuthenticationError("Invalid Token!");
    }

    // 4. Find sessions for the user
    const sessions = await this.sessionRepo.findByUserId(userId);
    const currentTokenHash = hashToken(rawRefreshToken);

    // 5. Find the active session that matches the stored token hash
    const activeSession = sessions.find(
      (s) => s.refreshTokenHash === currentTokenHash,
    );
    if (!activeSession) {
      throw new AuthenticationError("Invalid token!");
    }

    // 6. Check if session has been explicitly revoked
    if (activeSession.revokedAt) {
      throw new AuthenticationError("Invalid Token! Please Log in.");
    }

    // 7. Check if session has expired
    if (activeSession.expiresAt < new Date()) {
      throw new AuthenticationError("Expired Token!");
    }

    // Verify user still exists in the system
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    // 8 & 9. Generate fresh access token & rotated refresh token (with new JTI)
    const newJti = generateJti();
    const newAccessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });
    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      role: user.role,
      jti: newJti,
    });

    // 10. Hash new refresh token
    const newRefreshTokenHash = hashToken(newRefreshToken);

    // 11. Calculate new expiry window (e.g., extending 7 days out)
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

    // 12, 13 & 14. Atomic updates using a Prisma Transaction block
    await prisma.$transaction(async (tx) => {
      // Update session tracking with the new hash and expiry date
      await this.sessionRepo.updateRefreshToken(
        activeSession.id,
        newRefreshTokenHash,
        refreshTokenExpiresAt,
        tx,
      );

      // Invalidate old JTI immediately so it can never be processed again
      await this.blacklistRepo.create(
        {
          jti,
          expiresAt: activeSession.expiresAt, // Retain in blacklist until original expiry
        },
        tx,
      );

      // Update access metrics timestamp
      await this.sessionRepo.updateLastUsed(activeSession.id, tx);
    });

    // 15. Return newly compiled secrets
    return {
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullName,
        email: user.email,
        role: user.role,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt,
    };
  }
}
