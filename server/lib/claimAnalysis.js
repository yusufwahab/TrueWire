import { analyzeWithGroq, isGroqConfigured } from "./groq.js";
import { analyzeWithGemini, isGeminiConfigured } from "./gemini.js";

const TTL_MS = 60 * 60 * 1000;
const cache = new Map();

export const isClaimAnalysisConfigured = isGroqConfigured || isGeminiConfigured;

// Called only when the word-overlap matcher (server/lib/matching.js) finds nothing in the
// archive. Tries Groq first (fast, free tier, no training-data caveat on the response), and
// Gemini second if Groq is unavailable or its free-tier quota is exhausted — so one provider
// running dry doesn't take the feature down, it just quietly hands off to the other. Falls back
// to the static canned message (handled by the caller) only if both are unset or both fail.
export async function analyzeUnmatchedClaim(text) {
  const key = text.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;

  let result = null;

  if (isGroqConfigured) {
    try {
      result = await analyzeWithGroq(text);
    } catch (err) {
      console.error("[claimAnalysis] Groq failed, falling back to Gemini:", err.message);
    }
  }

  if (!result && isGeminiConfigured) {
    try {
      result = await analyzeWithGemini(text);
    } catch (err) {
      console.error("[claimAnalysis] Gemini failed too:", err.message);
    }
  }

  if (result) cache.set(key, { at: Date.now(), data: result });
  return result;
}
