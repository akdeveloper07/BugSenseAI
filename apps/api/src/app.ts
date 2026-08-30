import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { analysisRouter } from "./routes/analysis.routes";
import { adminRouter } from "./routes/admin.routes";
import { errorHandler } from "./middleware/errorHandler";
import { fail } from "./utils/apiResponse";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", service: "bugsense-api" } });
  });

  app.use("/api/auth", authRouter);
  app.use("/api", analysisRouter);
  app.use("/api/admin", adminRouter);

  app.use((_req, res) => fail(res, "Route not found", 404, "NOT_FOUND"));
  app.use(errorHandler);

  return app;
}
