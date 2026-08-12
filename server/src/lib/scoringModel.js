// Scoring Model
// Aggregates all individual checks into a structured, weighted category point system.

/**
 * Computes a comprehensive weighted score from various analysis results.
 *
 * @param {object} resume - Resume record (needs file_size, mimetype).
 * @param {object} data - Collected results from all analysis modules.
 * @param {object} data.sections - Result of detectSections()
 * @param {object[]} data.atsIssues - Result of checkAtsFormatting()
 * @param {object} data.suggestionsData - Result of analyzeSuggestions() { suggestions, totalBullets }
 * @param {object} data.softSkills - Result of detectSoftSkills() { found, count }
 * @param {object} data.repetition - Result of checkRepetition() { varietyScore }
 * @param {object} data.fileCheck - Result of checkFileFormat() { passed, issues }
 * @param {number} data.matchScore - The JD hard-skills match score (0-100)
 * @returns {object} Structured scoring report.
 */
export function computeWeightedScore(resume, data) {
  const report = {
    categories: [],
    totalScore: 0,
    maxTotalScore: 0,
  };

  const {
    sections,
    atsIssues,
    suggestionsData,
    softSkills,
    repetition,
    fileCheck,
    matchScore,
  } = data;

  // Helper to build a check item
  const check = (label, passed, points, maxPoints, detail) => ({
    label,
    passed,
    points,
    maxPoints,
    detail,
  });

  // ── 1. Tailoring (45 pts) ────────────────────────────────────────────────
  // Hard Skills: scale 30 pts by matchScore (0-100)
  const hardSkillsPoints = Math.round((matchScore / 100) * 30);
  // Soft Skills: up to 5 pts. Let's say 5+ soft skills = full points.
  const softSkillsPoints = Math.min(softSkills.count, 5);
  
  // Action Verbs: 5 pts if < 30% of bullets have weak verbs.
  const weakCount = suggestionsData.suggestions.filter(s => s.weakVerb).length;
  let actionVerbPoints = 5;
  let actionVerbDetail = "Strong action verbs used.";
  if (suggestionsData.totalBullets > 0) {
    if (weakCount / suggestionsData.totalBullets >= 0.3) {
      actionVerbPoints = 0;
      actionVerbDetail = `${weakCount} bullets use weak action verbs.`;
    }
  }

  // Tailored Title (Future enhancement): auto-pass for now
  const titlePoints = 5;

  report.categories.push({
    name: "Tailoring",
    score: hardSkillsPoints + softSkillsPoints + actionVerbPoints + titlePoints,
    maxScore: 45,
    checks: [
      check("Hard Skills & Keywords", hardSkillsPoints >= 15, hardSkillsPoints, 30, `Matched ${matchScore}% of JD requirements.`),
      check("Soft Skills", softSkillsPoints === 5, softSkillsPoints, 5, `Found ${softSkills.count} soft skills.`),
      check("Action Verbs", actionVerbPoints === 5, actionVerbPoints, 5, actionVerbDetail),
      check("Tailored Job Title", true, titlePoints, 5, "Job title tailoring check is a future enhancement (Auto-pass)."),
    ],
  });

  // ── 2. Content (30 pts) ────────────────────────────────────────────────
  // ATS Parse Rate: 10 pts. Deduct 2 pts per ATS formatting issue.
  const atsParsePoints = Math.max(10 - atsIssues.length * 2, 0);
  
  // Quantitative Impact: 10 pts. Scale by % of bullets with metrics.
  // Missing metrics count:
  const missingMetricCount = suggestionsData.suggestions.filter(s => s.missingMetric).length;
  let quantPoints = 0;
  let quantDetail = "No bullets to quantify.";
  if (suggestionsData.totalBullets > 0) {
    const quantifiedCount = suggestionsData.totalBullets - missingMetricCount;
    quantPoints = Math.round((quantifiedCount / suggestionsData.totalBullets) * 10);
    quantDetail = `${quantifiedCount} of ${suggestionsData.totalBullets} bullets contain metrics.`;
  }

  // Repetition: 5 pts based on varietyScore (0-100)
  const repetitionPoints = Math.round((repetition.varietyScore / 100) * 5);
  
  // Spelling/Grammar: 5 pts (Auto-pass)
  const spellPoints = 5;

  report.categories.push({
    name: "Content",
    score: atsParsePoints + quantPoints + repetitionPoints + spellPoints,
    maxScore: 30,
    checks: [
      check("ATS Parse Rate", atsParsePoints >= 6, atsParsePoints, 10, `Found ${atsIssues.length} formatting issues.`),
      check("Quantitative Impact", quantPoints >= 6, quantPoints, 10, quantDetail),
      check("Word Variety", repetitionPoints >= 3, repetitionPoints, 5, `Variety score: ${repetition.varietyScore}%.`),
      check("Spelling & Grammar", true, spellPoints, 5, "Grammar check is a future enhancement (Auto-pass)."),
    ],
  });

  // ── 3. Sections (25 pts) ────────────────────────────────────────────────
  // Essential Sections: 15 pts. Each standard section (Experience, Education, Skills) is worth 5 pts.
  // We have Contact, Summary, Skills, Experience, Education, Projects in detection.
  // Let's just say Experience, Education, Skills are essential.
  let essentialPoints = 0;
  const essentials = ["experience", "education", "skills"];
  for (const key of essentials) {
    if (sections[key]) essentialPoints += 5;
  }
  
  // Contact Info: 10 pts. (Pass if contact section found, for now we just check detection).
  const contactPoints = sections.contact ? 10 : 0;

  report.categories.push({
    name: "Sections",
    score: essentialPoints + contactPoints,
    maxScore: 25,
    checks: [
      check("Essential Sections", essentialPoints === 15, essentialPoints, 15, `Found ${essentialPoints / 5} of 3 core sections (Experience, Education, Skills).`),
      check("Contact Information", contactPoints === 10, contactPoints, 10, contactPoints > 0 ? "Contact section detected." : "No contact section detected."),
    ],
  });

  // ── 4. ATS Essentials (45 pts) ───────────────────────────────────────────
  // File Format & Size: 10 pts.
  const formatPoints = fileCheck.passed ? 10 : 0;
  const formatDetail = fileCheck.passed ? "File format and size are ATS-friendly." : fileCheck.issues.join(" ");

  // Design/layout: 15 pts. Deduct based on atsIssues? We already did ATS Parse Rate above.
  // Let's use atsIssues count here as well for overall design. Deduct 3 per issue.
  const designPoints = Math.max(15 - atsIssues.length * 3, 0);

  // Email Address: 10 pts. We assume contact section implies email for now.
  const emailPoints = sections.contact ? 10 : 0;
  
  // Header Links: 10 pts. (Regex check for raw URLs in text not done, auto-pass for now)
  const linkPoints = 10;

  report.categories.push({
    name: "ATS Essentials",
    score: formatPoints + designPoints + emailPoints + linkPoints,
    maxScore: 45,
    checks: [
      check("File Format & Size", formatPoints === 10, formatPoints, 10, formatDetail),
      check("Standard Design & Layout", designPoints >= 10, designPoints, 15, designPoints < 15 ? "Detected non-standard layout elements." : "Layout appears standard."),
      check("Email Address", emailPoints === 10, emailPoints, 10, emailPoints > 0 ? "Email address detected." : "No email found."),
      check("Header Links", true, linkPoints, 10, "Header link check is a future enhancement (Auto-pass)."),
    ],
  });

  // Calculate totals
  for (const cat of report.categories) {
    report.totalScore += cat.score;
    report.maxTotalScore += cat.maxScore;
  }

  return report;
}
