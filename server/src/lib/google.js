// Google OAuth token verification using google-auth-library

import { OAuth2Client } from "google-auth-library";
import env from "../config/env.js";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Verify a Google ID token and extract user info.
 * @param {string} idToken - The Google ID token from the client
 * @returns {Promise<{ email: string, name: string, googleId: string, avatarUrl: string|null }>}
 * @throws {Error} If the token is invalid
 */
export async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google token — no payload");
  }

  return {
    email: payload.email,
    name: payload.name || payload.email.split("@")[0],
    googleId: payload.sub,
    avatarUrl: payload.picture || null,
  };
}
