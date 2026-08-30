import { Router } from "express";
import type { BugType, Prisma, Severity } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ok } from "../utils/apiResponse";
import { HttpError } from "../utils/httpError";
import { getAuthUser, requireAdmin, requireAuth } from "../middleware/auth";
import { adminPatchUserSchema, analysisListQuerySchema } from "../validators/schemas";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

const BUG_TYPES: BugType[] = [
  "SYNTAX",
  "RUNTIME",
  "LOGIC",
  "UI",
  "DATABASE",
  "SECURITY",
  "PERFORMANCE",
  "CONFIGURATION",
  "OTHER",
];
const SEVERITIES: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

function parseEnum<T extends string>(value: string | undefined, allowed: T[]): T | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase() as T;
  return allowed.includes(upper) ? upper : undefined;
}

adminRouter.get("/analyses", async (req, res, next) => {
  try {
    const query = analysisListQuerySchema.parse(req.query);
    const bugType = parseEnum(query.bugType, BUG_TYPES);
    const severity = parseEnum(query.severity, SEVERITIES);

    const where: Prisma.AnalysisWhereInput = {
      ...(query.language ? { language: { contains: query.language, mode: "insensitive" } } : {}),
      ...(bugType ? { bugType } : {}),
      ...(severity ? { severity } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { summary: { contains: query.q, mode: "insensitive" } },
              { codeInput: { contains: query.q, mode: "insensitive" } },
              { rootCause: { contains: query.q, mode: "insensitive" } },
              { bugDescription: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.analysis.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.analysis.count({ where }),
    ]);

    return ok(res, {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/users", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { analyses: true } },
      },
    });
    return ok(res, { users });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/users/:id", async (req, res, next) => {
  try {
    const actor = getAuthUser(req);
    const body = adminPatchUserSchema.parse(req.body);
    if (!body.role && body.isActive === undefined) {
      throw new HttpError(400, "Provide role and/or isActive", "EMPTY_PATCH");
    }

    const target = await prisma.user.findUnique({ where: { id: String(req.params.id) } });
    if (!target) throw new HttpError(404, "User not found", "NOT_FOUND");

    if (target.id === actor.id && body.isActive === false) {
      throw new HttpError(400, "You cannot deactivate your own account", "SELF_DEACTIVATE");
    }
    if (target.id === actor.id && body.role === "USER") {
      throw new HttpError(400, "You cannot remove your own admin role", "SELF_DEMOTION");
    }

    const user = await prisma.user.update({
      where: { id: target.id },
      data: {
        ...(body.role ? { role: body.role } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return ok(res, { user });
  } catch (err) {
    next(err);
  }
});
