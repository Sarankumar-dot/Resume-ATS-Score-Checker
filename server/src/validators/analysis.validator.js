// Analysis Validator — Zod schemas for analysis endpoints

import { z } from "zod";

/**
 * Schema for POST /api/analysis/:resumeId/structure
 * Validates that resumeId is a valid UUID in the URL params.
 */
export const structureCheckSchema = z.object({
  params: z.object({
    resumeId: z
      .string({ required_error: "resumeId is required" })
      .uuid("resumeId must be a valid UUID"),
  }),
});

/**
 * Schema for POST /api/analysis/:resumeId/match
 * Validates resumeId (UUID param) and jdText (body, min 50 chars).
 */
export const matchJdSchema = z.object({
  params: z.object({
    resumeId: z
      .string({ required_error: "resumeId is required" })
      .uuid("resumeId must be a valid UUID"),
  }),
  body: z.object({
    jdText: z
      .string({ required_error: "Job description text is required" })
      .min(50, "Job description must be at least 50 characters"),
  }),
});

/**
 * Schema for GET /api/analysis/:id
 * Validates that id is a valid UUID in the URL params.
 */
export const getAnalysisSchema = z.object({
  params: z.object({
    id: z
      .string({ required_error: "Analysis id is required" })
      .uuid("Analysis id must be a valid UUID"),
  }),
});

/**
 * Schema for POST /api/analysis/:resumeId/rewrite-bullet
 * Validates resumeId and bulletText.
 */
export const rewriteBulletSchema = z.object({
  params: z.object({
    resumeId: z
      .string({ required_error: "resumeId is required" })
      .uuid("resumeId must be a valid UUID"),
  }),
  body: z.object({
    bulletText: z
      .string({ required_error: "Bullet text is required" })
      .min(10, "Bullet text must be at least 10 characters"),
  }),
});
