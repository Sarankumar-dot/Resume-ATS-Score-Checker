// Match Scorer
// Compares a resume's parsed text against extracted JD keywords and produces
// a match score (0-100) with matched/missing keyword lists.

import { tokenize } from "./keywordExtractor.js";

/**
 * Score how well a resume matches a set of target keywords from a job description.
 *
 * Matching is case-insensitive. For single-word keywords, we check if the token
 * appears in the resume's token set. For multi-word keywords (bigrams), we check
 * if they appear as a substring in the lowercased resume text.
 *
 * Simple "stemming" is handled via substring matching: if a keyword is "manage",
 * it will match tokens like "managed", "management", "managing" because we check
 * whether any resume token *contains* the keyword or vice versa. This is
 * intentionally simple — a real stemmer (Porter/Snowball) would be more accurate
 * but is overkill for v1.
 *
 * @param {string} resumeText - The full parsed text of the resume.
 * @param {string[]} jdKeywords - Array of keywords extracted from the JD.
 * @returns {{ score: number, matched: string[], missing: string[] }}
 */
export function scoreMatch(resumeText, jdKeywords) {
  if (!jdKeywords.length) {
    return { score: 0, matched: [], missing: [] };
  }

  const resumeTokens = tokenize(resumeText);
  const resumeTokenSet = new Set(resumeTokens);
  const resumeLower = resumeText.toLowerCase();

  const matched = [];
  const missing = [];

  for (const keyword of jdKeywords) {
    const isMultiWord = keyword.includes(" ");

    if (isMultiWord) {
      // Bigram: check if the phrase appears in the resume text
      if (resumeLower.includes(keyword)) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    } else {
      // Unigram: check exact token match first, then fuzzy substring match
      if (resumeTokenSet.has(keyword)) {
        matched.push(keyword);
      } else {
        // Fuzzy: does any resume token contain this keyword, or vice versa?
        // e.g. keyword "python" matches token "python3"; keyword "manage" matches "management"
        const fuzzyMatch = resumeTokens.some(
          (token) => token.includes(keyword) || keyword.includes(token)
        );
        if (fuzzyMatch) {
          matched.push(keyword);
        } else {
          missing.push(keyword);
        }
      }
    }
  }

  const score = Math.round((matched.length / jdKeywords.length) * 100);

  return { score, matched, missing };
}
