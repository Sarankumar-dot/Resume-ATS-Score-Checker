// Parser Lib
// Text extraction from PDF and DOCX buffers.
// No file I/O — all operations work on in-memory buffers passed from multer.

import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

/**
 * Extract plain text from a PDF buffer.
 * pdf-parse v2 API: new PDFParse({ data: buffer }).getText() → { text }
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
export async function parsePdf(buffer) {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text;
}

/**
 * Extract plain text from a DOCX buffer.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
export async function parseDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Dispatch to the correct parser based on mimetype.
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {Promise<string>}
 */
export async function parseResume(buffer, mimetype) {
  if (mimetype === "application/pdf") {
    return parsePdf(buffer);
  }
  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return parseDocx(buffer);
  }
  throw Object.assign(new Error("Unsupported file type."), { status: 400 });
}
