import dotenv from "dotenv";
import path from "node:path";
import z from "zod";

dotenv.config({ path: path.resolve(import.meta.dirname, "../../.env") });

export const envSchema = z.object({
  ORIGIN: z.url("Origin must be a valid url").trim(),
  DATABASE_URL: z.url("Database_URL must be a valid URL"),
  REDIS_URL: z.url("REDIS_URL must be a valid url."),
  PORT: z.coerce.number().default(5000),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  RESET_TOKEN_SECRET: z.string(),
  NODE_ENV: z.string().trim(),
  CLOUD_NAME: z.string().trim(),
  CLOUD_API_KEY: z.string(),
  CLOUD_SECRET_KEY: z.string(),
  GMAIL_CLIENT_ID: z.string(),
  GMAIL_CLIENT_SECRET: z.string(),
  GMAIL_REFRESH_TOKEN: z.string(),
  EMAIL_USER: z.string(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:");
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1); //process ll stop with a return message indicating that it failed, resulting in no zombie processes and also telling CI/CD pipelines that build is failed.
}

const data = parsed.data as Record<string, unknown>;
export const env = data as {
  DATABASE_URL: string;
  REDIS_URL: string;
  PORT: number;
  ACCESS_TOKEN_SECRET: string;
  RESET_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  NODE_ENV: string;
  ORIGIN: string;
  CLOUD_NAME: string;
  CLOUD_API_KEY: string;
  CLOUD_SECRET_KEY: string;
  GMAIL_CLIENT_ID:string;
  GMAIL_REFRESH_TOKEN:string;
  GMAIL_CLIENT_SECRET:string;
  EMAIL_USER:string;
};
