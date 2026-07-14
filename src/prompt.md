# Build spec: Nigerian news verification platform website

Hand this whole document to the AI coding assistant as the build brief. It covers design direction, architecture, and a page-by-page spec — follow it in order: design system first, then global layout, then pages.

---

## 1. What this product is

A real-time misinformation detection platform for Nigeria. It continuously ingests trusted Nigerian news sources, cross-references claims against a verified fact-check archive, tracks how fast rumours are spreading, and surfaces that — proactively (a live trending feed) and on demand (search/verify any claim). This is not a chatbot wrapper. The website's whole job is to make that engine feel authoritative, fast, and trustworthy at a glance.

**Tone**: serious, credible, editorial — closer to a wire service or a fintech trust product than a consumer social app. Confident, not flashy. Nigerian without being decorative about it — no stock "Africa" clichés (no generic map-of-Africa graphics, no flag-color gradients).

---

## 2. Tech stack

- **Frontend**: React + Vite, Tailwind CSS, Framer Motion for animation, React Router for routing.
- **Backend**: Node.js + Express (API layer sitting in front of the ingestion/matching engine).
- **Data/auth**: Supabase (Postgres + auth + realtime subscriptions — use Supabase realtime for the live trending feed so it updates without polling).
- **Images**: Unsplash API (register a free Unsplash Developer app, fetch via `https://api.unsplash.com/search/photos` with the access key in an env variable, never hardcoded). Cache/download chosen images at build time where possible rather than hot-linking on every page load, for performance and to avoid layout shift.
- Install whatever supporting packages are needed (e.g. `framer-motion`, `lucide-react` for the sparse icon needs, `react-router-dom`, `@supabase/supabase-js`, `clsx`). Keep dependencies lean — don't add a UI kit that fights Tailwind.

Note that Tailwind has been installed and configured, so you do not need to install it again

---

## 3. Design system

### Design plan and reasoning

Avoid the current AI-generated-site defaults: no warm cream background with terracotta accent, no near-black-with-neon-accent look, no broadsheet hairline-grid pastiche. This product's identity is **signal vs. noise** — a live, moving read on what's true — so the design should feel like a precision instrument, not a blog.

### Color palette

Use these exact values, referenced as CSS variables / Tailwind theme extensions — do not substitute generic Tailwind grays or blues.

| Token            | Hex       | Use                                                                      |
| ---------------- | --------- | ------------------------------------------------------------------------ |
| `--ink`          | `#101B17` | Primary text, dark backgrounds                                           |
| `--paper`        | `#F2F4F1` | Light background (cool, not cream)                                       |
| `--paper-raised` | `#FFFFFF` | Cards on light background                                                |
| `--signal-teal`  | `#177A6D` | Primary accent — verified, trust, primary CTAs                           |
| `--alert-coral`  | `#C24A32` | False/caution states only — never decorative                             |
| `--pulse-amber`  | `#D99A2B` | "Live" / trending indicator only — used sparingly, never as a base color |
| `--slate`        | `#4A5A57` | Secondary text, borders, muted UI                                        |

Rules: `signal-teal` is the only accent used for buttons/links/active states. `alert-coral` appears **only** attached to a false/disputed verdict — never used decoratively. `pulse-amber` appears **only** on live/trending indicators (a small dot, a ticker underline) — never as a large fill. No gradients anywhere except one: a very subtle 2-stop gradient (teal to transparent) permitted only behind the hero's live signal visualization, nowhere else.

### Typography

- **Display/headline face**: Fraunces (serif, editorial weight, has real gravity — used for H1/H2 only, set fairly large, tight tracking).
- **Body/UI face**: IBM Plex Sans (technical, precise — used for body copy, nav, buttons, forms).
- **Data/mono face**: IBM Plex Mono — used specifically for timestamps, percentages, trend rates, source counts, verdict confidence scores. This is a deliberate choice: numbers that matter get set in mono so they read as _data_, distinct from prose.

Load all three via Google Fonts. Type scale: H1 56/60px desktop (34/38 mobile), H2 36px, H3 22px, body 16px/1.6, caption 13px. Weight range: regular + medium + one bold for Fraunces headlines only — don't go past 3 weights per face.

### Layout signature

The site's one recurring signature element: a **thin horizontal pulse/sparkline** — a live-looking waveform line that spikes when something is trending. It appears in three places only, consistently: (1) behind the hero headline as an animated ambient visual, (2) inline on every trending-claim card as a small sparkline showing that claim's report-rate over the last few hours, (3) as the loading/skeleton state animation site-wide (a pulse sweeping left to right instead of a generic spinner). Don't invent a second signature motif — this is the one thing the site should be remembered by. Everything else stays quiet.

### Motion principles

- Page load: a single orchestrated entrance (headline + pulse line animate in together, ~600ms, ease-out) — not scattered fade-ins on every element.
- Scroll: sections reveal once, subtly (12px upward translate + fade, 400ms), triggered at 20% viewport visibility. No parallax gimmicks.
- Hover: buttons and cards get a restrained lift (2px translateY + border color shift to `signal-teal`), never a scale-bounce.
- Respect `prefers-reduced-motion` — disable translate/scroff-triggered animation and keep only opacity fades when set.
- No animation for animation's sake. If a motion doesn't communicate state (loading, success, live, changed), cut it.

### Imagery direction

Real Nigerian editorial-documentary photography, not stock-generic. Unsplash search terms to use per context are specified in each page section below. Preference order: photojournalism-style images of Nigerian cities, newsrooms, phones/screens, people reading/sharing on phones — over generic "African" imagery, illustration, or icon-heavy graphics. Images should be desaturated slightly via a consistent CSS filter (`saturate(0.92) contrast(1.05)`) so they sit together as one consistent set regardless of source.

### Component rules

- Cards: `paper-raised` background, 1px `slate/15%` border, 12px radius, no shadow at rest — a soft shadow only appears on hover.
- Buttons: primary = filled `signal-teal`, white text, 8px radius, no rounded-pill shapes. Secondary = outline only.
- Icons: use sparingly — only where an icon replaces a genuinely faster visual scan (verdict status, nav). No decorative icon rows, no icon-in-a-circle badges scattered around sections. When used, outline-style, single weight, `slate` or accent color, never multi-colored icon sets.
- No confetti/emoji/illustration mascots anywhere.

---

## 4. Global layout (present on every page)

**Header**: logo/wordmark left, nav center or right (Home, Trending, Verify, How it works, About, Sign in), a primary "Report a claim" button always visible. On scroll past 80px, header compresses slightly (reduce padding, add a 1px bottom border) — don't hide it.

**Live ticker strip** (sits directly under the header, present on every page, thin ~40px bar): a horizontally auto-scrolling strip of the 5–8 fastest-trending claims right now, each as `[pulse-amber dot] claim headline · verdict badge`. Clicking one navigates to that claim's detail view. Pull this from Supabase realtime so it updates live without a refresh. This is a functional, not decorative, element — it's the proactive-alert concept made visible everywhere on the site.

**Footer**: four columns — Product (Trending, Verify, How it works), Company (About, Contact), Trust (Sources & Partners, Methodology), Legal (Privacy, Terms) — plus a short one-line mission statement and social links, set small and quiet. Dark `ink` background, `paper` text.

---

## 5. Pages

### 5.1 Home

**Purpose**: establish credibility and explain the core proposition in one scroll — proactive detection + on-demand verification, backed by real sources.

- **Hero**: split layout. Left: eyebrow label ("Real-time misinformation detection"), Fraunces H1 making the core promise in one sentence (e.g. framing that false claims get caught before they spread), one-sentence subhead in Plex Sans, two CTAs — primary "Verify a claim" (signal-teal filled), secondary "See what's trending" (outline). Right: the animated pulse/signal visualization (the signature element) — an abstract line chart-like animation suggesting live claim activity, built in SVG/Framer Motion, not a stock image.
- **Trust bar**: directly below hero, a quiet single row of the news/fact-check partner logos this platform draws from (Punch, Vanguard, Premium Times, Dubawa, etc. — as text wordmarks, grayscale, not colorful logo soup) with a small label "Cross-referenced against Nigeria's leading newsrooms and fact-checkers."
- **How it works** (3-step, numbered legitimately since it's a real sequence): Detect → Verify → Alert. Each step gets a short Plex Sans paragraph and a small inline sparkline/icon consistent with the signature motif, not a new icon style. Scroll-reveal each step in sequence.
- **Live trending preview**: 3–4 real trending-claim cards (title, source-count badge, trend sparkline, verdict pill: Verified / Disputed / Unconfirmed) pulled live from Supabase, with a "See all trending claims →" link to the full Trending page. Cards lift on hover.
- **Verify-it-yourself teaser**: a simple inline search input embedded directly on the homepage ("Paste a claim, a link, or forward what you saw…") that on submit routes to the Verify page with the query pre-filled — this is the on-demand path made immediately usable, not tucked away.
- **Featured image section**: one full-width editorial photo (Unsplash search: "Lagos street phone", "Nigeria newsroom", or "Nigeria smartphone crowd") with a short overlaid statement about the scale of the misinformation problem, image desaturated per the imagery direction above. Keep copy short — one sentence, real, not fear-mongering.
- **Report a claim CTA band**: closing section, `ink` background, inviting users to forward suspicious content, with the "Report a claim" button repeated.

### 5.2 Trending

**Purpose**: the full live feed — this is the proactive core of the product, made explorable.

- Sticky filter row: category chips (Politics, Health, Finance, Security, Entertainment, All) + a sort toggle (Fastest rising vs. Most reported) — chips styled as outline pills in `slate`, active state fills `signal-teal`.
- Main feed: a single-column list (not a grid) of claim cards, denser than the homepage preview — each row shows claim text, verdict pill, source-count, sparkline, and "reported Xh ago." List updates live via Supabase realtime subscription; new items entering the top of the list animate in with a brief highlight flash (background pulses `pulse-amber` at 8% opacity then fades) rather than a jarring pop.
- Clicking a card opens a claim detail view (can be a route or a slide-over panel): full claim text, verdict with confidence/evidence summary, the specific articles/fact-checks that corroborate or contradict it (linked out, not reproduced in full), and a small propagation summary (report count over time, shown as an expanded version of the sparkline).
- Empty/loading state uses the pulse-sweep skeleton, not a spinner.

### 5.3 Verify

**Purpose**: on-demand check — the "whenever they want" path.

- Centered, focused layout (not the busy multi-section homepage style) — this page should feel like a precision tool.
- Large input area supporting three modes via tabs: Paste text, Paste a link, Upload an image (for the media-forensics angle later — can be stubbed as "coming soon" if not built yet, don't fake functionality).
- On submit: a short, honest loading sequence (pulse-sweep animation with rotating status text: "Checking fact-check archive…", "Cross-referencing trusted sources…" — real steps, not decorative filler) before showing the result.
- Result view: large verdict badge at top (color-coded per the palette rule: teal = verified true, coral = false, slate = unconfirmed), a plain-language explanation paragraph, then a list of the actual corroborating/contradicting sources with links out. Always show "why we think this" — never a bare verdict with no evidence, since that's exactly the trust gap this product exists to close.
- Below the tool: a short "Recently verified" list (real anonymized examples) so first-time visitors understand what output to expect before they try it.

### 5.4 How it works

**Purpose**: build technical credibility without being a dry documentation page — this is where you earn trust from skeptical users and press.

- Long-form scroll page. Reuse the Detect → Verify → Alert structure from the homepage but expanded: each stage gets its own full section with a short explanation of the actual mechanism (news ingestion from trusted outlets, semantic + entity matching against a verified archive, corroboration logic, human review for edge cases) written in plain language, not marketing fluff — this audience includes journalists and skeptics.
- Include a small "what we don't do" honesty section — the product doesn't claim omniscience, explicitly says what happens when a claim can't yet be confirmed (Unconfirmed state, human review) rather than overclaiming certainty. This builds more trust than any polish would.

### 5.5 Sources & partners

**Purpose**: transparency page — list the actual news outlets and fact-checkers the platform draws from.

- Simple grouped list: "News sources" (Punch, Vanguard, Premium Times, TheCable, Daily Trust, Channels TV, The Guardian Nigeria, PM News) and "Fact-check partners" (Dubawa, FactCheckHub, Africa Check, CDD Fact-check), each as a quiet text-wordmark grid, no logos needed if unavailable — text is fine and stays consistent. One sentence at top explaining why source transparency matters for a verification product.

### 5.6 About / mission

**Purpose**: humanize the product — who built it and why, particularly relevant given misinformation's real-world harm in Nigeria.

- Editorial layout: large Fraunces pull-quote framing the mission, one full-width photo (Unsplash: "Nigeria community phone" or similar), short founder/team note (can be a placeholder block the user fills in later), and a short section on why Nigeria specifically (WhatsApp-driven spread, election misinformation, deepfake scams — pull the real texture from earlier research rather than generic "misinformation is bad" copy).

### 5.7 Report a claim

**Purpose**: the crowd-sourced input mechanism — make this feel valuable and easy, since it's a core data source.

- Simple form: paste text / paste link / upload image or forward via a listed WhatsApp number (state clearly if that's live or "coming soon"), optional category tag, optional contact for follow-up.
- After submission: a genuine confirmation state explaining what happens next ("This joins our detection queue and helps us catch this claim faster for everyone else") — not just a generic "Thanks!" toast, since this reinforces the proactive-for-everyone value loop.

### 5.8 Insights (optional but recommended for credibility/SEO)

**Purpose**: short editorial posts — debunk write-ups, methodology notes, trend recaps. Standard blog list + article template, Fraunces headline, Plex Sans body, one hero image per post (Unsplash, contextual to the topic). Keep this simple; it's supporting content, not a core flow.

### 5.9 Contact

Minimal: a short form (name, email, message) plus direct email/social links. No unnecessary sections — this page's job is to be fast and simple.

### 5.10 Auth (sign in / create account)

**Purpose**: lets users save alert preferences (categories, location/language) and see personalized trending feeds — supabase auth (email + one OAuth provider, e.g. Google).

- Centered card layout, minimal, on `paper` background — no split-screen marketing imagery here, keep it purely functional and fast.
- On first sign-in, a short 2-step onboarding: pick categories of interest, pick language — this personalizes the trending ticker and feed for that user going forward.

### 5.11 404 / not found

Keep on-brand: pulse-line motif rendered as if the signal "cut out," short honest copy ("That page isn't in our index"), a single button back to Home. No generic "Oops!" graphics.

---

## 6. Responsiveness

- Breakpoints: mobile (<640px), tablet (640–1024px), desktop (1024px+), wide (1440px+).
- Hero split layout stacks vertically on mobile/tablet — text first, signal visualization below at reduced height, not hidden.
- Live ticker strip: on mobile, reduce to showing one claim at a time with the same auto-scroll rather than truncating multiple items awkwardly.
- Trending feed: cards go full-width single column on mobile (already single-column on desktop too — this page doesn't need a grid).
- Nav collapses to a slide-in panel from the right on mobile, not a full-screen takeover — keep the ticker visible if possible even with nav open.
- Touch targets minimum 44px on all interactive elements on mobile.
- Test type scale down properly at each breakpoint — Fraunces headlines should never wrap awkwardly; reduce size before allowing more than 2 lines in the hero.

---

## 7. What to avoid

- No unnecessary gradients, icon clutter, or decorative noise — every visual element must justify itself against the content it supports.
- No generic "Africa" iconography (map outlines, flag-color gradients, tribal-pattern textures used decoratively).
- No stock photos of generic "diverse people smiling at laptop" — use the specific Unsplash search directions given per page.
- No spinner loaders — use the pulse-sweep skeleton consistently.
- No more than one accent color doing work in any single view.
- Don't overclaim certainty in copy anywhere — this is a trust product; hedge honestly where the system is genuinely uncertain (Unconfirmed states), since that honesty is the actual differentiator from a generic AI chatbot answer.
