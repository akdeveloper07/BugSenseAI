import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { ok, fail } from "../utils/apiResponse";
import { HttpError } from "../utils/httpError";
import { getAuthUser, requireAuth } from "../middleware/auth";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  updateProfileSchema,
} from "../validators/schemas";

export const authRouter = Router();

function setAuthCookie(res: Parameters<typeof ok>[0], token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

authRouter.post("/signup", async (req, res, next) => {
  try {
    const body = signupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new HttpError(409, "Email is already registered", "EMAIL_TAKEN");

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: { name: body.name, email: body.email, passwordHash },
    });
    const token = signToken({ sub: user.id, role: user.role });
    setAuthCookie(res, token);
    return ok(res, { user: publicUser(user), token }, 201);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new HttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    if (!user.isActive) throw new HttpError(403, "Account is inactive", "INACTIVE");

    const match = await bcrypt.compare(body.password, user.passwordHash);
    if (!match) throw new HttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");

    const token = signToken({ sub: user.id, role: user.role });
    setAuthCookie(res, token);
    return ok(res, { user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token", { path: "/" });
  return ok(res, { loggedOut: true });
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { id } = getAuthUser(req);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError(404, "User not found", "NOT_FOUND");
    return ok(res, { user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    const { id } = getAuthUser(req);
    const body = updateProfileSchema.parse(req.body);
    if (body.email) {
      const taken = await prisma.user.findFirst({ where: { email: body.email, NOT: { id } } });
      if (taken) throw new HttpError(409, "Email is already in use", "EMAIL_TAKEN");
    }
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.email ? { email: body.email } : {}),
      },
    });
    return ok(res, { user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const { id } = getAuthUser(req);
    const body = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError(404, "User not found", "NOT_FOUND");
    const match = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!match) throw new HttpError(400, "Current password is incorrect", "INVALID_PASSWORD");
    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    await prisma.user.update({ where: { id }, data: { passwordHash } });
    return ok(res, { updated: true });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const body = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash,
          resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      // College-project simplification: no email provider. Log token in development.
      console.info(`[password-reset] token for ${user.email}: ${token}`);
    }
    return ok(res, {
      message: "If that email exists, a reset token was generated. Check the API console in development.",
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const resetTokenHash = crypto.createHash("sha256").update(body.token).digest("hex");
    const user = await prisma.user.findFirst({
      where: { resetTokenHash, resetTokenExpiresAt: { gt: new Date() } },
    });
    if (!user) throw new HttpError(400, "Invalid or expired reset token", "INVALID_TOKEN");
    const passwordHash = await bcrypt.hash(body.password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null },
    });
    return ok(res, { reset: true });
  } catch (err) {
    next(err);
  }
});

export { fail };
