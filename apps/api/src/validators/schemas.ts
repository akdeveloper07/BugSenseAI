import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(100),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export const analyzeBugSchema = z.object({
  language: z.string().trim().min(1).max(80),
  framework: z.string().trim().max(80).optional().nullable(),
  environment: z.string().trim().max(4000).optional().nullable(),
  codeInput: z.string().max(80_000).default(""),
  logsInput: z.string().max(80_000).optional().nullable(),
  bugDescription: z.string().max(10_000).optional().nullable(),
});

export const analysisListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  language: z.string().optional(),
  bugType: z.string().optional(),
  severity: z.string().optional(),
  q: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const updateAnalysisSchema = z.object({
  tags: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  rating: z.union([z.literal(-1), z.literal(0), z.literal(1)]).optional(),
});

export const adminPatchUserSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});
