// Analysis Service
// Orchestrates resume structure analysis, JD-matching, suggestions, and retrieval.

import * as ResumeModel from "../models/resume.model.js";
import * as AnalysisModel from "../models/analysis.model.js";
import { detectSections } from "../lib/sectionDetector.js";
import { checkAtsFormatting } from "../lib/atsChecker.js";
import { extractKeywords } from "../lib/keywordExtractor.js";
import { scoreMatch } from "../lib/matchScorer.js";
import { extractBullets } from "../lib/bulletExtractor.js";
import { analyzeVerb } from "../lib/verbAnalyzer.js";
import { checkQuantification } from "../lib/quantificationChecker.js";
import { detectSoftSkills } from "../lib/softSkillsDetector.js";
import { checkRepetition } from "../lib/repetitionChecker.js";
import { checkFileFormat } from "../lib/fileChecker.js";
import { computeWeightedScore } from "../lib/scoringModel.js";

// ── Shared helper: fetch resume with 404 → 403 checks ───────────────────────

/**
 * Fetch a resume and verify ownership.
 * @param {string} resumeId
 * @param {string} userId
 * @returns {Promise<object>} The resume record.
 * @throws 404 if not found, 403 if not owned by userId.
 */
async function fetchResumeWithAuth(resumeId, userId) {
  const resume = await ResumeModel.findById(resumeId);

  if (!resume) {
    const err = new Error("Resume not found.");
    err.status = 404;
    throw err;
  }

  if (resume.user_id !== userId) {
    const err = new Error("You do not have access to this resume.");
    err.status = 403;
    throw err;
  }

  return resume;
}

// ── Phase 3: Structure analysis ──────────────────────────────────────────────

/**
 * Analyze a resume's structure: detect sections and flag ATS formatting issues.
 *
 * @param {string} resumeId - UUID of the resume to analyze.
 * @param {string} userId - UUID of the authenticated user (for ownership check).
 * @returns {Promise<{ sections: object, atsIssues: object[] }>}
 */
export async function analyzeStructure(resumeId, userId) {
  const resume = await fetchResumeWithAuth(resumeId, userId);

  const sections = detectSections(resume.parsed_text);
  const atsIssues = checkAtsFormatting(resume.parsed_text);

  return { sections, atsIssues };
}

// ── Phase 4: JD-matching ─────────────────────────────────────────────────────

/**
 * Match a resume against a job description, compute a score, and persist the analysis.
 *
 * @param {string} resumeId - UUID of the resume.
 * @param {string} userId - UUID of the authenticated user.
 * @param {string} jdText - The full job description text.
 * @returns {Promise<object>} The saved analysis record.
 */
export async function matchJobDescription(resumeId, userId, jdText) {
  const resume = await fetchResumeWithAuth(resumeId, userId);

  const jdKeywords = extractKeywords(jdText);

  const { score, matched, missing } = scoreMatch(
    resume.parsed_text,
    jdKeywords
  );

  const analysis = await AnalysisModel.create(
    userId,
    resumeId,
    jdText,
    score,
    matched,
    missing
  );

  return {
    id: analysis.id,
    resume_id: analysis.resume_id,
    match_score: analysis.match_score,
    matched_keywords: analysis.matched_keywords,
    missing_keywords: analysis.missing_keywords,
    jd_text: analysis.jd_text,
    created_at: analysis.created_at,
  };
}

// ── Fetch a saved analysis ───────────────────────────────────────────────────

/**
 * Get a saved analysis by its ID, with ownership check.
 *
 * @param {string} analysisId - UUID of the analysis.
 * @param {string} userId - UUID of the authenticated user.
 * @returns {Promise<object>} The analysis record.
 * @throws 404 if not found, 403 if not owned by userId.
 */
export async function getAnalysisById(analysisId, userId) {
  const analysis = await AnalysisModel.findById(analysisId);

  if (!analysis) {
    const err = new Error("Analysis not found.");
    err.status = 404;
    throw err;
  }

  if (analysis.user_id !== userId) {
    const err = new Error("You do not have access to this analysis.");
    err.status = 403;
    throw err;
  }

  return analysis;
}

/**
 * Get a lightweight list of all analyses for a user.
 *
 * @param {string} userId - UUID of the authenticated user.
 * @returns {Promise<object[]>} List of analyses.
 */
export async function getAnalysisHistory(userId) {
  const analyses = await AnalysisModel.findAllByUserId(userId);
  
  return analyses.map(a => ({
    id: a.id,
    filename: a.resume?.filename || "Unknown File",
    match_score: a.match_score,
    created_at: a.created_at,
  }));
}

// ── Phase 5: Action verb + quantification suggestions ────────────────────────

/**
 * Analyze a resume's experience bullets for weak verbs and missing metrics.
 *
 * Extracts bullet points from the Experience section, runs verb analysis and
 * quantification checks, and returns only flagged bullets (those with at least
 * one issue) to keep results focused and actionable.
 *
 * This does NOT persist to the database — it's a live computed result.
 *
 * @param {string} resumeId - UUID of the resume.
 * @param {string} userId - UUID of the authenticated user.
 * @returns {Promise<{ suggestions: object[], totalBullets: number }>}
 */
export async function analyzeSuggestions(resumeId, userId) {
  const resume = await fetchResumeWithAuth(resumeId, userId);

  const bullets = extractBullets(resume.parsed_text);
  const suggestions = [];

  for (const bullet of bullets) {
    const verbResult = analyzeVerb(bullet);
    const quantResult = checkQuantification(bullet);

    // Only include bullets that have at least one flag
    if (verbResult.hasWeakVerb || !quantResult.hasMetric) {
      suggestions.push({
        bullet,
        weakVerb: verbResult.hasWeakVerb
          ? { phrase: verbResult.weakPhrase, suggestions: verbResult.suggestions }
          : null,
        missingMetric: !quantResult.hasMetric,
      });
    }
  }

  return { suggestions, totalBullets: bullets.length };
}

// ── Phase 5/6: Comprehensive Weighted Report ──────────────────────────────────

/**
 * Orchestrates all analysis checks and computes a final weighted score report.
 * 
 * @param {string} resumeId - UUID of the resume.
 * @param {string} userId - UUID of the authenticated user.
 * @returns {Promise<object>} Structured scoring report.
 */
export async function getFullReport(resumeId, userId) {
  const resume = await fetchResumeWithAuth(resumeId, userId);

  // 1. Structure (Sections + ATS formatting)
  const sections = detectSections(resume.parsed_text);
  const atsIssues = checkAtsFormatting(resume.parsed_text);

  // 2. Suggestions (Verbs + Quant metrics)
  const bullets = extractBullets(resume.parsed_text);
  const suggestions = [];
  for (const bullet of bullets) {
    const verbResult = analyzeVerb(bullet);
    const quantResult = checkQuantification(bullet);
    if (verbResult.hasWeakVerb || !quantResult.hasMetric) {
      suggestions.push({
        bullet,
        weakVerb: verbResult.hasWeakVerb ? { phrase: verbResult.weakPhrase, suggestions: verbResult.suggestions } : null,
        missingMetric: !quantResult.hasMetric,
      });
    }
  }
  const suggestionsData = { suggestions, totalBullets: bullets.length };

  // 3. New checks: Soft Skills, Repetition, File Format
  const softSkills = detectSoftSkills(resume.parsed_text);
  const repetition = checkRepetition(bullets);
  const fileCheck = checkFileFormat(resume.mimetype, resume.file_size);

  // 4. Latest Match Score
  const latestAnalysis = await AnalysisModel.findLatestByResumeId(resumeId);
  const matchScore = latestAnalysis ? latestAnalysis.match_score : 0;

  // 5. Compute Weighted Score
  const report = computeWeightedScore(resume, {
    sections,
    atsIssues,
    suggestionsData,
    softSkills,
    repetition,
    fileCheck,
    matchScore,
  });

  report.suggestionsData = suggestionsData;

  return report;
}

// ── Phase 6.5: AI Rewrite ─────────────────────────────────────────────────────

import { generateRewrite } from "../lib/geminiClient.js";

/**
 * Rewrites a resume bullet point using the Gemini AI service.
 * @param {string} resumeId - UUID of the resume
 * @param {string} bulletText - The original bullet text
 * @param {string} userId - UUID of the authenticated user
 * @returns {Promise<string>} The rewritten bullet text
 */
export async function rewriteBullet(resumeId, bulletText, userId) {
  // Ensure ownership
  await fetchResumeWithAuth(resumeId, userId);
  
  // Optionally fetch the latest analysis to get the JD context
  const latestAnalysis = await AnalysisModel.findLatestByResumeId(resumeId);
  const jdContext = latestAnalysis?.jd_text || "";

  const prompt = `Rewrite this resume bullet point to use a strong action verb and include a quantifiable metric if plausible. 
Keep it truthful — do not invent specific numbers or achievements not implied by the original. 
Important constraint: You must not fabricate metrics or achievements. You should only suggest structural/verb improvements and use generic placeholders like "[X]%" or "[team size]" where a real metric would go if the user doesn't have one, rather than inventing a fake number.

${jdContext ? `Job context: ${jdContext}\n` : ""}
Original bullet: ${bulletText}

Return ONLY the rewritten bullet, no explanation, no quotes.`;

  const rewritten = await generateRewrite(prompt);
  return rewritten;
}

/**
 * Generates a holistic AI review of the entire resume.
 * @param {string} resumeId - UUID of the resume
 * @param {string} userId - UUID of the authenticated user
 * @returns {Promise<{reviewPoints: string[]}>} Array of review suggestions
 */
export async function generateAiReview(resumeId, userId) {
  const resume = await fetchResumeWithAuth(resumeId, userId);
  const latestAnalysis = await AnalysisModel.findLatestByResumeId(resumeId);
  
  const sections = detectSections(resume.parsed_text);
  const missingSections = ["contact", "summary", "skills", "experience", "education"]
    .filter(k => !sections[k]).join(", ");
    
  const atsIssues = checkAtsFormatting(resume.parsed_text).map(i => i.issue).join("; ");
  
  const jdContext = latestAnalysis?.jd_text 
    ? `Job Description: ${latestAnalysis.jd_text}`
    : "No job description provided. Give general resume feedback.";

  const prompt = `You are a senior resume reviewer. Based on the resume text and job description below, write 3-5 improvement suggestions. Each suggestion should be a full sentence or two explaining a specific, actionable improvement — not a short phrase or keyword. Reference specific gaps between the resume and the job description where relevant (e.g. missing skills, weak alignment, structural issues). 

Format your response as a numbered list, one suggestion per line, each written as a complete thought (2-3 sentences is ideal). Do not use any markdown formatting other than the numbers (e.g., 1. First suggestion...).

Resume text: ${resume.parsed_text.substring(0, 5000)}...
Missing keywords: ${latestAnalysis?.missing_keywords?.join(', ') || 'None'}
Missing sections: ${missingSections || 'None'}
ATS issues: ${atsIssues || 'None'}
${jdContext}`;

  const responseText = await generateRewrite(prompt);
  console.log("[generateAiReview RAW RESPONSE]", responseText);
  
  // Split on numbered list items (e.g. "1. ", "2. "), keeping multi-line content together.
  // First, normalize any leading/trailing whitespace per line.
  const cleaned = responseText.replace(/\r\n/g, '\n').trim();
  
  // Split on newline boundaries that start a new numbered item
  const rawPoints = cleaned.split(/\n(?=\d+\.\s)/);
  
  const reviewPoints = rawPoints
    .map(p => p.replace(/^\d+\.\s*/, '').trim())  // strip leading "1. "
    .filter(p => p.length > 0);  // only filter truly empty strings

  return { reviewPoints };
}
