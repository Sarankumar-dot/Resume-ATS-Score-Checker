// Analysis Routes
// POST /api/analysis/:resumeId/structure    — section detection + ATS formatting check
// POST /api/analysis/:resumeId/match        — JD keyword matching + scoring
// GET  /api/analysis/:resumeId/suggestions  — action verb + quantification suggestions
// GET  /api/analysis/:resumeId/report       — comprehensive weighted scoring report
// GET  /api/analysis                        — get list of past analyses
// GET  /api/analysis/:id                    — fetch a saved analysis

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  structureCheckSchema,
  matchJdSchema,
  getAnalysisSchema,
  rewriteBulletSchema,
} from "../validators/analysis.validator.js";
import * as analysisController from "../controllers/analysis.controller.js";

const router = Router();

// ── Swagger component schemas ────────────────────────────────────────────────

/**
 * @swagger
 * components:
 *   schemas:
 *     SectionResult:
 *       type: object
 *       properties:
 *         found:
 *           type: boolean
 *         label:
 *           type: string
 *         snippet:
 *           type: string
 *           nullable: true
 *     AtsIssue:
 *       type: object
 *       properties:
 *         issue:
 *           type: string
 *         severity:
 *           type: string
 *           enum: [warning, info]
 *         detail:
 *           type: string
 *     StructureCheckResponse:
 *       type: object
 *       properties:
 *         sections:
 *           type: object
 *           properties:
 *             contact:
 *               $ref: '#/components/schemas/SectionResult'
 *             summary:
 *               $ref: '#/components/schemas/SectionResult'
 *             skills:
 *               $ref: '#/components/schemas/SectionResult'
 *             experience:
 *               $ref: '#/components/schemas/SectionResult'
 *             education:
 *               $ref: '#/components/schemas/SectionResult'
 *             projects:
 *               $ref: '#/components/schemas/SectionResult'
 *         atsIssues:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AtsIssue'
 *     AnalysisRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         resume_id:
 *           type: string
 *           format: uuid
 *         match_score:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         matched_keywords:
 *           type: array
 *           items:
 *             type: string
 *         missing_keywords:
 *           type: array
 *           items:
 *             type: string
 *         jd_text:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

// ── POST /analysis/:resumeId/structure ───────────────────────────────────────

/**
 * @swagger
 * /analysis/{resumeId}/structure:
 *   post:
 *     summary: Analyze resume structure
 *     description: >
 *       Detects standard resume sections (Contact, Summary, Skills, Experience,
 *       Education, Projects) and flags common ATS-breaking formatting issues.
 *     tags:
 *       - Analysis
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the uploaded resume
 *     responses:
 *       200:
 *         description: Structure analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StructureCheckResponse'
 *       400:
 *         description: Invalid resumeId format
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Resume does not belong to the authenticated user
 *       404:
 *         description: Resume not found
 */
router.post(
  "/analysis/:resumeId/structure",
  authenticate,
  validate(structureCheckSchema),
  analysisController.checkStructure
);

// ── POST /analysis/:resumeId/match ───────────────────────────────────────────

/**
 * @swagger
 * /analysis/{resumeId}/match:
 *   post:
 *     summary: Match resume against job description
 *     description: >
 *       Extracts keywords from the provided job description, scores the resume
 *       against them, and persists the analysis. Returns the saved analysis
 *       record with score, matched keywords, and missing keywords.
 *     tags:
 *       - Analysis
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the uploaded resume
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jdText
 *             properties:
 *               jdText:
 *                 type: string
 *                 minLength: 50
 *                 description: Full job description text (min 50 characters)
 *     responses:
 *       201:
 *         description: Analysis created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   $ref: '#/components/schemas/AnalysisRecord'
 *       400:
 *         description: Validation error (invalid UUID or JD too short)
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Resume does not belong to the authenticated user
 *       404:
 *         description: Resume not found
 */
router.post(
  "/analysis/:resumeId/match",
  authenticate,
  validate(matchJdSchema),
  analysisController.matchJd
);

// ── GET /analysis/:id ────────────────────────────────────────────────────────

/**
 * @swagger
 * /analysis/{id}:
 *   get:
 *     summary: Get a saved analysis
 *     description: >
 *       Fetches a previously saved analysis by its ID. Only accessible by the
 *       user who created it.
 *     tags:
 *       - Analysis
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the analysis
 *     responses:
 *       200:
 *         description: Analysis found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   $ref: '#/components/schemas/AnalysisRecord'
 *       400:
 *         description: Invalid analysis id format
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Analysis does not belong to the authenticated user
 *       404:
 *         description: Analysis not found
 */
router.get(
  "/analysis/:id",
  authenticate,
  validate(getAnalysisSchema),
  analysisController.getAnalysis
);

// ── GET /analysis/:resumeId/suggestions ──────────────────────────────────────

/**
 * @swagger
 * /analysis/{resumeId}/suggestions:
 *   get:
 *     summary: Get action verb and quantification suggestions
 *     description: >
 *       Analyzes the Experience section bullet points for weak action verbs
 *       and missing quantifiable metrics. Returns only flagged bullets with
 *       specific improvement suggestions.
 *     tags:
 *       - Analysis
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the uploaded resume
 *     responses:
 *       200:
 *         description: Suggestions computed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bullet:
 *                         type: string
 *                       weakVerb:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           phrase:
 *                             type: string
 *                           suggestions:
 *                             type: array
 *                             items:
 *                               type: string
 *                       missingMetric:
 *                         type: boolean
 *                 totalBullets:
 *                   type: integer
 *       400:
 *         description: Invalid resumeId format
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Resume does not belong to the authenticated user
 *       404:
 *         description: Resume not found
 */
router.get(
  "/analysis/:resumeId/suggestions",
  authenticate,
  validate(structureCheckSchema),
  analysisController.getSuggestions
);

// ── GET /analysis/:resumeId/report ───────────────────────────────────────────

/**
 * @swagger
 * /analysis/{resumeId}/report:
 *   get:
 *     summary: Get comprehensive weighted scoring report
 *     description: >
 *       Aggregates all analysis checks (sections, ATS issues, match score, suggestions,
 *       soft skills, repetition, file format) into a structured, weighted category point system.
 *     tags:
 *       - Analysis
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the uploaded resume
 *     responses:
 *       200:
 *         description: Report computed successfully
 *       400:
 *         description: Invalid resumeId format
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Resume does not belong to the authenticated user
 *       404:
 *         description: Resume not found
 */
router.get(
  "/analysis/:resumeId/report",
  authenticate,
  validate(structureCheckSchema),
  analysisController.getReport
);

// ── GET /analysis ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /analysis:
 *   get:
 *     summary: Get history of all analyses
 *     description: Returns a lightweight list of all past analyses for the authenticated user, ordered by most recent.
 *     tags:
 *       - Analysis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of analyses retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get("/analysis", authenticate, analysisController.getAnalysisList);

// ── POST /analysis/:resumeId/rewrite-bullet ──────────────────────────────────

const llmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // strict limit for LLM calls per IP
  message: { error: "Too many AI rewrite requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /analysis/{resumeId}/rewrite-bullet:
 *   post:
 *     summary: Rewrite a resume bullet point using AI
 *     description: Leverages the Gemini API to improve a resume bullet point with stronger verbs and plausible quantification placeholders, using the JD context from the most recent analysis.
 *     tags:
 *       - Analysis
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the resume
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bulletText
 *             properties:
 *               bulletText:
 *                 type: string
 *                 description: The original bullet point text
 *     responses:
 *       200:
 *         description: Bullet rewritten successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 original:
 *                   type: string
 *                 rewritten:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Resume does not belong to the user
 *       404:
 *         description: Resume not found
 *       429:
 *         description: Too many requests
 */
router.post(
  "/analysis/:resumeId/rewrite-bullet",
  authenticate,
  llmLimiter,
  validate(rewriteBulletSchema),
  analysisController.rewriteBullet
);

// ── POST /analysis/:resumeId/ai-review ───────────────────────────────────────

/**
 * @swagger
 * /analysis/{resumeId}/ai-review:
 *   post:
 *     summary: Generate a holistic AI review of the resume
 *     description: Leverages the Gemini API to provide 3-5 high-impact suggestions for improving the resume overall.
 *     tags:
 *       - Analysis
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the resume
 *     responses:
 *       200:
 *         description: AI Review generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviewPoints:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Resume does not belong to the user
 *       404:
 *         description: Resume not found
 *       429:
 *         description: Too many requests
 */
router.post(
  "/analysis/:resumeId/ai-review",
  authenticate,
  llmLimiter,
  validate(structureCheckSchema),
  analysisController.generateAiReview
);

export default router;
