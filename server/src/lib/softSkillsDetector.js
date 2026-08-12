// Soft Skills Detector
// Detects common soft skills in resume text using a predefined list.

const SOFT_SKILLS = [
  "communication",
  "leadership",
  "teamwork",
  "problem solving",
  "problem-solving",
  "adaptability",
  "collaboration",
  "time management",
  "critical thinking",
  "mentoring",
  "coaching",
  "negotiation",
  "conflict resolution",
  "creativity",
  "emotional intelligence",
  "empathy",
  "presentation",
  "public speaking",
  "organization",
  "attention to detail",
  "interpersonal skills",
  "flexibility",
  "decision making",
  "decision-making",
  "work ethic",
  "active listening",
  "persuasion",
  "delegation",
  "strategic thinking",
  "customer service",
  "multitasking",
];

/**
 * Detect soft skills from the resume text.
 * @param {string} resumeText
 * @returns {{ found: string[], count: number }}
 */
export function detectSoftSkills(resumeText) {
  const textLower = resumeText.toLowerCase();
  const found = new Set();

  for (const skill of SOFT_SKILLS) {
    // Simple substring match works fine for these phrases,
    // though word boundaries make it more accurate.
    const regex = new RegExp(`\\b${skill.replace("-", "[-\\s]")}\\b`, "i");
    if (regex.test(textLower)) {
      found.add(skill);
    }
  }

  const foundArray = Array.from(found);
  return {
    found: foundArray,
    count: foundArray.length,
  };
}
