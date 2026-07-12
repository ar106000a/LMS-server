import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address").trim(),

    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30)
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores",
      ),

    fullName: z.string().trim().min(3).max(100),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(100),
  }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
