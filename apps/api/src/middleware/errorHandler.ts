import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: { message: "Validation failed", code: "VALIDATION_ERROR", details: err.flatten() },
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      success: false,
      error: { message: err.message, ...(err.code ? { code: err.code } : {}) },
    });
  }

  console.error("[unhandled]", err);
  return res.status(500).json({
    success: false,
    error: { message: "Internal server error", code: "INTERNAL_ERROR" },
  });
}
