import { supabaseAdmin, isSupabaseConfigured } from "./supabaseAdmin.js";
import { isGroqConfigured } from "./groq.js";
import { isGeminiConfigured } from "./gemini.js";
import { FEED_SOURCES } from "./feeds.js";
import { fetchFeedItems } from "./rssFetcher.js";
import { extractClaimFromItem } from "./claimExtraction.js";

const MAX_ITEMS_PER_SOURCE = Number(process.env.INGEST_MAX_ITEMS_PER_SOURCE) || 5;

export const isIngestionConfigured = isSupabaseConfigured && (isGroqConfigured || isGeminiConfigured);

function slugify(text) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60)
    .replace(/-+$/, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "claim"}-${suffix}`;
}

async function getOrCreateSourceId(sourceName) {
  const { data: existing } = await supabaseAdmin.from("sources").select("id").eq("name", sourceName).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabaseAdmin
    .from("sources")
    .insert({ name: sourceName, type: "factcheck" })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

async function alreadyProcessedGuids(sourceName) {
  const { data } = await supabaseAdmin.from("ingested_feed_items").select("item_guid").eq("source_name", sourceName);
  return new Set((data || []).map((r) => r.item_guid));
}

async function markProcessed(sourceName, guid, claimId = null) {
  const { error } = await supabaseAdmin.from("ingested_feed_items").insert({ source_name: sourceName, item_guid: guid, claim_id: claimId });
  if (error) console.error(`[ingestClaims] failed to mark ${sourceName}/${guid} processed:`, error.message);
}

async function createClaimFromExtraction(item, sourceName, extraction) {
  const { data: claim, error: claimError } = await supabaseAdmin
    .from("claims")
    .insert({
      slug: slugify(extraction.claimText),
      text: extraction.claimText,
      category: extraction.category,
      verdict: extraction.verdict,
      confidence: null, // no genuine confidence signal from extraction — leaving it unset (the
      // UI already hides the percentage badge for a null confidence) beats inventing a number.
      explanation: extraction.explanation,
      first_reported_at: item.isoDate || new Date().toISOString(),
    })
    .select("id")
    .single();
  if (claimError) throw claimError;

  const sourceId = await getOrCreateSourceId(sourceName);

  if (extraction.verdict !== "unconfirmed") {
    const { error: sourceLinkError } = await supabaseAdmin.from("claim_sources").insert({
      claim_id: claim.id,
      source_id: sourceId,
      article_url: item.link,
      stance: extraction.verdict === "disputed" ? "contradicts" : "corroborates",
    });
    if (sourceLinkError) console.error("[ingestClaims] claim_sources insert failed:", sourceLinkError.message);
  }

  const { error: reportError } = await supabaseAdmin
    .from("claim_reports")
    .insert({ claim_id: claim.id, bucket_at: new Date().toISOString(), count: 1 });
  if (reportError) console.error("[ingestClaims] claim_reports insert failed:", reportError.message);

  return claim.id;
}

// Polls the fact-check feeds in server/lib/feeds.js, extracts genuinely new Nigeria-relevant
// claims via Groq/Gemini, and inserts them — the realtime subscription and notifications
// trigger already built elsewhere pick these up automatically, no extra wiring needed here.
export async function runIngestionCycle() {
  if (!isIngestionConfigured) return;

  let totalNew = 0;
  let totalCreated = 0;
  let totalSkipped = 0;

  for (const source of FEED_SOURCES) {
    const items = await fetchFeedItems(source.url);
    if (!items.length) continue;

    const seenGuids = await alreadyProcessedGuids(source.name);
    const newItems = items.filter((item) => !seenGuids.has(item.guid)).slice(0, MAX_ITEMS_PER_SOURCE);
    totalNew += newItems.length;

    for (const item of newItems) {
      try {
        const extraction = await extractClaimFromItem(item, source.name);
        if (!extraction || !extraction.isNigeriaRelevant) {
          await markProcessed(source.name, item.guid);
          totalSkipped += 1;
          continue;
        }
        const claimId = await createClaimFromExtraction(item, source.name, extraction);
        await markProcessed(source.name, item.guid, claimId);
        totalCreated += 1;
      } catch (err) {
        console.error(`[ingestClaims] failed to process "${item.title}" from ${source.name}:`, err.message);
        await markProcessed(source.name, item.guid);
      }
    }
  }

  console.log(`[ingestClaims] cycle complete — ${totalNew} new items checked, ${totalCreated} claims created, ${totalSkipped} skipped as not Nigeria-relevant or unparseable.`);
}
