// Auth Middleware
// Placeholder — will be fully implemented in Phase 1 (Auth)
// Verifies JWT access token, attaches user to req, rejects unauthorized requests

import { verifyAccessToken } from "../lib/jwt.js";

/**
 * Authentication middleware.
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded user to req.user.
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}
