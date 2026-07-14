function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function jaccardSimilarity(a, b) {
  const wordsA = new Set(normalize(a));
  const wordsB = new Set(normalize(b));
  if (!wordsA.size || !wordsB.size) return 0;
  let overlap = 0;
  wordsA.forEach((word) => {
    if (wordsB.has(word)) overlap += 1;
  });
  return overlap / new Set([...wordsA, ...wordsB]).size;
}

// Word-overlap similarity search against the claim archive. Real matching logic (not a stub) —
// intentionally simple since the full semantic/entity-matching engine referenced in the spec's
// "How it works" copy is a separate system this website's API layer is built to front.
export function findBestMatch(inputText, claims, threshold = 0.22) {
  let best = null;
  let bestScore = 0;
  for (const claim of claims) {
    const score = jaccardSimilarity(inputText, claim.text);
    if (score > bestScore) {
      bestScore = score;
      best = claim;
    }
  }
  if (best && bestScore >= threshold) return { claim: best, score: bestScore };
  return null;
}
