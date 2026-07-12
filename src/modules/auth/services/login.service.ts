import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../repositories/session.repository";
import { AuditLogRepository } from "../repositories/audit-log.repository";
import { LoginDto } from "../dto/login.dto";
import { AppError } from "../../../utils/error";

// Assuming these helpers are available in your shared folder structure
import { hashToken } from "../../../shared/utils/crypto";
import { comparePassword } from "../../../shared/auth/password";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../shared/auth/jwt";
import { generateJti } from "../../../shared/utils/generateJti";

interface LoginServiceRequest extends LoginDto {
  ipAddress?: string;
  userAgent?: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export class LoginService {
  constructor(
    private userRepo = new UserRepository(),
    private sessionRepo = new SessionRepository(),
    private auditLogRepo = new AuditLogRepository(),
  ) {}

  async execute(request: LoginServiceRequest): Promise<LoginResponse> {
    const { email, password, ipAddress, userAgent } = request;

    // 1. Find user by email
    const user = await this.userRepo.findByEmail(email);

    // 2. Verify user exists
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // 3. Verify email is verified
    if (!user.isVerified) {
      throw new AppError(
        "Please verify your email address before logging in",
        403,
      );
    }

    // 4. Compare password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // 5. Generate unique JTI for the refresh token
    const jti = generateJti();

    // 6. Generate access and refresh tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      role: user.role,
      jti: jti,
    });

    // 7. Hash the refresh token before database storage
    const refreshTokenHash = hashToken(refreshToken);

    // Set refresh token validity (e.g., 7 days from now)
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

    // 8. Create user session record
    await this.sessionRepo.create({
      userId: user.id,
      refreshTokenHash,
      ipAddress,
      userAgent,
      expiresAt: refreshTokenExpiresAt,
    });

    // 9. Log the successful login attempt (MVP Audit Log)
    await this.auditLogRepo
      .create({
        userId: user.id,
        action: "USER_LOGIN",
        ipAddress,
        userAgent,
        metadata: { timestamp: new Date().toISOString() },
      })
      .catch(() => {
        // Gracefully catch background audit errors so it doesn't break login flow
      });

    // 10. Return public user information along with tokens
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }
}
