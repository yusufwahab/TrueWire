import { Router } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabaseAdmin.js";
import { mapDbClaims } from "../lib/mapClaim.js";
import { findBestMatch } from "../lib/matching.js";
import { analyzeUnmatchedClaim } from "../lib/claimAnalysis.js";
import { getUserIdFromRequest } from "../lib/authUser.js";
import { CLAIMS } from "../../src/data/seed.js";

export const verifyRouter = Router();

verifyRouter.post("/", async (req, res) => {
  const { inputType = "text", inputText = "", inputUrl = "" } = req.body || {};
  const text = inputType === "link" ? inputUrl : inputText;
  const userId = await getUserIdFromRequest(req);

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Paste some text or a link to verify." });
  }

  let pool = CLAIMS;
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin.from("claims").select("*, claim_reports(*), claim_sources(stance, article_url, sources(name))");
      if (error) throw error;
      if (data?.length) pool = mapDbClaims(data);
    } catch (err) {
      console.error("[verify] falling back to seed pool:", err.message);
    }
  }

  const match = findBestMatch(text, pool);

  if (isSupabaseConfigured) {
    supabaseAdmin
      .from("verify_submissions")
      .insert({ input_text: text, input_type: inputType, matched_claim_id: match?.claim.id ?? null, user_id: userId })
      .then(({ error }) => {
        if (error) console.error("[verify] submission log failed:", error.message);
      });
  }

  if (!match) {
    const analysis = await analyzeUnmatchedClaim(text);
    return res.json({
      verdict: analysis?.answerType === "general_knowledge" ? "general_knowledge" : "unconfirmed",
      confidence: null,
      matchScore: 0,
      claim: null,
      explanation:
        analysis?.explanation ||
        "We couldn't find a confident match for this in our fact-check archive yet. That doesn't mean it's false — it means we don't have enough evidence either way. It's been logged and queued for review.",
      suggestedCategory: analysis?.suggestedCategory ?? null,
      sources: [],
    });
  }

  res.json({
    verdict: match.claim.verdict,
    confidence: match.claim.confidence,
    matchScore: match.score,
    claim: match.claim,
    explanation: match.claim.explanation,
    sources: match.claim.sources || [],
  });
});
