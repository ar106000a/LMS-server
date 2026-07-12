import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env";

const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET || "refresh-secret";
const PASSWORD_RESET_SECRET = env.RESET_TOKEN_SECRET || "reset-secret";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const PASSWORD_RESET_EXPIRY = "10m";

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  role: string;
  jti: string;
}

export interface ResetTokenPayload extends JwtPayload {
  userId: string;
}

/**
 * Generates an access token.
 */
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generates a refresh token.
 */
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Generates a short-lived password reset JWT payload.
 */
export const generateResetTokenJWT = (payload: ResetTokenPayload): string => {
  return jwt.sign(payload, PASSWORD_RESET_SECRET, {
    expiresIn: PASSWORD_RESET_EXPIRY,
  });
};

/**
 * Verifies an access token.
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
};

/**
 * Verifies a refresh token.
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
};

/**
 * Verifies a password reset token JWT.
 */
export const verifyResetTokenJWT = (token: string): ResetTokenPayload => {
  return jwt.verify(token, PASSWORD_RESET_SECRET) as ResetTokenPayload;
};

/**
 * Decodes a token without verifying its signature. Useful for debugging.
 */
export const decodeRefreshToken = (
  token: string,
): RefreshTokenPayload | null => {
  return jwt.decode(token) as RefreshTokenPayload | null;
};

export const decodeAccessToken = (token: string): AccessTokenPayload | null => {
  return jwt.decode(token) as AccessTokenPayload | null;
};
