import { z } from "zod";

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address").trim(),
    otp: z.string().min(1, "Verification token or OTP is required").trim(),
  }),
});

export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
