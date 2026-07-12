import crypto from 'crypto';

/**
 * Hashes a token using SHA-256.
 * Useful for storing hashed versions of OTPs or email verification tokens.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generates a random secure token.
 */
export const randomToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generates random bytes.
 */
export const randomBytes = (size: number): Buffer => {
  return crypto.randomBytes(size);
};

/**
 * Generates a random UUID (v4).
 */
export const randomUUID = (): string => {
  return crypto.randomUUID();
};
