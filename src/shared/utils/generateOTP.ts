/**
 * Generates a six-digit One-Time Password (OTP).
 * The OTP is a string of six random digits.
 */
export const generateOTP = (): string => {
  // Generate a random number between 100000 and 999999 (inclusive)
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};
