// Resume Model
// Thin data-access layer wrapping Prisma calls for the Resume table.
// No business logic here — just queries.

import prisma from "../lib/prisma.js";

/**
 * Create a new resume record.
 * @param {string} userId
 * @param {string} filename
 * @param {string} parsedText
 * @returns {Promise<object>}
 */
export async function create(userId, filename, parsedText) {
  return prisma.resume.create({
    data: {
      user_id: userId,
      filename,
      parsed_text: parsedText,
    },
  });
}

/**
 * Find a single resume by its ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  return prisma.resume.findUnique({ where: { id } });
}

/**
 * Find all resumes belonging to a user.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function findAllByUserId(userId) {
  return prisma.resume.findMany({
    where: { user_id: userId },
    orderBy: { uploaded_at: "desc" },
  });
}
