import { AuthTokenPurpose } from "../../../../generated/prisma/client";
import { UserRepository } from "../repositories/user.repository";
import { AuthTokenRepository } from "../repositories/auth-token.repository";
import { ForgotPasswordDto } from "../dto/password-reset.dto";
import { randomToken, hashToken } from "../../../shared/utils/crypto";
import prisma from "../../../config/prisma";
import { sendEmail } from "../../../shared/utils/email";
import { generateOTP } from "../../../shared/utils/generateOTP";

export class ForgotPasswordService {
  constructor(
    private userRepo = new UserRepository(),
    private tokenRepo = new AuthTokenRepository(),
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email);

    // Security: Return generic success if user doesn't exist or isn't verified
    if (!user || !user.isVerified) {
      return;
    }

    const rawResetToken = generateOTP();
    const tokenHash = hashToken(rawResetToken);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // OTP valid for 15 minutes

    await prisma.$transaction(async (tx) => {
      // Invalidate any old password reset tokens
      await this.tokenRepo.invalidateUnusedTokens(
        user.id,
        AuthTokenPurpose.PASSWORD_RESET,
        tx,
      );

      // Save new reset token
      await this.tokenRepo.create(
        {
          user: {
            connect: { id: user.id },
          },
          codeHash: tokenHash,
          purpose: AuthTokenPurpose.PASSWORD_RESET,
          expiresAt,
        },
        tx,
      );
    });

    // Send reset email via background worker or service helper using `rawResetToken`
    try {
      await sendEmail(
        user.email,
        "Password Reset Request",
        `You requested a password reset. Your reset token is: ${rawResetToken}. It is valid for 15 minutes.`,
        `<p>You requested a password reset.</p>
         <p>Your reset token is: <strong>${rawResetToken}</strong></p>
         <p>It is valid for 15 minutes. If you did not request this, please ignore this email.</p>`,
      );
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      // We do not throw here. If the email fails, we still return successfully
      // to the client to avoid email enumeration attacks.
    }
  }
}
