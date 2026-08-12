// Bullet Extractor
// Extracts individual bullet points from the Experience section of a resume.
// Uses sectionDetector's heading patterns to scope extraction to the right area.

/**
 * Heading patterns that signal the START of the Experience section.
 * Duplicated from sectionDetector.js to avoid circular coupling — these are
 * simple regexes, not worth an abstraction layer.
 */
const EXPERIENCE_HEADERS = [
  /^[\s]*(?:work\s+)?experience\b/i,
  /^[\s]*professional\s+experience\b/i,
  /^[\s]*employment(?:\s+history)?\b/i,
  /^[\s]*work\s+history\b/i,
];

/**
 * Heading patterns that signal the END of the Experience section
 * (i.e. another major section is starting).
 */
const SECTION_HEADERS = [
  /^[\s]*education\b/i,
  /^[\s]*(?:personal\s+)?projects\b/i,
  /^[\s]*(?:technical\s+)?skills\b/i,
  /^[\s]*core\s+competencies\b/i,
  /^[\s]*certifications?\b/i,
  /^[\s]*awards?\b/i,
  /^[\s]*publications?\b/i,
  /^[\s]*references?\b/i,
  /^[\s]*volunteer\b/i,
  /^[\s]*interests?\b/i,
  /^[\s]*(?:professional\s+)?summary\b/i,
  /^[\s]*executive\s+summary\b/i,
  /^[\s]*career\s+summary\b/i,
  /^[\s]*(?:career\s+)?objective\b/i,
  /^[\s]*profile\b/i,
  /^[\s]*portfolio\b/i,
  /^[\s]*contact\b/i,
];

/**
 * Check if a line is a known section header (non-experience).
 */
function isSectionHeader(line) {
  const trimmed = line.trim();
  if (trimmed.length > 80 || trimmed.length < 3) return false;
  return SECTION_HEADERS.some((re) => re.test(trimmed));
}

/**
 * Check if a line looks like a bullet point.
 * Common markers: -, •, *, ▪, ▸, ►, or lines starting with a verb after whitespace.
 */
function isBulletLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  // Explicit bullet markers
  if (/^[-•*▪▸►◦‣⁃]\s/.test(trimmed)) return true;
  // Numbered bullets: "1.", "2)"
  if (/^\d+[.)]\s/.test(trimmed)) return true;
  return false;
}

/**
 * Extract bullet points from the Experience section of a resume.
 *
 * Strategy:
 * 1. Find the Experience section heading
 * 2. Collect all lines until the next section heading
 * 3. Filter for lines that look like bullet points
 * 4. Also catch indented lines that start with a capital letter after
 *    a job-title/date line (common in resumes without explicit markers)
 *
 * @param {string} parsedText - Full parsed resume text.
 * @returns {string[]} Array of extracted bullet strings (trimmed, markers stripped).
 */
export function extractBullets(parsedText) {
  const lines = parsedText.split("\n");
  let experienceStart = -1;

  // 1. Find experience section start
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.length > 80 || trimmed.length < 3) continue;
    if (EXPERIENCE_HEADERS.some((re) => re.test(trimmed))) {
      experienceStart = i + 1;
      break;
    }
  }

  if (experienceStart < 0) return []; // No experience section found

  // 2. Collect lines until the next section header
  const experienceLines = [];
  for (let i = experienceStart; i < lines.length; i++) {
    if (isSectionHeader(lines[i])) break;
    experienceLines.push(lines[i]);
  }

  // 3. Extract bullets
  const bullets = [];

  for (const line of experienceLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isBulletLine(trimmed)) {
      // Strip the bullet marker
      const cleaned = trimmed.replace(/^[-•*▪▸►◦‣⁃]\s*/, "").replace(/^\d+[.)]\s*/, "").trim();
      if (cleaned.length >= 10) { // Skip very short fragments
        bullets.push(cleaned);
      }
    } else if (/^\s{2,}/.test(line) && /^[A-Z]/.test(trimmed) && trimmed.length >= 15) {
      // Indented line starting with uppercase — likely a bullet without a marker
      // But skip lines that look like job titles/dates (contain | or – with dates)
      if (!/\b\d{4}\b/.test(trimmed) && !/[|–—]/.test(trimmed)) {
        bullets.push(trimmed);
      }
    }
  }

  return bullets;
}
