import { AuthTokenPurpose } from "../../../../generated/prisma/client";
import { UserRepository } from "../repositories/user.repository";
import { AuthTokenRepository } from "../repositories/auth-token.repository";
import { VerifyResetDto } from "../dto/password-reset.dto";
import { hashToken } from "../../../shared/utils/crypto";
import { generateResetTokenJWT } from "../../../shared/auth/jwt";
import { AppError } from "../../../utils/error";
import prisma from "../../../config/prisma";

export class VerifyResetService {
  constructor(
    private userRepo = new UserRepository(),
    private tokenRepo = new AuthTokenRepository(),
  ) {}

  async execute(dto: VerifyResetDto): Promise<{ resetJWT: string }> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new AppError("Invalid email or token", 400);
    }

    const tokenHash = hashToken(dto.otp);

    // Look up the valid token matching the hash and purpose
    const tokenRecord = await this.tokenRepo.findValidToken(
      tokenHash,
      AuthTokenPurpose.PASSWORD_RESET,
    );

    // Check token existence and ownership validation
    if (!tokenRecord || tokenRecord.userId !== user.id) {
      throw new AppError("Invalid or expired token", 400);
    }

    await prisma.$transaction(async (tx) => {
      await this.tokenRepo.markAsUsed(tokenRecord.id, tx);
    });

    // Create a highly restricted token valid for 5-10 minutes max
    const resetJWT = generateResetTokenJWT({ userId: user.id });

    return { resetJWT };
  }
}
