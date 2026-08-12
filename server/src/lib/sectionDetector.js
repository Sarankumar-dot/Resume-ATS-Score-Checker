// Section Detector
// Scans resume parsed text for standard section headings using regex matching.
// Returns an object mapping each section to { found: true, snippet } or null.

/**
 * Standard resume sections and the regex patterns that detect them.
 * Each pattern is matched against individual lines of the text (case-insensitive).
 * Heading lines are typically short (< ~80 chars), all-caps or title-case,
 * and may be preceded/followed by decorators (dashes, colons, etc.).
 */
const SECTION_PATTERNS = {
  contact: {
    label: "Contact Info",
    // Contact is detected by *content*, not headings — look for email/phone patterns.
    contentPatterns: [
      /[\w.+-]+@[\w-]+\.[\w.]+/i, // email
      /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/, // phone
    ],
    headingPatterns: [/^[\s]*contact\b/i],
  },
  summary: {
    label: "Summary / Objective",
    headingPatterns: [
      /^[\s]*(?:professional\s+)?summary\b/i,
      /^[\s]*executive\s+summary\b/i,
      /^[\s]*career\s+summary\b/i,
      /^[\s]*(?:career\s+)?objective\b/i,
      /^[\s]*profile\b/i,
      /^[\s]*personal\s+statement\b/i,
      /^[\s]*about\s+me\b/i,
      /^[\s]*about\b/i,
    ],
  },
  skills: {
    label: "Skills",
    headingPatterns: [
      /^[\s]*(?:technical\s+)?skills\b/i,
      /^[\s]*core\s+competencies\b/i,
      /^[\s]*technologies\b/i,
      /^[\s]*tech\s+stack\b/i,
      /^[\s]*tools\s+(?:&|and)\s+technologies\b/i,
    ],
  },
  experience: {
    label: "Experience",
    headingPatterns: [
      /^[\s]*(?:work\s+)?experience\b/i,
      /^[\s]*professional\s+experience\b/i,
      /^[\s]*employment(?:\s+history)?\b/i,
      /^[\s]*work\s+history\b/i,
    ],
  },
  education: {
    label: "Education",
    headingPatterns: [
      /^[\s]*education\b/i,
      /^[\s]*academic(?:\s+background)?\b/i,
      /^[\s]*qualifications\b/i,
    ],
  },
  projects: {
    label: "Projects",
    headingPatterns: [
      /^[\s]*(?:personal\s+)?projects\b/i,
      /^[\s]*portfolio\b/i,
      /^[\s]*key\s+projects\b/i,
      /^[\s]*notable\s+projects\b/i,
    ],
  },
};

/**
 * Detect standard resume sections in parsed text.
 *
 * @param {string} parsedText - The raw extracted text from a resume file.
 * @returns {object} Map of section keys to { found: boolean, label: string, snippet: string | null }.
 *
 * @example
 * const sections = detectSections(resumeText);
 * // { contact: { found: true, label: "Contact Info", snippet: "john@example.com" },
 * //   summary: { found: false, label: "Summary / Objective", snippet: null }, ... }
 */
export function detectSections(parsedText) {
  const lines = parsedText.split("\n");
  const results = {};

  for (const [key, config] of Object.entries(SECTION_PATTERNS)) {
    let found = false;
    let snippet = null;

    // 1. Check heading patterns against individual lines
    if (config.headingPatterns) {
      for (const line of lines) {
        // Headings are usually short — skip very long lines
        const trimmed = line.trim();
        if (trimmed.length > 80 || trimmed.length === 0) continue;

        for (const pattern of config.headingPatterns) {
          if (pattern.test(trimmed)) {
            found = true;
            snippet = trimmed;
            break;
          }
        }
        if (found) break;
      }
    }

    // 2. For contact: also check content patterns across the full text
    if (!found && config.contentPatterns) {
      for (const pattern of config.contentPatterns) {
        const match = parsedText.match(pattern);
        if (match) {
          found = true;
          snippet = match[0];
          break;
        }
      }
    }

    results[key] = {
      found,
      label: config.label,
      snippet,
    };
  }

  return results;
}
