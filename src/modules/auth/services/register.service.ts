import { UserRepository } from "../repositories/user.repository";
import { AuthTokenRepository } from "../repositories/auth-token.repository";
import { hashPassword } from "../../../shared/auth/password";
import { generateOTP } from "../../../shared/utils/generateOTP";
import { hashToken } from "../../../shared/utils/crypto";
import {
  sendEmail,
  sendSecurityNotificationEmail,
} from "../../../shared/utils/email";
import { ConflictError, DatabaseError } from "../../../../src/utils/error";
import { Role } from "../../../../generated/prisma/client";
import { AuthTokenPurpose } from "../../../../generated/prisma/client";
import { RegisterUserDto, RegisterResponseDto } from "../dto/register.dto";

export class RegisterService {
  private userRepository: UserRepository;
  private authTokenRepository: AuthTokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.authTokenRepository = new AuthTokenRepository();
  }

  async register(dto: RegisterUserDto): Promise<RegisterResponseDto> {
    const genericSuccessResponse: RegisterResponseDto = {
      message:
        "If the email provided is valid, you will receive a verification code shortly.",
    };

    // 1. Check if a user with the email exists.
    const existingUser = await this.userRepository.findByEmail(dto.email);

    // Helper function to generate and send verification token
    const generateAndSendVerification = async (
      userId: string,
      email: string,
    ) => {
      const verificationOTP = generateOTP();
      const hashedVerificationToken = hashToken(verificationOTP);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

      try {
        await this.authTokenRepository.create({
          user: {
            connect: {
              id: userId,
            },
          },
          codeHash: hashedVerificationToken,
          purpose: AuthTokenPurpose.EMAIL_VERIFICATION,
          expiresAt,
        });
      } catch (error) {
        console.error("Failed to store verification token:", error);
        // Do not throw, return generic success to avoid email enumeration
      }

      try {
        await sendEmail(
          email,
          "Verify Your Email Address",
          `Your verification code is: ${verificationOTP}. It is valid for 1 hour.`,
          `<p>Your verification code is: <strong>${verificationOTP}</strong>. It is valid for 1 hour.</p>`,
        );
      } catch (error) {
        console.error("Failed to send verification email:", error);
        // Do not throw, return generic success to avoid email enumeration
      }
    };

    // Case 1: If the email does not exist
    if (!existingUser) {
      // Check username availability
      const existingUserByUsername = await this.userRepository.findByUsername(
        dto.username,
      );
      if (existingUserByUsername) {
        throw new ConflictError("Username already exists");
      }

      // Hash password
      const passwordHash = await hashPassword(dto.password);

      // Create user (default role: STUDENT, isVerified: false)
      let newUser;
      try {
        newUser = await this.userRepository.create({
          email: dto.email,
          username: dto.username,
          fullName: dto.fullName,
          passwordHash,
          role: Role.STUDENT,
          isVerified: false,
        });
      } catch (error) {
        throw new DatabaseError("Failed to create user");
      }

      await generateAndSendVerification(newUser.id, newUser.email);
      return genericSuccessResponse;
    }

    // Case 2: If the email exists and is NOT verified
    if (existingUser && !existingUser.isVerified) {
      // Check username availability (excluding the current user).
      const existingUserByUsername =
        await this.userRepository.findByUsernameExcludingId(
          dto.username,
          existingUser.id,
        );
      if (existingUserByUsername) {
        throw new ConflictError("Username already exists");
      }

      // Hash the new password.
      const passwordHash = await hashPassword(dto.password);

      // Update username, full name, and password.
      try {
        await this.userRepository.update(existingUser.id, {
          username: dto.username,
          fullName: dto.fullName,
          passwordHash,
        });
      } catch (error) {
        throw new DatabaseError("Failed to update user");
      }

      // Invalidate any existing unused verification tokens.
      await this.authTokenRepository.invalidateUnusedTokens(
        existingUser.id,
        AuthTokenPurpose.EMAIL_VERIFICATION,
      );

      // Generate a new verification token/OTP and send email.
      await generateAndSendVerification(existingUser.id, existingUser.email);
      return genericSuccessResponse;
    }

    // Case 3: If the email exists and IS verified
    if (existingUser && existingUser.isVerified) {
      // Send a security notification email
      try {
        await sendSecurityNotificationEmail(
          existingUser.email,
          "Security Alert: Account Registration Attempt",
          existingUser.username,
        );
      } catch (error) {
        console.error("Failed to send security notification email:", error);
        // Do not throw, return generic success to avoid email enumeration
      }
      // Do not generate a verification token.
      // Do not modify the account.
      return genericSuccessResponse;
    }

    // Fallback, though all cases should be covered
    return genericSuccessResponse;
  }
}
