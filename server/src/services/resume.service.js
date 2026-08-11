// Resume Service
// Business logic for resume upload, parsing, and storage.

import { parseResume } from "../lib/parser.js";
import * as ResumeModel from "../models/resume.model.js";

/**
 * Upload and parse a resume file, then persist it.
 *
 * @param {string} userId - The authenticated user's ID.
 * @param {Express.Multer.File} file - The multer file object (buffer in memory).
 * @returns {Promise<{ id, filename, parsed_text, uploaded_at }>}
 */
export async function uploadResume(userId, file) {
  // 1. Parse text out of the buffer
  const rawText = await parseResume(file.buffer, file.mimetype);

  // 2. Guard: scanned / image-only PDFs produce empty text
  const text = rawText.trim();
  if (!text) {
    const err = new Error(
      "Resume appears to be image-only or could not be parsed. Please upload a text-based PDF or DOCX."
    );
    err.status = 422;
    throw err;
  }

  // 3. Persist
  const resume = await ResumeModel.create(userId, file.originalname, text);

  // 4. Return only the fields needed by the client (never the raw buffer)
  return {
    id: resume.id,
    filename: resume.filename,
    parsed_text: resume.parsed_text,
    uploaded_at: resume.uploaded_at,
  };
}
