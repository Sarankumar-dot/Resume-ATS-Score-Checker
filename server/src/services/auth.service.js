// Auth Service
// All authentication business logic — framework-agnostic (no req/res).
// Calls models/Prisma for data access, lib helpers for hashing/tokens.

import crypto from "crypto";
import * as UserModel from "../models/user.model.js";
import * as RefreshTokenModel from "../models/refreshToken.model.js";
import { hashPassword, comparePassword } from "../lib/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../lib/jwt.js";
import { verifyGoogleToken } from "../lib/google.js";

/**
 * Hash a refresh token for storage (SHA-256).
 * We never store raw refresh tokens in the DB.
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Strip sensitive fields from a user object before returning.
 */
function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

/**
 * Issue an access + refresh token pair and store the refresh token hash in DB.
 * @param {object} user - The user object from the database
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
 */
async function issueTokens(user) {
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({ userId: user.id });
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await RefreshTokenModel.create(user.id, tokenHash, expiresAt);

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
}

/**
 * Sign up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @returns {Promise<{ accessToken, refreshToken, user }>}
 */
export async function signup(email, password, name) {
  // Check if user already exists
  const existing = await UserModel.findByEmail(email);
  if (existing) {
    const error = new Error("A user with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  // Hash password and create user
  const password_hash = await hashPassword(password);
  const user = await UserModel.create({ email, password_hash, name });

  return issueTokens(user);
}

/**
 * Log in a user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ accessToken, refreshToken, user }>}
 */
export async function login(email, password) {
  const user = await UserModel.findByEmail(email);
  if (!user || !user.password_hash) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return issueTokens(user);
}

/**
 * Authenticate or register a user via Google OAuth.
 * @param {string} idToken - Google ID token from the frontend
 * @returns {Promise<{ accessToken, refreshToken, user }>}
 */
export async function googleAuth(idToken) {
  const { email, name, googleId, avatarUrl } =
    await verifyGoogleToken(idToken);

  // Try to find user by google_id first, then by email
  let user = await UserModel.findByGoogleId(googleId);

  if (!user) {
    user = await UserModel.findByEmail(email);

    if (user) {
      // Link Google account to existing email user
      user = await UserModel.update(user.id, {
        google_id: googleId,
        avatar_url: avatarUrl || user.avatar_url,
      });
    } else {
      // Create a new user (no password — Google-only)
      user = await UserModel.create({
        email,
        name,
        google_id: googleId,
        avatar_url: avatarUrl,
      });
    }
  }

  return issueTokens(user);
}

/**
 * Refresh an access token using a valid refresh token.
 *
 * Rotation strategy: soft-rotation with a 10-second grace window.
 * Instead of immediately hard-deleting the old token, we mark it as
 * superseded. If a concurrent duplicate call arrives (e.g. StrictMode
 * double-invoke) with the now-superseded token, we detect it and return
 * the SAME new token pair — no second rotation, no 401.
 *
 * @param {string} refreshToken - The raw refresh token from the cookie
 * @returns {Promise<{ accessToken, refreshToken, user }>}
 */
export async function refresh(refreshToken) {
  // Verify the JWT signature first
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    const error = new Error(`Invalid or expired refresh token: ${err.message}`);
    error.statusCode = 401;
    throw error;
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshTokenModel.findByTokenHash(tokenHash);

  // ── Case 1: Active token ────────────────────────────────────────────────
  if (stored && !stored.superseded_at) {
    // Check DB-level expiry
    if (new Date(stored.expires_at) < new Date()) {
      await RefreshTokenModel.deleteByTokenHash(tokenHash);
      const error = new Error("Refresh token expired");
      error.statusCode = 401;
      throw error;
    }

    // Fetch user before we rotate
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    // Issue new tokens
    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id });
    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Soft-rotate: mark old token superseded (keep it for 10s grace window)
    await RefreshTokenModel.markSuperseded(tokenHash, newTokenHash);
    // Store new token
    await RefreshTokenModel.create(user.id, newTokenHash, expiresAt);

    // Opportunistically clean up old stale tokens
    RefreshTokenModel.deleteStale().catch(() => {});

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: sanitizeUser(user),
    };
  }

  // ── Case 2: Recently superseded token (grace window) ───────────────────
  // The token was already rotated. Check if it was superseded within the last
  // 10 seconds — if so, return the replacement token pair instead of a 401.
  if (stored && stored.superseded_at) {
    const gracePeriodMs = 10 * 1000; // 10 seconds
    const supersededAge = Date.now() - new Date(stored.superseded_at).getTime();

    if (supersededAge < gracePeriodMs && stored.superseded_by) {
      // Find the replacement token record to get the user
      const replacement = await RefreshTokenModel.findByTokenHash(stored.superseded_by);

      if (replacement) {
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
          const error = new Error("User not found");
          error.statusCode = 401;
          throw error;
        }

        // Re-issue an access token but keep the SAME refresh token (no second rotation)
        const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });

        return {
          accessToken: newAccessToken,
          refreshToken, // return the ORIGINAL token — the cookie stays unchanged
          user: sanitizeUser(user),
        };
      }
    }
  }

  // ── Case 3: Token not found or grace window expired ────────────────────
  const error = new Error("Refresh token not found — may have been revoked");
  error.statusCode = 401;
  throw error;
}

/**
 * Log out — delete the refresh token from the database.
 * @param {string} refreshToken - The raw refresh token from the cookie
 */
export async function logout(refreshToken) {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  await RefreshTokenModel.deleteByTokenHash(tokenHash);
}

/**
 * Get the current user's profile by ID.
 * @param {string} userId
 * @returns {Promise<object>} Sanitized user object (no password_hash)
 */
export async function getMe(userId) {
  const user = await UserModel.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return sanitizeUser(user);
}
