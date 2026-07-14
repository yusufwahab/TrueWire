// Shapes a Supabase `claims` row (with joined claim_sources/claim_reports) into the flat claim
// shape the frontend and matching logic both expect — the same shape as src/data/seed.js.
export function mapDbClaim(row) {
  return {
    id: row.id,
    slug: row.slug,
    text: row.text,
    category: row.category,
    verdict: row.verdict,
    confidence: row.confidence,
    firstReportedAt: row.first_reported_at,
    sourceCount: row.claim_sources?.length ?? 0,
    reportSeries: (row.claim_reports || [])
      .slice()
      .sort((a, b) => new Date(a.bucket_at) - new Date(b.bucket_at))
      .map((r) => ({ t: r.bucket_at, count: r.count })),
    explanation: row.explanation,
    sources: (row.claim_sources || []).map((cs) => ({
      name: cs.sources?.name ?? "Source",
      url: cs.article_url,
      stance: cs.stance,
    })),
  };
}

export function mapDbClaims(rows) {
  return rows.map(mapDbClaim);
}
