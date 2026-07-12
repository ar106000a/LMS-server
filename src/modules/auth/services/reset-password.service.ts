import { AuthTokenPurpose } from "../../../../generated/prisma/client";
import { UserRepository } from "../repositories/user.repository";
import { AuthTokenRepository } from "../repositories/auth-token.repository";
import { SessionRepository } from "../repositories/session.repository";
import { ResetPasswordDto } from "../dto/password-reset.dto";
import { verifyResetTokenJWT } from "../../../shared/auth/jwt";
import { AppError } from "../../../utils/error";
import prisma from "../../../config/prisma";
import { hashPassword } from "../../../shared/auth/password";

export class ResetPasswordService {
  constructor(
    private userRepo = new UserRepository(),
    private tokenRepo = new AuthTokenRepository(),
    private sessionRepo = new SessionRepository(),
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    let decoded: { userId: string };

    try {
      decoded = verifyResetTokenJWT(dto.resetJWT);
    } catch (error) {
      throw new AppError("Invalid or expired reset token session", 400);
    }

    const user = await this.userRepo.findById(decoded.userId);
    if (!user) {
      throw new AppError("User profile not found", 404);
    }

    // Hash the incoming replacement password
    const newPasswordHash = await hashPassword(dto.password); // Replace with your standard hashing utility

    await prisma.$transaction(async (tx) => {
      // Update password hash
      await this.userRepo.update(
        user.id,
        { passwordHash: newPasswordHash },
        tx,
      );

      // Invalidate any residual password reset tokens
      await this.tokenRepo.invalidateUnusedTokens(
        user.id,
        AuthTokenPurpose.PASSWORD_RESET,
        tx,
      );

      // Security: Revoke all active sessions, logging the user out globally across devices
      await this.sessionRepo.revokeAllByUserId(user.id, tx);
    });
  }
}
