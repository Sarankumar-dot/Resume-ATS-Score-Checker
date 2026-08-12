// Quantification Checker
// Checks whether a resume bullet point contains quantifiable metrics
// (numbers, percentages, dollar amounts, etc.).

/**
 * Patterns that indicate quantifiable metrics in a bullet point.
 * A bullet with at least one match is considered "quantified".
 */
const METRIC_PATTERNS = [
  /\d+%/,                          // percentages: 40%, 100%
  /\$[\d,.]+/,                     // dollar amounts: $50K, $1,000,000
  /£[\d,.]+/,                      // pound amounts
  /€[\d,.]+/,                      // euro amounts
  /\b\d+[kKmMbB]\b/,              // shorthand: 10K, 5M, 2B
  /\b\d{1,3}(?:,\d{3})+\b/,       // comma-separated numbers: 1,000 or 10,000,000
  /\b\d+\+?\s*(?:users?|clients?|customers?|employees?|members?|people|team\s*members?)\b/i,
  /\b\d+\+?\s*(?:projects?|applications?|apps?|features?|modules?|services?|endpoints?|components?)\b/i,
  /\b(?:increased?|reduced?|improved?|decreased?|grew|boosted?|cut|saved?|generated?|delivered?|achieved?)\b.*\b\d+/i,
  /\b\d+\+?\s*(?:x|times)\b/i,    // multipliers: 3x, 5 times
  /\b\d+\s*(?:hours?|days?|weeks?|months?|minutes?)\b/i,  // time metrics
];

/**
 * Check whether a bullet point contains quantifiable metrics.
 *
 * @param {string} bullet - A single bullet point string.
 * @returns {{ hasMetric: boolean }}
 */
export function checkQuantification(bullet) {
  for (const pattern of METRIC_PATTERNS) {
    if (pattern.test(bullet)) {
      return { hasMetric: true };
    }
  }
  return { hasMetric: false };
}
