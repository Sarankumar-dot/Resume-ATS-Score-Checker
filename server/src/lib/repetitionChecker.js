// Repetition Checker
// Analyzes Experience bullets for repeated action verbs, evaluating language variety.

/**
 * Checks for language variety by extracting the first word (verb) of each bullet.
 *
 * @param {string[]} bullets - Array of extracted bullet point strings.
 * @returns {{ repeatedVerbs: { verb: string, count: number }[], varietyScore: number }}
 */
export function checkRepetition(bullets) {
  if (!bullets || bullets.length === 0) {
    return { repeatedVerbs: [], varietyScore: 100 };
  }

  const verbCounts = new Map();
  const verbs = [];

  for (const bullet of bullets) {
    // Extract first word, strip punctuation, lowercase
    const firstWord = bullet.split(/\s+/)[0].replace(/[^a-zA-Z]/g, "").toLowerCase();
    
    if (firstWord && firstWord.length > 2) { // Ignore short/empty tokens
      verbCounts.set(firstWord, (verbCounts.get(firstWord) || 0) + 1);
      verbs.push(firstWord);
    }
  }

  const repeatedVerbs = [];
  for (const [verb, count] of verbCounts.entries()) {
    if (count >= 3) {
      repeatedVerbs.push({ verb, count });
    }
  }

  // Calculate variety score: 0 to 100 based on uniqueness
  // If 10 bullets use 10 different verbs, score = 100.
  // If 10 bullets use 5 unique verbs, score = 50.
  const uniqueCount = verbCounts.size;
  const totalVerbs = verbs.length;
  
  let varietyScore = 100;
  if (totalVerbs > 0) {
    varietyScore = Math.round((uniqueCount / totalVerbs) * 100);
  }

  // Sort repeated verbs descending by count
  repeatedVerbs.sort((a, b) => b.count - a.count);

  return { repeatedVerbs, varietyScore };
}
