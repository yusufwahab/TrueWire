import { Router } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabaseAdmin.js";
import { mapDbClaims } from "../lib/mapClaim.js";
import { findBestMatch } from "../lib/matching.js";
import { CLAIMS } from "../../src/data/seed.js";

export const reportRouter = Router();

reportRouter.post("/", async (req, res) => {
  const { content = "", type = "text", category = null, contactEmail = null } = req.body || {};

  if (!content.trim()) {
    return res.status(400).json({ error: "Paste text, a link, or describe what you saw." });
  }

  let pool = CLAIMS;
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin.from("claims").select("*, claim_reports(*), claim_sources(stance, article_url, sources(name))");
      if (error) throw error;
      if (data?.length) pool = mapDbClaims(data);
    } catch (err) {
      console.error("[report] falling back to seed pool:", err.message);
    }
  }

  const match = findBestMatch(content, pool);
  let saved = false;

  if (isSupabaseConfigured) {
    const { error } = await supabaseAdmin.from("user_reports").insert({
      content,
      type,
      category,
      contact_email: contactEmail,
      matched_claim_id: match?.claim.id ?? null,
      status: "queued",
    });
    if (error) console.error("[report] insert failed:", error.message);
    saved = !error;
  }

  res.json({
    received: true,
    saved,
    matchedExistingClaim: Boolean(match),
    matchedClaim: match?.claim ?? null,
    message: match
      ? "This matches a claim we're already tracking — your report adds to the evidence and helps confirm how fast it's spreading."
      : "This joins our detection queue as a new claim and helps us catch it faster for everyone else the next time it's reported.",
  });
});
