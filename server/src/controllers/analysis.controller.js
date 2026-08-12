// Analysis Controller
// Thin HTTP layer — delegates all work to the analysis service.

import * as analysisService from "../services/analysis.service.js";

/**
 * POST /api/analysis/:resumeId/structure
 * Runs section detection and ATS formatting checks on a stored resume.
 * Returns: { sections, atsIssues }
 */
export async function checkStructure(req, res, next) {
  try {
    const { resumeId } = req.params;
    const result = await analysisService.analyzeStructure(
      resumeId,
      req.user.userId
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/analysis/:resumeId/match
 * Matches resume against a job description, computes score, persists analysis.
 * Body: { jdText: string }
 * Returns: the saved analysis record.
 */
export async function matchJd(req, res, next) {
  try {
    const { resumeId } = req.params;
    const { jdText } = req.body;
    const analysis = await analysisService.matchJobDescription(
      resumeId,
      req.user.userId,
      jdText
    );
    return res.status(201).json({ analysis });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analysis/:id
 * Fetches a saved analysis by ID.
 * Returns: the analysis record.
 */
export async function getAnalysis(req, res, next) {
  try {
    const { id } = req.params;
    const analysis = await analysisService.getAnalysisById(
      id,
      req.user.userId
    );
    return res.status(200).json({ analysis });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analysis/:resumeId/suggestions
 * Returns action verb + quantification suggestions for experience bullets.
 * Returns: { suggestions: [...], totalBullets: number }
 */
export async function getSuggestions(req, res, next) {
  try {
    const { resumeId } = req.params;
    const result = await analysisService.analyzeSuggestions(
      resumeId,
      req.user.userId
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analysis/:resumeId/report
 * Returns the comprehensive weighted scoring report (Phase 5/6).
 */
export async function getReport(req, res, next) {
  try {
    const { resumeId } = req.params;
    const report = await analysisService.getFullReport(
      resumeId,
      req.user.userId
    );
    return res.status(200).json(report);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analysis
 * Returns a lightweight list of the user's analyses.
 */
export async function getAnalysisList(req, res, next) {
  try {
    const list = await analysisService.getAnalysisHistory(req.user.userId);
    return res.status(200).json({ analyses: list });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/analysis/:resumeId/rewrite-bullet
 * Rewrites a resume bullet point using AI.
 */
export async function rewriteBullet(req, res, next) {
  try {
    const { resumeId } = req.params;
    const { bulletText } = req.body;
    
    const rewritten = await analysisService.rewriteBullet(resumeId, bulletText, req.user.userId);
    
    return res.status(200).json({
      original: bulletText,
      rewritten
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/analysis/:resumeId/ai-review
 * Generates a holistic AI review of the entire resume.
 */
export async function generateAiReview(req, res, next) {
  try {
    const { resumeId } = req.params;
    
    const { reviewPoints } = await analysisService.generateAiReview(resumeId, req.user.userId);
    
    return res.status(200).json({ reviewPoints });
  } catch (err) {
    next(err);
  }
}
