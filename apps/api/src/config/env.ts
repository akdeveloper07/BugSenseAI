import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

// Load .env from backend project root
config({
  path: path.resolve(__dirname, "../../.env"),
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required"),

  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET must contain at least 16 characters"),

  JWT_EXPIRES_IN: z
    .string()
    .default("7d"),

  CLIENT_ORIGIN: z
    .string()
    .default("https://bug-sense-ai-wheat.vercel.app"),

  // Google Gemini API
  AI_BASE_URL: z
    .string()
    .default("https://generativelanguage.googleapis.com"),

  // Empty value = demo mode
  AI_API_KEY: z
    .string()
    .default(""),

  // Gemini model
  AI_MODEL: z
    .string()
    .default("gemini-2.5-flash"),

  ADMIN_EMAIL: z
    .string()
    .email()
    .optional(),

  ADMIN_PASSWORD: z
    .string()
    .optional(),

  ADMIN_NAME: z
    .string()
    .optional(),
});

export const env = envSchema.parse(process.env);
