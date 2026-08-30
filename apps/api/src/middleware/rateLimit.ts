import rateLimit from "express-rate-limit";

export const analyzeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many analysis requests. Try again later.", code: "RATE_LIMITED" },
  },
});
