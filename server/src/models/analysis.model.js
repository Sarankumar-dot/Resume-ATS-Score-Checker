// Analysis Model
// Thin data-access layer wrapping Prisma calls for the Analysis table.
// No business logic here — just queries.

import prisma from "../lib/prisma.js";

/**
 * Create a new analysis record.
 * @param {string} userId
 * @param {string} resumeId
 * @param {string} jdText
 * @param {number} matchScore
 * @param {string[]} matchedKeywords
 * @param {string[]} missingKeywords
 * @returns {Promise<object>}
 */
export async function create(
  userId,
  resumeId,
  jdText,
  matchScore,
  matchedKeywords,
  missingKeywords
) {
  return prisma.analysis.create({
    data: {
      user_id: userId,
      resume_id: resumeId,
      jd_text: jdText,
      match_score: matchScore,
      matched_keywords: matchedKeywords,
      missing_keywords: missingKeywords,
    },
  });
}

/**
 * Find a single analysis by its ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  return prisma.analysis.findUnique({ where: { id } });
}

/**
 * Find all analyses belonging to a user, most recent first.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function findAllByUserId(userId) {
  return prisma.analysis.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    include: {
      resume: {
        select: { filename: true },
      },
    },
  });
}

/**
 * Find the most recent analysis for a given resume.
 * @param {string} resumeId
 * @returns {Promise<object|null>}
 */
export async function findLatestByResumeId(resumeId) {
  return prisma.analysis.findFirst({
    where: { resume_id: resumeId },
    orderBy: { created_at: "desc" },
  });
}
