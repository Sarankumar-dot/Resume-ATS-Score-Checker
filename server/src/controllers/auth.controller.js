// Auth Controller
// Handles req/res only — calls auth service, sets cookies, sends responses.
// No business logic or DB calls here.

import * as authService from "../services/auth.service.js";
import env from "../config/env.js";

/** Cookie options for the httpOnly refresh token */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  // 'strict' blocks the cookie on cross-origin requests in local dev (port 5173 → 5000).
  // Use 'lax' in development so the browser sends it on same-site navigations + fetch with credentials.
  sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

/**
 * POST /api/auth/signup
 */
export async function signup(req, res) {
  try {
    const { email, password, name } = req.body;
    const result = await authService.signup(email, password, name);

    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    return res.status(201).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message });
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    return res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message });
  }
}

/**
 * POST /api/auth/google
 */
export async function googleAuth(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "Google ID token is required" });
    }

    const result = await authService.googleAuth(idToken);

    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    return res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message });
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refresh(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    const result = await authService.refresh(refreshToken);

    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    return res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message });
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    await authService.logout(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Logout failed" });
  }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  try {
    const user = await authService.getMe(req.user.userId);
    return res.status(200).json({ user });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message });
  }
}
