import prisma from "../../../config/prisma";
import { AuthTokenPurpose } from "../../../../generated/prisma/client";
import { UserRepository } from "../repositories/user.repository";
import { AuthTokenRepository } from "../repositories/auth-token.repository";
import { SessionRepository } from "../repositories/session.repository";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { comparePassword, hashPassword } from "../../../shared/auth/password"; // Using your password hashing utility
import {
  NotFoundError,
  AuthenticationError,
  ValidationError,
} from "../../../utils/error";

export class ChangePasswordService {
  constructor(
    private userRepo = new UserRepository(),
    private tokenRepo = new AuthTokenRepository(),
    private sessionRepo = new SessionRepository(),
  ) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = dto;

    // 1. Find user by id
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    // 2. Compare incoming current password against stored hash
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError("Wrong Password!");
    }

    // 3. Prevent setting the same old password as the new one
    if (currentPassword === newPassword) {
      throw new ValidationError("New Password must be different!");
    }

    // 4. Hash the new secure password replacement
    const newPasswordHash = await hashPassword(newPassword);

    // 5. Execute password write, token burn, and global session wipe atomically
    await prisma.$transaction(async (tx) => {
      // Update password hash inside the user record
      await this.userRepo.update(userId, { passwordHash: newPasswordHash }, tx);

      // Invalidate any residual PASSWORD_RESET tokens lying around
      await this.tokenRepo.invalidateUnusedTokens(
        userId,
        AuthTokenPurpose.PASSWORD_RESET,
        tx,
      );

      // Force-terminate all active device sessions for security compliance
      await this.sessionRepo.revokeAllByUserId(userId, tx);
    });
  }
}
