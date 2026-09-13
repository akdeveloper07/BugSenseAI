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

  // Security
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests without an Origin header
        // (Postman, server-to-server requests, etc.)
        if (!origin) {
          return callback(null, true);
        }

        const allowedOrigins = [
          env.CLIENT_ORIGIN,

          // Your stable Vercel production URL
          "https://bug-sense-ai-wheat.vercel.app",
        ];

        // Allow the exact configured frontend
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Allow Vercel deployment URLs for your project
        const isVercelDeployment =
          /^https:\/\/bug-sense-[a-z0-9-]+-akdeveloper07\.vercel\.app$/.test(
            origin,
          );

        if (isVercelDeployment) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },

      credentials: true,
    }),
  );

  // Body parser
  app.use(express.json({ limit: "1mb" }));

  // Cookies
  app.use(cookieParser());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      data: {
        status: "ok",
        service: "bugsense-api",
      },
    });
  });

  // Authentication routes
  app.use("/api/auth", authRouter);

  // Analysis routes
  app.use("/api", analysisRouter);

  // Admin routes
  app.use("/api/admin", adminRouter);

  // 404 handler
  app.use((_req, res) => {
    return fail(res, "Route not found", 404, "NOT_FOUND");
  });

  // Error handler
  app.use(errorHandler);

  return app;
}
