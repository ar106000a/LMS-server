import { randomUUID } from "crypto";

/**
 * Generates a unique JWT ID (jti) using UUID v4.
 */
export const generateJti = (): string => {
  return randomUUID();
};
