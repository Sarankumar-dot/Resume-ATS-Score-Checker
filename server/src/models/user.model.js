// User Model
// Thin data-access layer wrapping Prisma calls for the User table.
// No business logic here — just queries.
// Placeholder — will be expanded in Phase 1 (Auth).

import prisma from "../lib/prisma.js";

/**
 * Find a user by their email address.
 * @param {string} email
 * @returns {Promise<object|null>} The user object or null
 */
export async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

/**
 * Find a user by their ID.
 * @param {string} id
 * @returns {Promise<object|null>} The user object or null
 */
export async function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

/**
 * Create a new user.
 * @param {object} data - User data (email, name, password_hash, etc.)
 * @returns {Promise<object>} The created user
 */
export async function create(data) {
  return prisma.user.create({ data });
}

/**
 * Find a user by their Google ID.
 * @param {string} googleId
 * @returns {Promise<object|null>} The user object or null
 */
export async function findByGoogleId(googleId) {
  return prisma.user.findFirst({ where: { google_id: googleId } });
}

/**
 * Update a user by their ID.
 * @param {string} id
 * @param {object} data - Fields to update
 * @returns {Promise<object>} The updated user
 */
export async function update(id, data) {
  return prisma.user.update({ where: { id }, data });
}

