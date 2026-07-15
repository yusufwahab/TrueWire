// Every URL below was fetched directly (not guessed) and confirmed to return valid, currently-
// updating RSS/Atom — see the dated notes for anything left out.
//
// Not wired in:
// - Africa Check's Nigeria-specific feed 404s; their general feed (africacheck.org/feed/) works
//   and is used instead, so items span all of Africa, not just Nigeria.
// - Channels TV and Independent Newspapers Nigeria both sit behind a Cloudflare JS challenge
//   ("Just a moment...") that a plain HTTP fetch (this is all rss-parser does) can never pass —
//   confirmed via direct curl with a browser user-agent, not just this fetch tool. Wiring them in
//   would just fail silently every cycle, so they're skipped rather than added broken.
// - CDD Fact-check (cddwestafrica.org) has no RSS feed anywhere on the site — no <link
//   rel="alternate"> tag, /feed/ 404s.
// - FactsMatterNG (factsmatterng.com) has no discoverable feed at any common path — looks like a
//   client-rendered SPA with nothing server-rendered to poll.
//
// Arise News, Daily Post, and TVC News are plain news wire, not fact-checkers — extraction still
// runs the same claim+verdict pipeline on them (accepted tradeoff: the LLM assigns a verdict from
// a single ordinary news article rather than an actual fact-check).
export const FEED_SOURCES = [
  { name: "FactCheckHub", url: "https://factcheckhub.com/feed/", type: "factcheck" },
  { name: "Dubawa", url: "https://dubawa.org/feed/", type: "factcheck" },
  { name: "Africa Check", url: "https://africacheck.org/feed/", type: "factcheck" },
  { name: "ICIR", url: "https://icirnigeria.org/feed/", type: "factcheck" },
  { name: "CJID", url: "https://thecjid.org/feed/", type: "factcheck" },
  { name: "RoundCheck", url: "https://roundcheck.com.ng/feed/", type: "factcheck" },
  { name: "Arise News", url: "https://www.arise.tv/feed/", type: "news" },
  { name: "Daily Post", url: "https://dailypost.ng/feed/", type: "news" },
  { name: "TVC News", url: "https://www.tvcnews.tv/feed/", type: "news" },
];
