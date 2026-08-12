// ATS Formatting Checker
// Heuristic-based checks on extracted text to flag common ATS-breaking issues.
//
// ⚠️  KNOWN LIMITATION: These checks operate on *extracted text only*, not the
// original PDF/DOCX structure. True layout analysis (detecting tables, images,
// multi-column layouts, text boxes, headers/footers) requires parsing the raw
// PDF page tree or DOCX XML — which is significantly more complex and is NOT
// attempted here. The heuristics below are best-effort indicators that correlate
// with ATS problems but are not definitive proof of formatting issues.

import { detectSections } from "./sectionDetector.js";

/**
 * @typedef {object} AtsIssue
 * @property {string} issue - Short title of the issue.
 * @property {'warning' | 'info'} severity - How critical the issue is.
 * @property {string} detail - Longer human-readable explanation.
 */

/**
 * Check parsed resume text for common ATS-breaking formatting patterns.
 *
 * @param {string} parsedText - Extracted text content from the resume.
 * @returns {AtsIssue[]} Array of detected issues (may be empty if no problems found).
 */
export function checkAtsFormatting(parsedText) {
  const issues = [];
  const text = parsedText || "";
  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  // ── 1. Very short text ──────────────────────────────────────────────────────
  // If the extracted text is extremely short, the original file likely contained
  // images, scanned pages, or complex layouts that the parser couldn't extract.
  if (text.trim().length < 100) {
    issues.push({
      issue: "Very little text extracted",
      severity: "warning",
      detail:
        "Only " +
        text.trim().length +
        " characters were extracted. This may indicate the resume is image-heavy, " +
        "scanned, or uses complex formatting (tables, text boxes) that ATS systems " +
        "cannot read. Consider using a simple, single-column, text-based layout.",
    });
  }

  // ── 2. No section headings at all ───────────────────────────────────────────
  // If detectSections finds zero sections, the resume likely lacks standard
  // structure, making it harder for ATS to categorize content.
  const sections = detectSections(text);
  const foundCount = Object.values(sections).filter((s) => s.found).length;

  if (foundCount === 0) {
    issues.push({
      issue: "No recognizable section headings",
      severity: "warning",
      detail:
        "We could not detect any standard resume sections (Summary, Experience, " +
        "Education, Skills, etc.). ATS systems rely on section headings to parse " +
        "content. Add clear headings like 'Experience', 'Education', and 'Skills'.",
    });
  } else if (foundCount <= 2) {
    issues.push({
      issue: "Few section headings detected",
      severity: "info",
      detail:
        "Only " +
        foundCount +
        " of 6 standard sections were detected. Consider adding " +
        "clear headings for Summary, Experience, Education, Skills, and Projects " +
        "to improve ATS compatibility.",
    });
  }

  // ── 3. Unusually short average line length (multi-column indicator) ─────────
  // Multi-column layouts often extract as many very short lines because the
  // parser reads column fragments. A normal single-column resume has average
  // line lengths of 40–80+ characters.
  if (lines.length >= 20) {
    const avgLineLength =
      lines.reduce((sum, l) => sum + l.trim().length, 0) / lines.length;

    if (avgLineLength < 15) {
      issues.push({
        issue: "Possible multi-column layout detected",
        severity: "info",
        detail:
          "The average line length is unusually short (" +
          Math.round(avgLineLength) +
          " characters). This often happens when a multi-column layout is " +
          "extracted as fragmented text. ATS systems may jumble or misread " +
          "multi-column content. Consider switching to a single-column layout.",
      });
    }
  }

  // ── 4. Extremely long unbroken text blocks ──────────────────────────────────
  // Walls of text without line breaks suggest missing paragraph/section structure.
  // We check for any single "paragraph" (block between blank lines) exceeding a
  // threshold length.
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  for (const para of paragraphs) {
    if (para.trim().length > 2000) {
      issues.push({
        issue: "Very long text block without breaks",
        severity: "info",
        detail:
          "A block of " +
          para.trim().length +
          " characters was found without paragraph breaks. " +
          "Large unstructured text blocks can make it harder for ATS systems to " +
          "identify individual experiences and qualifications. Break content into " +
          "clear sections with bullet points.",
      });
      break; // Report once, not for every long block
    }
  }

  // ── 5. Suspicious character patterns (table/column artifacts) ───────────────
  // Repeated pipes, excessive dashes, or unusual spacing patterns may indicate
  // table structures or decorative elements that don't parse well.
  const pipeLines = lines.filter((l) => (l.match(/\|/g) || []).length >= 3);
  if (pipeLines.length >= 3) {
    issues.push({
      issue: "Possible table formatting detected",
      severity: "info",
      detail:
        "Multiple lines contain pipe characters (|), suggesting table-based " +
        "formatting. Many ATS systems cannot parse tables correctly — the content " +
        "may be read out of order or skipped entirely. Use simple bullet points instead.",
    });
  }

  return issues;
}
