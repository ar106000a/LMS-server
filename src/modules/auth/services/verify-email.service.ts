import { AuthTokenPurpose } from "../../../../generated/prisma/client";
import { UserRepository } from "../repositories/user.repository";
import { AuthTokenRepository } from "../repositories/auth-token.repository";
import { VerifyEmailDto } from "../dto/verify-email.dto";
import { hashToken } from "../../../shared/utils/crypto";
import prisma from "../../../config/prisma";
import {
  ForbiddenError,
  AuthenticationError,
  ValidationError,
} from "../../../utils/error";

export class VerifyEmailService {
  constructor(
    private userRepo = new UserRepository(),
    private tokenRepo = new AuthTokenRepository(),
  ) {}

  async execute(dto: VerifyEmailDto): Promise<void> {
    const { email, otp: plainToken } = dto;

    // 1. Find user by email
    const user = await this.userRepo.findByEmail(email);

    // 2. Ensure user exists
    if (!user) {
      throw new ValidationError("Invalid request!");
    }

    // 3. Ensure user is not already verified
    if (user.isVerified) {
      throw new ForbiddenError();
    }

    // 4. Hash token to match database record
    const tokenHash = hashToken(plainToken);

    // 5. Find a valid matching token
    const tokenRecord = await this.tokenRepo.findValidToken(
      tokenHash,
      AuthTokenPurpose.EMAIL_VERIFICATION,
    );

    // 6. Verify token is found and unused
    if (!tokenRecord) {
      throw new AuthenticationError("Invalid token!");
    }
    if (tokenRecord.userId !== user.id) {
      throw new AuthenticationError("Invalid Token!");
    }

    // 7. Check token expiration
    if (tokenRecord.expiresAt < new Date()) {
      throw new AuthenticationError("Invalid token!");
    }

    // 8. Execute state updates inside a secure Prisma Transaction
    await prisma.$transaction(async (tx) => {
      // Mark current token as used
      await this.tokenRepo.markAsUsed(tokenRecord.id, tx);

      // Set user.isVerified = true
      await this.userRepo.verifyUser(user.id, tx);

      // Invalidate remaining verification tokens
      await this.tokenRepo.invalidateUnusedTokens(
        user.id,
        AuthTokenPurpose.EMAIL_VERIFICATION,
        tx,
      );
    });
  }
}
