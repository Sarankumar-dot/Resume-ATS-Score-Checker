// Resume Controller
// Thin HTTP layer — delegates all work to the service.

import * as resumeService from "../services/resume.service.js";

/**
 * POST /api/resumes/upload
 * Expects: multipart/form-data with field "resume" (PDF or DOCX, max 5 MB).
 * Returns: the saved resume record (id, filename, parsed_text, uploaded_at).
 */
export async function upload(req, res, next) {
  try {
    // multer attaches the file to req.file; auth middleware attaches req.user
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const resume = await resumeService.uploadResume(req.user.userId, req.file);

    return res.status(201).json({ resume });
  } catch (err) {
    next(err);
  }
}
