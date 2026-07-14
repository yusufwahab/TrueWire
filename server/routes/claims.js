import { Router } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabaseAdmin.js";
import { mapDbClaims } from "../lib/mapClaim.js";
import { CLAIMS, sortByFastestRising } from "../../src/data/seed.js";

export const claimsRouter = Router();

const SELECT = "*, claim_reports(*), claim_sources(stance, article_url, sources(name))";

claimsRouter.get("/trending", async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin.from("claims").select(SELECT).order("created_at", { ascending: false }).limit(30);
      if (error) throw error;
      if (data?.length) return res.json({ claims: sortByFastestRising(mapDbClaims(data)), live: true });
    } catch (err) {
      console.error("[claims/trending] falling back to seed data:", err.message);
    }
  }
  res.json({ claims: sortByFastestRising(CLAIMS), live: false });
});

claimsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin.from("claims").select(SELECT).or(`id.eq.${id},slug.eq.${id}`).maybeSingle();
      if (error) throw error;
      if (data) return res.json({ claim: mapDbClaims([data])[0], live: true });
    } catch (err) {
      console.error("[claims/:id] falling back to seed data:", err.message);
    }
  }

  const claim = CLAIMS.find((c) => c.id === id || c.slug === id);
  if (!claim) return res.status(404).json({ error: "Claim not found" });
  res.json({ claim, live: false });
});
