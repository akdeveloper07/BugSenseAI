import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

// Load the .env file from the backend project root
config({
  path: path.resolve(__dirname, "../../.env"),
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET must contain at least 16 characters"),

  JWT_EXPIRES_IN: z.string().default("7d"),

  CLIENT_ORIGIN: z
    .string()
    .default("https://bug-sense-ai-wheat.vercel.app"),

  AI_BASE_URL: z
    .string()
    .default("https://api.openai.com/v1"),

  // Empty value allows demo mode when no AI key is configured
  AI_API_KEY: z.string().default(""),

  AI_MODEL: z.string().default("gpt-4o-mini"),

  ADMIN_EMAIL: z.string().email().optional(),

  ADMIN_PASSWORD: z.string().optional(),

  ADMIN_NAME: z.string().optional(),
});

export const env = envSchema.parse(process.env);
