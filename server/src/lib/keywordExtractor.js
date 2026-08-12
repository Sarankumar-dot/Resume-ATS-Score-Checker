// Keyword Extractor
// Tokenizes job description text, removes stopwords, and returns the most
// important keywords using weighted scoring:
//   1. Expanded stopword list filtering generic English + JD filler words
//   2. Positional weighting (terms under "Requirements"/"Qualifications" headers get boosted)
//   3. Technical term heuristic (mid-word capitals, dots, digits → likely tools/technologies)

// ── Stopwords ─────────────────────────────────────────────────────────────────

/**
 * Standard English stopwords (~150) + JD-specific filler words (~50).
 * JD fillers are words that appear frequently in job postings but carry zero
 * signal about what skills/tools the role actually needs.
 */
const STOPWORDS = new Set([
  // ── Standard English stopwords ──────────────────────────────────────────
  "a", "about", "above", "after", "again", "against", "all", "also", "am", "an",
  "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before",
  "being", "below", "between", "both", "but", "by", "can", "can't", "cannot",
  "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
  "down", "during", "each", "etc", "few", "for", "from", "further", "get", "gets",
  "got", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he",
  "her", "here", "hers", "herself", "him", "himself", "his", "how", "however",
  "i", "if", "in", "into", "is", "isn't", "it", "its", "itself",
  "just", "let", "like", "may", "me", "might", "more", "most", "must", "my",
  "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only", "or",
  "other", "our", "ours", "ourselves", "out", "over", "own", "per", "please",
  "same", "shall", "she", "should", "shouldn't", "so", "some", "such", "than",
  "that", "the", "their", "theirs", "them", "themselves", "then", "there",
  "these", "they", "this", "those", "through", "to", "too", "under", "until",
  "up", "upon", "us", "use", "used", "using", "very", "via", "was", "wasn't",
  "we", "well", "were", "weren't", "what", "when", "where", "which", "while",
  "who", "whom", "why", "will", "with", "within", "without", "won't", "would",
  "wouldn't", "you", "your", "yours", "yourself", "yourselves",

  // ── JD-specific filler words ────────────────────────────────────────────
  // These appear in nearly every job description but tell us nothing about
  // the actual technical skills or tools required.
  "ability", "across", "apply", "based", "benefit", "benefits", "bonus",
  "bring", "build", "candidate", "committed", "company", "competitive",
  "contribute", "create", "day", "deliver", "demonstrate", "description",
  "desire", "desired", "detail", "develop", "driven", "effective",
  "employer", "encourage", "ensure", "environment", "equal", "etc",
  "excellent", "exciting", "experience", "fast", "first", "focus",
  "follow", "good", "great", "grow", "growth", "help", "high", "hire",
  "ideal", "impact", "important", "including", "industry", "innovative",
  "interest", "job", "join", "keep", "key", "large", "lead", "learn",
  "level", "looking", "love", "maintain", "make", "manage", "minimum",
  "multiple", "need", "needs", "new", "offer", "open", "opportunity",
  "oriented", "paced", "part", "passion", "passionate", "people",
  "perform", "plus", "position", "prefer", "preferred", "provide",
  "qualifications", "qualified", "related", "require", "required",
  "requirements", "responsibilities", "responsible", "results", "role",
  "salary", "scale", "seeking", "skills", "strong", "succeed", "success",
  "successful", "support", "take", "talent", "team", "teams", "time",
  "together", "top", "understand", "understanding", "value", "values",
  "want", "way", "work", "working", "world", "year", "years",
  "best", "knowledge", "able", "comfortable",
]);

// ── Section header patterns ───────────────────────────────────────────────────

/**
 * Regex patterns that identify "requirements-like" section headers in JDs.
 * Terms appearing under these headers are more likely to be actual requirements.
 */
const REQUIREMENTS_HEADERS = [
  /^\s*(?:required?|requirements?)\s*:?\s*$/i,
  /^\s*(?:must[\s-]*haves?)\s*:?\s*$/i,
  /^\s*(?:qualifications?)\s*:?\s*$/i,
  /^\s*(?:what (?:you(?:'ll)?|we) (?:need|require|expect|are looking for))\s*:?\s*$/i,
  /^\s*(?:technical\s+)?(?:skills?|competencies)\s*(?:required)?\s*:?\s*$/i,
  /^\s*(?:minimum|preferred)\s+qualifications?\s*:?\s*$/i,
  /^\s*(?:key\s+)?responsibilities\s*:?\s*$/i,
  /^\s*(?:what you(?:'ll)? (?:do|bring))\s*:?\s*$/i,
];

/**
 * Check if a line looks like a requirements-type section header.
 * @param {string} line
 * @returns {boolean}
 */
function isRequirementsHeader(line) {
  const trimmed = line.trim();
  if (trimmed.length > 80 || trimmed.length < 3) return false;
  return REQUIREMENTS_HEADERS.some((re) => re.test(trimmed));
}

// ── Technical term heuristic ──────────────────────────────────────────────────

/**
 * Check if a raw (pre-lowercase) token looks like a technical term.
 * Heuristics: mid-word uppercase (TypeScript), dots (Node.js), digits (S3, EC2),
 * slashes (CI/CD), hash (C#), plus (C++).
 * @param {string} rawToken - The token BEFORE lowercasing.
 * @returns {boolean}
 */
function looksLikeTechTerm(rawToken) {
  // Mid-word uppercase: "TypeScript", "GraphQL", "PostgreSQL"
  if (/[a-z][A-Z]/.test(rawToken)) return true;
  // Contains dot: "Node.js", "ASP.NET", "Vue.js"
  if (/\w\.\w/.test(rawToken)) return true;
  // Contains digits mixed with letters: "S3", "EC2", "H2", "k8s"
  if (/[a-zA-Z]\d|\d[a-zA-Z]/.test(rawToken)) return true;
  // Contains slash: "CI/CD", "TCP/IP"
  if (/\w\/\w/.test(rawToken)) return true;
  // Contains hash or plus: "C#", "C++"
  if (/[#+]/.test(rawToken)) return true;
  // All-uppercase 2-5 chars (acronyms): "AWS", "GCP", "REST", "SQL"
  if (/^[A-Z]{2,5}$/.test(rawToken)) return true;
  return false;
}

// ── Tokenizer ─────────────────────────────────────────────────────────────────

/**
 * Tokenize text into an array of meaningful, lowercased terms.
 * Strips punctuation, removes stopwords, and filters tokens < 3 characters.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#./-]/g, " ") // keep letters, numbers, +, #, ., /, -
    .split(/\s+/)
    .map((t) => t.replace(/^[.\-/]+|[.\-/]+$/g, "")) // strip leading/trailing punct
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

/**
 * Tokenize while preserving original casing (for tech-term detection).
 * Returns array of { lower, raw } objects.
 * @param {string} text
 * @returns {{ lower: string, raw: string }[]}
 */
function tokenizeWithCase(text) {
  // Split on whitespace, process each raw token
  const rawTokens = text.split(/\s+/).filter(Boolean);
  const result = [];

  for (const raw of rawTokens) {
    // Strip surrounding punctuation but keep internal dots/slashes/hashes
    const cleaned = raw.replace(/^[^a-zA-Z0-9#+]+|[^a-zA-Z0-9#+.]+$/g, "");
    if (!cleaned || cleaned.length < 2) continue;

    const lower = cleaned.toLowerCase();
    if (lower.length >= 3 && !STOPWORDS.has(lower)) {
      result.push({ lower, raw: cleaned });
    }
  }

  return result;
}

// ── Keyword Extraction ────────────────────────────────────────────────────────

/**
 * Extract the most important keywords from a job description.
 *
 * Scoring uses three signals beyond raw frequency:
 *   1. Positional weight: terms under "Requirements"/"Qualifications" headers
 *      get a 1.5× multiplier
 *   2. Technical term boost: tokens with mid-word caps, dots, digits, slashes
 *      get a 2× multiplier (almost always tools/technologies)
 *   3. Bigram extraction: frequent two-word phrases (2+ occurrences) are included
 *      to capture multi-word terms like "machine learning", "react native"
 *
 * @param {string} jdText - The full job description text.
 * @param {number} [topN=25] - Maximum number of keywords to return.
 * @returns {string[]} Sorted array of keyword strings (highest score first).
 */
export function extractKeywords(jdText, topN = 25) {
  const lines = jdText.split("\n");

  // ── Pass 1: Identify which lines are in "requirements" sections ─────────
  // A requirements section starts at a recognized header and ends at the next
  // blank line followed by a different header, or end of text.
  const lineIsRequirements = new Array(lines.length).fill(false);
  let inRequirements = false;
  let blankLineCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (isRequirementsHeader(trimmed)) {
      inRequirements = true;
      blankLineCount = 0;
      continue;
    }

    if (inRequirements) {
      if (trimmed === "") {
        blankLineCount++;
        // Two consecutive blank lines or a blank + next header → end section
        if (blankLineCount >= 2) inRequirements = false;
      } else {
        blankLineCount = 0;
        lineIsRequirements[i] = true;
      }
    }
  }

  // ── Pass 2: Tokenize each line, accumulate weighted scores ──────────────
  const scores = new Map();       // term → weighted score
  const techTerms = new Set();    // track which terms got the tech boost
  const allTokensLower = [];      // flat list for bigram extraction

  for (let i = 0; i < lines.length; i++) {
    const tokens = tokenizeWithCase(lines[i]);
    const positionalMultiplier = lineIsRequirements[i] ? 1.5 : 1.0;

    for (const { lower, raw } of tokens) {
      const isTech = looksLikeTechTerm(raw);
      if (isTech) techTerms.add(lower);

      const techMultiplier = isTech ? 2.0 : 1.0;
      const weight = positionalMultiplier * techMultiplier;

      scores.set(lower, (scores.get(lower) || 0) + weight);
      allTokensLower.push(lower);
    }
  }

  // ── Pass 3: Bigram extraction ───────────────────────────────────────────
  // Count bigram frequency from the flat token list (already stopword-filtered).
  // Only keep bigrams appearing 2+ times. Apply tech boost if either component
  // was flagged as a tech term.
  const bigramCounts = new Map();
  for (let i = 0; i < allTokensLower.length - 1; i++) {
    const bigram = `${allTokensLower[i]} ${allTokensLower[i + 1]}`;
    bigramCounts.set(bigram, (bigramCounts.get(bigram) || 0) + 1);
  }

  for (const [bigram, count] of bigramCounts) {
    if (count >= 2) {
      const [w1, w2] = bigram.split(" ");
      const techBoost = techTerms.has(w1) || techTerms.has(w2) ? 2.0 : 1.0;
      // Bigrams get a base boost of +1 so they compete fairly with unigrams
      scores.set(bigram, (count + 1) * techBoost);
    }
  }

  // ── Pass 4: Sort by weighted score and return top N ─────────────────────
  const sorted = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([term]) => term);

  return sorted;
}
