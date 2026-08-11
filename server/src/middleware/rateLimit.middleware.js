// Rate Limit Middleware
// Uses express-rate-limit to throttle auth endpoints

import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication endpoints (login, signup).
 * Limits to 5 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again after 15 minutes.",
  },
});
