// Verb Analyzer
// Detects weak action verbs/phrases in resume bullet points and suggests
// stronger, more impactful alternatives.

/**
 * Dictionary of weak verbs/phrases → suggested strong alternatives.
 * Keys are lowercased phrases to match against the start (or near-start)
 * of a bullet point. Values are arrays of strong replacement verbs.
 */
const WEAK_VERB_MAP = {
  // Vague responsibility phrases
  "responsible for":        ["Led", "Managed", "Directed", "Oversaw", "Owned"],
  "in charge of":           ["Led", "Managed", "Directed", "Headed"],
  "tasked with":            ["Executed", "Delivered", "Accomplished", "Drove"],
  "duties included":        ["Delivered", "Executed", "Performed", "Accomplished"],
  "duties include":         ["Deliver", "Execute", "Perform", "Accomplish"],
  "assigned to":            ["Spearheaded", "Led", "Drove", "Owned"],

  // Passive/weak verbs
  "worked on":              ["Developed", "Built", "Engineered", "Designed"],
  "worked with":            ["Collaborated with", "Partnered with", "Coordinated with"],
  "helped":                 ["Facilitated", "Enabled", "Supported", "Contributed to"],
  "helped with":            ["Facilitated", "Streamlined", "Contributed to"],
  "assisted":               ["Supported", "Facilitated", "Enabled", "Contributed to"],
  "assisted with":          ["Supported", "Facilitated", "Contributed to"],
  "assisted in":            ["Contributed to", "Facilitated", "Supported"],
  "participated in":        ["Contributed to", "Drove", "Collaborated on"],
  "involved in":            ["Contributed to", "Drove", "Delivered"],
  "handled":                ["Managed", "Directed", "Coordinated", "Oversaw"],
  "did":                    ["Executed", "Completed", "Delivered", "Accomplished"],
  "made":                   ["Created", "Developed", "Produced", "Designed"],
  "got":                    ["Achieved", "Secured", "Obtained", "Earned"],
  "used":                   ["Leveraged", "Utilized", "Applied", "Employed"],
  "utilized":               ["Leveraged", "Applied", "Employed"],

  // Generic/overused starters
  "was responsible for":    ["Led", "Managed", "Directed", "Delivered"],
  "had to":                 ["Delivered", "Executed", "Managed"],
  "was part of":            ["Contributed to", "Played a key role in"],
  "was involved in":        ["Contributed to", "Drove", "Spearheaded"],
  "took care of":           ["Managed", "Maintained", "Administered"],
  "looked after":           ["Managed", "Oversaw", "Maintained"],
  "dealt with":             ["Resolved", "Addressed", "Managed"],
  "took part in":           ["Contributed to", "Participated in", "Collaborated on"],
  "put together":           ["Assembled", "Created", "Developed", "Designed"],
};

/**
 * Analyze a bullet point for weak action verbs.
 *
 * Checks if the bullet starts with (or contains near the start, within the
 * first ~60 characters) a weak verb or phrase from the dictionary.
 *
 * @param {string} bullet - A single bullet point string.
 * @returns {{ hasWeakVerb: boolean, weakPhrase: string | null, suggestions: string[] }}
 */
export function analyzeVerb(bullet) {
  const lower = bullet.toLowerCase().trim();

  // Check each weak phrase — match at the start or within the first ~60 chars
  for (const [phrase, suggestions] of Object.entries(WEAK_VERB_MAP)) {
    const idx = lower.indexOf(phrase);
    // Found near the beginning of the bullet (within first 60 chars)
    if (idx >= 0 && idx <= 60) {
      return {
        hasWeakVerb: true,
        weakPhrase: bullet.substring(idx, idx + phrase.length),
        suggestions,
      };
    }
  }

  return { hasWeakVerb: false, weakPhrase: null, suggestions: [] };
}
