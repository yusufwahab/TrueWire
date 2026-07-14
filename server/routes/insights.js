import { Router } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabaseAdmin.js";
import { INSIGHTS } from "../../src/data/seed.js";

export const insightsRouter = Router();

function mapDbInsights(rows) {
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    category: r.category,
    heroImageQuery: r.hero_image_query,
    publishedAt: r.published_at,
    body: r.body,
  }));
}

insightsRouter.get("/", async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin.from("insights").select("*").order("published_at", { ascending: false });
      if (error) throw error;
      if (data?.length) return res.json({ insights: mapDbInsights(data) });
    } catch (err) {
      console.error("[insights] falling back to seed data:", err.message);
    }
  }
  res.json({ insights: INSIGHTS });
});

insightsRouter.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin.from("insights").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (data) return res.json({ insight: mapDbInsights([data])[0] });
    } catch (err) {
      console.error("[insights/:slug] falling back to seed data:", err.message);
    }
  }

  const insight = INSIGHTS.find((i) => i.slug === slug);
  if (!insight) return res.status(404).json({ error: "Not found" });
  res.json({ insight });
});
