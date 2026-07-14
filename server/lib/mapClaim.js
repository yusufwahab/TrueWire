// Shapes a Supabase `claims` row (with joined claim_sources/claim_reports) into the flat claim
// shape the frontend and matching logic both expect — the same shape as src/data/seed.js.
export function mapDbClaim(row) {
  // claim_sources has no unique constraint on (claim_id, source_id), so re-running seed.sql (or
  // any duplicate insert) can leave the same source listed twice for a claim. Dedupe by name
  // here rather than relying on every caller to do it — this is a read-time fix, not a
  // destructive migration against existing data.
  const seen = new Set();
  const sources = [];
  for (const cs of row.claim_sources || []) {
    const name = cs.sources?.name ?? "Source";
    if (seen.has(name)) continue;
    seen.add(name);
    sources.push({ name, url: cs.article_url, stance: cs.stance });
  }

  return {
    id: row.id,
    slug: row.slug,
    text: row.text,
    category: row.category,
    verdict: row.verdict,
    confidence: row.confidence,
    firstReportedAt: row.first_reported_at,
    sourceCount: sources.length,
    reportSeries: (row.claim_reports || [])
      .slice()
      .sort((a, b) => new Date(a.bucket_at) - new Date(b.bucket_at))
      .map((r) => ({ t: r.bucket_at, count: r.count })),
    explanation: row.explanation,
    sources,
  };
}

export function mapDbClaims(rows) {
  return rows.map(mapDbClaim);
}
