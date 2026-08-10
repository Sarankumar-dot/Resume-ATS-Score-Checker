// JWT helper utilities
// Placeholder — will be implemented in Phase 1 (Auth)

import jwt from "jsonwebtoken";
import env from "../config/env.js";

/**
 * Generate an access token for a user.
 * @param {object} payload - The token payload (e.g. { userId, email })
 * @returns {string} Signed JWT access token
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}

/**
 * Generate a refresh token for a user.
 * @param {object} payload - The token payload (e.g. { userId })
 * @returns {string} Signed JWT refresh token
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

/**
 * Verify an access token.
 * @param {string} token - The JWT access token to verify
 * @returns {object} Decoded token payload
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

/**
 * Verify a refresh token.
 * @param {string} token - The JWT refresh token to verify
 * @returns {object} Decoded token payload
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
