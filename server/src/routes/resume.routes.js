// Resume Routes
// POST /api/resumes/upload — authenticated multipart upload.

import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../validators/resume.validator.js";
import { fileTypeFromBuffer } from "file-type";
import * as resumeController from "../controllers/resume.controller.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Resume:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         filename:
 *           type: string
 *         parsed_text:
 *           type: string
 *         uploaded_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /resumes/upload:
 *   post:
 *     summary: Upload and parse a resume
 *     description: >
 *       Accepts a PDF or DOCX resume (max 5 MB). Extracts the text content
 *       and stores it in the database linked to the authenticated user.
 *     tags:
 *       - Resumes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: PDF or DOCX file, max 5 MB
 *     responses:
 *       201:
 *         description: Resume uploaded and parsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resume:
 *                   $ref: '#/components/schemas/Resume'
 *       400:
 *         description: No file uploaded or unsupported file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *       413:
 *         description: File too large (exceeds 5 MB)
 *       422:
 *         description: Resume appears to be image-only and could not be parsed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/resumes/upload",
  authenticate,
  (req, res, next) => {
    // Run multer, then convert multer-specific errors to standard HTTP errors
    upload.single("resume")(req, res, (err) => {
      if (!err) return next();

      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ error: "File too large. Maximum size is 5 MB." });
      }
      // fileFilter rejection or other multer error
      return res
        .status(err.status || 400)
        .json({ error: err.message || "File upload failed." });
    });
  },
  async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded." });
    }
    
    // Validate magic bytes
    const type = await fileTypeFromBuffer(req.file.buffer);
    
    // DOCX files are zip archives, so file-type might identify them as zip or docx depending on structure.
    const isValid = type && (
      type.ext === "pdf" || 
      type.ext === "docx" || 
      type.ext === "zip" || 
      type.mime === "application/pdf"
    );
    
    if (!isValid) {
      return res.status(422).json({ error: "Invalid file content detected. Only PDF and DOCX files are allowed." });
    }
    
    next();
  },
  resumeController.upload
);

export default router;
