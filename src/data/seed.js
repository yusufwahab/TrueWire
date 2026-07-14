// Fallback dataset used whenever Supabase / the API aren't configured yet (no keys) or a live
// call fails. Every claim text below is an illustrative, fictional example — not a report about
// a real named individual or organization's real statement.

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

function rampSeries(points, { start = 1, end = 20, jitter = 3 } = {}) {
  const series = [];
  for (let i = 0; i < points; i += 1) {
    const progress = i / (points - 1);
    const base = start + (end - start) * progress ** 1.6;
    const noise = (Math.sin(i * 1.7) * jitter) / 2;
    series.push({
      t: hoursAgo(points - i),
      count: Math.max(0, Math.round(base + noise)),
    });
  }
  return series;
}

function flatSeries(points, { level = 4, jitter = 1.5 } = {}) {
  const series = [];
  for (let i = 0; i < points; i += 1) {
    const noise = Math.sin(i * 2.1) * jitter;
    series.push({
      t: hoursAgo(points - i),
      count: Math.max(0, Math.round(level + noise)),
    });
  }
  return series;
}

export const CLAIMS = [
  {
    id: "c1",
    slug: "cbn-new-5000-note",
    text: "Video claims the Central Bank has begun printing a new ₦5,000 note set for release next month.",
    category: "Finance",
    verdict: "disputed",
    confidence: 0.88,
    firstReportedAt: hoursAgo(9),
    sourceCount: 14,
    reportSeries: rampSeries(12, { start: 2, end: 34 }),
    explanation:
      "The video circulating on WhatsApp reuses footage from a 2022 currency redesign briefing. The Central Bank has issued no notice of a new ₦5,000 denomination, and three of the newsrooms we track ran explicit denials this week.",
    sources: [
      { name: "Premium Times", url: "https://www.premiumtimesng.com", stance: "contradicts" },
      { name: "Dubawa", url: "https://dubawa.org", stance: "contradicts" },
      { name: "Channels TV", url: "https://www.channelstv.com", stance: "contradicts" },
    ],
  },
  {
    id: "c2",
    slug: "lagos-flood-alert-warning",
    text: "Message forwarded on WhatsApp warns of an imminent flood alert for Lagos Island this weekend.",
    category: "Security",
    verdict: "unconfirmed",
    confidence: 0.41,
    firstReportedAt: hoursAgo(4),
    sourceCount: 5,
    reportSeries: rampSeries(12, { start: 1, end: 22 }),
    explanation:
      "We haven't found a matching advisory from Lagos State Emergency Management or the Nigerian Meteorological Agency yet. The claim is spreading quickly enough that it's queued for human review rather than dismissed outright — treat it as unconfirmed, not false.",
    sources: [{ name: "NiMet (checked, no matching advisory found)", url: "https://nimet.gov.ng", stance: "contradicts" }],
  },
  {
    id: "c3",
    slug: "free-fuel-palliative-registration",
    text: "Post claims citizens can register online for a one-off ₦50,000 fuel subsidy palliative payment.",
    category: "Politics",
    verdict: "disputed",
    confidence: 0.93,
    firstReportedAt: hoursAgo(20),
    sourceCount: 22,
    reportSeries: rampSeries(12, { start: 10, end: 18, jitter: 4 }),
    explanation:
      "This is a recurring scam format that resurfaces under a new payment figure every few months, designed to harvest BVN and bank details through a fake registration link. No federal palliative programme has ever run through the link pattern being shared.",
    sources: [
      { name: "Vanguard", url: "https://www.vanguardngr.com", stance: "contradicts" },
      { name: "FactCheckHub", url: "https://factcheckhub.com", stance: "contradicts" },
    ],
  },
  {
    id: "c4",
    slug: "malaria-vaccine-nafdac-approval",
    text: "Claim that NAFDAC has approved a new locally-manufactured malaria vaccine for nationwide rollout.",
    category: "Health",
    verdict: "verified",
    confidence: 0.9,
    firstReportedAt: hoursAgo(30),
    sourceCount: 11,
    reportSeries: flatSeries(12, { level: 3 }),
    explanation:
      "NAFDAC's own bulletin and two independent newsroom reports corroborate a phased rollout beginning in select states, consistent with the claim. Confidence isn't higher only because full nationwide availability timelines still vary by report.",
    sources: [
      { name: "The Guardian Nigeria", url: "https://guardian.ng", stance: "corroborates" },
      { name: "Premium Times", url: "https://www.premiumtimesng.com", stance: "corroborates" },
    ],
  },
  {
    id: "c5",
    slug: "afrobeats-award-boycott",
    text: "Rumour that a top Afrobeats act is boycotting this year's awards show over a scoring dispute.",
    category: "Entertainment",
    verdict: "unconfirmed",
    confidence: 0.35,
    firstReportedAt: hoursAgo(2),
    sourceCount: 6,
    reportSeries: rampSeries(8, { start: 1, end: 16 }),
    explanation:
      "Entertainment blogs are amplifying a screenshot with no verifiable source account attached. Neither the artist's team nor the awards organisers have issued a statement yet, so this stays unconfirmed until a primary source surfaces.",
    sources: [],
  },
  {
    id: "c6",
    slug: "national-id-deadline-extension",
    text: "Claim that the deadline to link National ID numbers to SIM cards has been extended by six months.",
    category: "Politics",
    verdict: "verified",
    confidence: 0.86,
    firstReportedAt: hoursAgo(50),
    sourceCount: 18,
    reportSeries: flatSeries(12, { level: 5, jitter: 2 }),
    explanation:
      "NIMC's press statement and coverage across four tracked newsrooms confirm an extension, though the exact new date varies slightly between the earliest and most recent reports we've matched.",
    sources: [
      { name: "TheCable", url: "https://www.thecable.ng", stance: "corroborates" },
      { name: "Daily Trust", url: "https://dailytrust.com", stance: "corroborates" },
    ],
  },
  {
    id: "c7",
    slug: "kidnapping-spike-highway-video",
    text: "Circulating video alleges a sharp spike in highway kidnappings on a major interstate expressway this week.",
    category: "Security",
    verdict: "disputed",
    confidence: 0.72,
    firstReportedAt: hoursAgo(13),
    sourceCount: 9,
    reportSeries: rampSeries(12, { start: 2, end: 26 }),
    explanation:
      "The video's timestamp metadata and visible signage trace it to a different incident from over a year ago in another state. Current security agency briefings for this week don't report the described spike on this route.",
    sources: [{ name: "PM News", url: "https://pmnewsnigeria.com", stance: "contradicts" }],
  },
  {
    id: "c8",
    slug: "school-resumption-date-change",
    text: "Post claims all public schools nationwide have shifted resumption to a new date after the break.",
    category: "Politics",
    verdict: "unconfirmed",
    confidence: 0.38,
    firstReportedAt: hoursAgo(6),
    sourceCount: 4,
    reportSeries: rampSeries(10, { start: 1, end: 14 }),
    explanation:
      "Resumption dates are set at state level in Nigeria, not nationally, so a single blanket date is inherently suspect. We haven't matched this to any state ministry of education circular yet.",
    sources: [],
  },
];

export const INSIGHTS = [
  {
    id: "i1",
    slug: "why-whatsapp-forwards-spread-faster",
    title: "Why WhatsApp forwards outrun corrections in Nigeria",
    excerpt:
      "A look at the mechanics of forwarded-message spread — and why a correction posted hours later rarely catches up.",
    category: "Methodology",
    heroImageQuery: "Nigeria smartphone crowd",
    publishedAt: hoursAgo(96),
    body: [
      "Forwarded messages don't behave like public posts. There's no visible reply count, no correction thread, and no algorithm demoting a debunked claim once it's shown to be false — it just keeps moving through group chats at the same speed it always did.",
      "That asymmetry is the core problem this platform is built around: detection has to be faster than the forward button, not just eventually accurate.",
    ],
  },
  {
    id: "i2",
    slug: "reading-a-verdict-confidence-score",
    title: "How to read a verdict, and what 'unconfirmed' actually means",
    excerpt:
      "Unconfirmed isn't a shrug. Here's what's happening behind that verdict, and why we'd rather say it than guess.",
    category: "Methodology",
    heroImageQuery: "Nigeria newsroom",
    publishedAt: hoursAgo(180),
    body: [
      "A confidence score reflects how strongly the available evidence agrees, not how important the claim is. A high-traffic rumour with thin evidence still gets an honest, lower-confidence read.",
      "Unconfirmed specifically means our archive doesn't yet have a strong enough match either way, and the claim has been queued for a closer look — it is not a verdict of 'probably false.'",
    ],
  },
  {
    id: "i3",
    slug: "election-season-claim-patterns",
    title: "The claim patterns that repeat every election season",
    excerpt: "Recurring formats we see resurface every cycle, from fake result sheets to voided-PVC rumours.",
    category: "Trend recap",
    heroImageQuery: "Nigeria street election",
    publishedAt: hoursAgo(400),
    body: [
      "Several claim formats resurface almost unchanged from one election cycle to the next, just with new names and dates swapped in — which is part of why pattern-matching against a historical archive catches them faster than reading each one fresh.",
    ],
  },
];

export function getReportRate(claim) {
  const series = claim.reportSeries || [];
  if (series.length < 2) return 0;
  const recent = series.slice(-3).reduce((sum, p) => sum + p.count, 0);
  const prior = series.slice(-6, -3).reduce((sum, p) => sum + p.count, 0) || 1;
  return recent / prior;
}

export function sortByFastestRising(claims) {
  return [...claims].sort((a, b) => getReportRate(b) - getReportRate(a));
}

export function sortByMostReported(claims) {
  return [...claims].sort((a, b) => b.sourceCount - a.sourceCount);
}
