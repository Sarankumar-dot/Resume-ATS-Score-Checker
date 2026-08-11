// RefreshToken Model
// Thin data-access layer wrapping Prisma calls for the RefreshToken table.
// No business logic here — just queries.

import prisma from "../lib/prisma.js";

/**
 * Create a new refresh token record.
 * @param {string} userId - The user's ID
 * @param {string} tokenHash - The hashed refresh token
 * @param {Date} expiresAt - When the token expires
 * @returns {Promise<object>} The created refresh token record
 */
export async function create(userId, tokenHash, expiresAt) {
  return prisma.refreshToken.create({
    data: {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    },
  });
}

/**
 * Find a refresh token record by its hash (active or recently superseded).
 * @param {string} tokenHash - The hashed refresh token
 * @returns {Promise<object|null>} The refresh token record or null
 */
export async function findByTokenHash(tokenHash) {
  return prisma.refreshToken.findFirst({
    where: { token_hash: tokenHash },
  });
}

/**
 * Find a refresh token record by the hash of the NEW token it was rotated into.
 * Used during grace-window: if the old token was already rotated, we can look
 * up the record that superseded it and return the same new token.
 * @param {string} newTokenHash - The token_hash of the replacement token
 * @returns {Promise<object|null>}
 */
export async function findSupersededByNewHash(newTokenHash) {
  return prisma.refreshToken.findFirst({
    where: { superseded_by: newTokenHash },
  });
}

/**
 * Mark a token as superseded (soft-rotation for grace-window).
 * @param {string} tokenHash - The old token hash being rotated out
 * @param {string} newTokenHash - The replacement token hash
 * @returns {Promise<object>}
 */
export async function markSuperseded(tokenHash, newTokenHash) {
  return prisma.refreshToken.updateMany({
    where: { token_hash: tokenHash },
    data: {
      superseded_at: new Date(),
      superseded_by: newTokenHash,
    },
  });
}

/**
 * Delete a refresh token record by its hash (hard delete for logout).
 * @param {string} tokenHash - The hashed refresh token to delete
 * @returns {Promise<object>} The delete count
 */
export async function deleteByTokenHash(tokenHash) {
  return prisma.refreshToken.deleteMany({
    where: { token_hash: tokenHash },
  });
}

/**
 * Delete all refresh tokens for a user (logout from all devices).
 * @param {string} userId - The user's ID
 * @returns {Promise<object>} The delete count
 */
export async function deleteAllForUser(userId) {
  return prisma.refreshToken.deleteMany({
    where: { user_id: userId },
  });
}

/**
 * Clean up expired and long-superseded tokens (call periodically or on login).
 * Removes tokens expired >1 hour ago or superseded >1 minute ago.
 * @returns {Promise<object>} The delete count
 */
export async function deleteStale() {
  const now = new Date();
  const oneHourAgo = new Date(now - 60 * 60 * 1000);
  const oneMinuteAgo = new Date(now - 60 * 1000);

  return prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expires_at: { lt: oneHourAgo } },
        { superseded_at: { lt: oneMinuteAgo } },
      ],
    },
  });
}
