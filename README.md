# Truewire

Real-time misinformation detection for Nigeria. Paste a claim, get a verdict — backed by a live archive that's fed continuously from real fact-checking organizations, not fixtures.

## What it does

- **Verify** — paste text, a link, or speak a claim out loud, and get matched against a fact-check archive with a verdict, explanation, and sources. Claims outside the archive don't get left hanging: trivial general-knowledge questions ("is the earth round?") get answered directly, while anything claim-shaped (people, events, statistics) stays honestly hedged as unconfirmed — never a fabricated verdict.
- **Trending** — a live feed of claims spreading right now, with report-activity sparklines, updated in real time as new claims come in.
- **Report** — flag a claim you've seen; it's matched against the archive or queued as a new one.
- **Full account area** — dashboard, saved claims, my reports, notifications (pushed live when a claim matches your interests), settings.
- **Voice in, voice out** — speak your claim (free browser speech-to-text), and have the answer read back in a Nigerian-accented voice.

## The archive is alive

Every 15 minutes, the backend polls FactCheckHub and Dubawa's public feeds, runs new articles through an LLM to extract the claim + verdict + category, and writes genuinely new entries straight into the live archive — deduplicated so nothing's reprocessed twice. No manual curation, no static seed data pretending to be current.

## Stack

**Frontend** — React 19 + Vite, React Router, Tailwind v4 (CSS-native `@theme` tokens, no config file), Framer Motion, a custom type system (Fraunces + IBM Plex Sans + IBM Plex Mono).

**Backend** — Node + Express 5, deployed independently of the frontend.

**Data & auth** — Supabase: Postgres, email/password auth, row-level security, and realtime subscriptions so new claims and notifications appear without a refresh. Strict key boundary throughout — the browser only ever holds an anon key (read + realtime), the server holds the service-role key (all writes).

**AI** — Groq (`openai/gpt-oss-20b`) as primary, Google Gemini (`gemini-flash-latest`) as automatic fallback, used for both live claim extraction from RSS and explaining unmatched claims. If one provider's free tier runs dry, the other quietly picks up — no feature outage, no user-visible failure.

**Ingestion** — `rss-parser` polling real fact-check RSS feeds on an interval, feeding the LLM pipeline above.

**Voice** — Web Speech API for free, client-side speech-to-text; YarnGPT for narrated answers.

**Images** — Openverse, keyless and free.

## Deployment

Split across two platforms, matching the frontend/backend split above:

- **Vercel** — static frontend build, with `vercel.json` handling SPA rewrites so deep routes survive a refresh.
- **Render** — the Express API, polling feeds and serving `/api/*` on its own schedule and its own scaling.

They talk to each other over `VITE_API_BASE_URL` / `CORS_ORIGIN` — the only seam between the two deployments.

## Running locally

```bash
npm install
npm run dev:all   # Vite on :5173 + Express on :8787, concurrently
```

Needs `.env` (frontend: Supabase URL/anon key, API base URL) and `server/.env` (Supabase service-role key, Groq/Gemini keys, YarnGPT key) — see the respective `.env.example` files. Every integration degrades gracefully when its keys are missing: no Supabase means seed data, no LLM keys means a static fallback message, no YarnGPT means the Listen button just doesn't render. Nothing crashes for lack of a key.
