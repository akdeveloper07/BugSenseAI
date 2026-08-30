import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../lib/jwt";
import { HttpError } from "../utils/httpError";
import type { Role } from "@prisma/client";

export type AuthedRequest = Request & {
  user: {
    id: string;
    role: Role;
    email: string;
    name: string;
    isActive: boolean;
  };
};

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  const cookie = req.cookies?.token as string | undefined;
  return cookie ?? null;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) throw new HttpError(401, "Authentication required", "UNAUTHENTICATED");

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new HttpError(401, "Invalid session", "UNAUTHENTICATED");
    if (!user.isActive) throw new HttpError(403, "Account is inactive", "INACTIVE");

    (req as unknown as AuthedRequest).user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
    };
    next();
  } catch (err) {
    if (err instanceof HttpError) return next(err);
    next(new HttpError(401, "Invalid or expired token", "UNAUTHENTICATED"));
  }
}

export function getAuthUser(req: Request): AuthedRequest["user"] {
  const user = (req as unknown as AuthedRequest).user;
  if (!user) throw new HttpError(401, "Authentication required", "UNAUTHENTICATED");
  return user;
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user || user.role !== "ADMIN") {
    return next(new HttpError(403, "Admin access required", "FORBIDDEN"));
  }
  next();
}
