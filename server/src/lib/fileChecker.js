// File Checker
// Validates resume file format and size for ATS constraints.

/**
 * Validates the file mimetype and size.
 * @param {string|null} mimetype
 * @param {number|null} sizeInBytes
 * @returns {{ passed: boolean, issues: string[] }}
 */
export function checkFileFormat(mimetype, sizeInBytes) {
  const issues = [];

  // If no file data (old records), assume pass or warning
  if (!mimetype && !sizeInBytes) {
    return { passed: true, issues: [] };
  }

  // Allowed formats: PDF or DOCX
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (mimetype && !allowedMimes.includes(mimetype)) {
    issues.push("File format must be PDF or DOCX to be reliably parsed by ATS.");
  }

  // Max size: 2MB (2 * 1024 * 1024 = 2097152 bytes)
  const MAX_SIZE = 2 * 1024 * 1024;
  if (sizeInBytes && sizeInBytes > MAX_SIZE) {
    issues.push(`File is bloated (${(sizeInBytes / 1024 / 1024).toFixed(1)} MB). ATS systems often choke on files over 2MB. Remove heavy images or compress the PDF.`);
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}
