// Resume Validator
// Multer configuration for resume file uploads.
// Validation happens at the middleware level — not Zod — because
// multipart file data doesn't flow through JSON body validation.

import multer from "multer";

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Multer fileFilter — rejects anything that isn't PDF or DOCX.
 */
function fileFilter(req, file, cb) {
  if (ACCEPTED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error("Only PDF and DOCX files are accepted."), {
        status: 400,
      }),
      false
    );
  }
}

/**
 * Configured multer instance.
 * - memoryStorage: buffer passed directly to parser, never written to disk.
 * - limits.fileSize: enforces 5 MB max; multer throws MulterError on exceed.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});
