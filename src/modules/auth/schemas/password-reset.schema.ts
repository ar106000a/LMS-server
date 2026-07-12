import { z } from "zod";

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address").trim(),
  }),
});

export const verifyResetSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address").trim(),
    otp: z.string().min(1, "Reset token or OTP is required").trim(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
  }),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetSchema = z.infer<typeof verifyResetSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
