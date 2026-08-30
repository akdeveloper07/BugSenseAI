import { Router } from "express";
import type { BugType, Prisma, Severity } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ok } from "../utils/apiResponse";
import { HttpError } from "../utils/httpError";
import { getAuthUser, requireAuth } from "../middleware/auth";
import { analyzeRateLimit } from "../middleware/rateLimit";
import { callBugSenseModel } from "../services/ai.service";
import { parseBugSenseResponse } from "../services/parser.service";
import {
  analysisListQuerySchema,
  analyzeBugSchema,
  updateAnalysisSchema,
} from "../validators/schemas";

export const analysisRouter = Router();

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

analysisRouter.post("/analyze-bug", requireAuth, analyzeRateLimit, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const body = analyzeBugSchema.parse(req.body);
    if (!body.codeInput.trim() && !body.logsInput?.trim() && !body.bugDescription?.trim()) {
      throw new HttpError(400, "Provide code, logs, or a bug description", "EMPTY_INPUT");
    }

    const raw = await callBugSenseModel(body);
    const parsed = parseBugSenseResponse(raw);

    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        language: body.language,
        framework: body.framework || null,
        environment: body.environment || null,
        codeInput: body.codeInput,
        logsInput: body.logsInput || null,
        bugDescription: body.bugDescription || null,
        bugDetected: parsed.bugDetected,
        bugType: parsed.bugType,
        severity: parsed.severity,
        priority: parsed.priority,
        rootCause: parsed.rootCause,
        impact: parsed.impact,
        suggestedFix: parsed.suggestedFix,
        confidence: parsed.confidence,
        summary: parsed.summary,
        rawAiResponse: raw,
      },
    });

    return ok(
      res,
      {
        analysis,
        parseWarnings: parsed.parseWarnings,
      },
      201,
    );
  } catch (err) {
    next(err);
  }
});

analysisRouter.get("/analyses", requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const query = analysisListQuerySchema.parse(req.query);
    const bugType = parseEnum(query.bugType, BUG_TYPES);
    const severity = parseEnum(query.severity, SEVERITIES);

    const where: Prisma.AnalysisWhereInput = {
      userId: user.id,
      ...(query.language ? { language: { contains: query.language, mode: "insensitive" } } : {}),
      ...(bugType ? { bugType } : {}),
      ...(severity ? { severity } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.analysis.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          language: true,
          framework: true,
          bugType: true,
          severity: true,
          priority: true,
          bugDetected: true,
          summary: true,
          confidence: true,
          tags: true,
          rating: true,
          createdAt: true,
        },
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

analysisRouter.get("/analyses/export", requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const items = await prisma.analysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    const header = [
      "id",
      "createdAt",
      "language",
      "framework",
      "bugDetected",
      "bugType",
      "severity",
      "priority",
      "confidence",
      "summary",
      "rootCause",
      "tags",
    ];
    const rows = items.map((a) =>
      [
        a.id,
        a.createdAt.toISOString(),
        csv(a.language),
        csv(a.framework ?? ""),
        a.bugDetected,
        a.bugType,
        a.severity,
        a.priority,
        a.confidence,
        csv(a.summary),
        csv(a.rootCause),
        csv(a.tags.join("|")),
      ].join(","),
    );
    const csvBody = [header.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=bugsense-history.csv");
    return res.send(csvBody);
  } catch (err) {
    next(err);
  }
});

analysisRouter.get("/analyses/:id", requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const analysisId = String(req.params.id);
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!analysis) throw new HttpError(404, "Analysis not found", "NOT_FOUND");
    if (analysis.userId !== user.id && user.role !== "ADMIN") {
      throw new HttpError(403, "You cannot view this analysis", "FORBIDDEN");
    }
    return ok(res, { analysis });
  } catch (err) {
    next(err);
  }
});

analysisRouter.patch("/analyses/:id", requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const body = updateAnalysisSchema.parse(req.body);
    const existing = await prisma.analysis.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw new HttpError(404, "Analysis not found", "NOT_FOUND");
    if (existing.userId !== user.id && user.role !== "ADMIN") {
      throw new HttpError(403, "You cannot update this analysis", "FORBIDDEN");
    }
    const analysis = await prisma.analysis.update({
      where: { id: existing.id },
      data: {
        ...(body.tags ? { tags: body.tags } : {}),
        ...(body.rating !== undefined ? { rating: body.rating === 0 ? null : body.rating } : {}),
      },
    });
    return ok(res, { analysis });
  } catch (err) {
    next(err);
  }
});

function csv(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}
