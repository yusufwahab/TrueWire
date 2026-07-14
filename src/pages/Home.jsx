import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { Reveal } from "../components/ui/Reveal";
import { SignalVisualization } from "../components/ui/SignalVisualization";
import { Sparkline } from "../components/ui/Sparkline";
import { PulseSkeleton } from "../components/ui/PulseSkeleton";
import { Button } from "../components/ui/Button";
import { ClaimCard } from "../components/claims/ClaimCard";
import { useTrendingClaims } from "../hooks/useTrendingClaims";
import { useEditorialImage } from "../hooks/useEditorialImage";
import { PhotoCredit } from "../components/ui/PhotoCredit";
import { sortByFastestRising } from "../data/seed";
import { NEWS_SOURCES, FACT_CHECK_PARTNERS } from "../lib/constants";

const STEPS = [
  {
    n: "01",
    title: "Detect",
    body: "We continuously ingest trusted Nigerian newsrooms and monitor how claims spread across public channels, watching for the same story resurfacing in a new form.",
    series: [2, 3, 4, 5, 7, 10, 14, 19, 25, 30],
  },
  {
    n: "02",
    title: "Verify",
    body: "Every claim is cross-referenced against a growing archive of fact-checked material, using semantic and entity matching before anything gets a verdict.",
    series: [4, 5, 5, 8, 9, 8, 12, 13, 15, 18],
  },
  {
    n: "03",
    title: "Alert",
    body: "Once a claim clears the reporting threshold, it surfaces on the live ticker and trending feed — proactively, before you have to go looking for it.",
    series: [1, 2, 4, 8, 14, 20, 24, 27, 29, 31],
  },
];

export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { claims } = useTrendingClaims();
  const preview = sortByFastestRising(claims).slice(0, 4);
  const featuredImage = useEditorialImage("Lagos street phone");

  function handleSubmit(e) {
    e.preventDefault();
    navigate(`/verify${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-signal-teal">
              Real-time misinformation detection
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-[56px] lg:leading-[60px]">
              False claims get caught before they finish spreading.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate">
              Truewire tracks claims across Nigeria's trusted newsrooms in real time, and lets you check any claim
              yourself in seconds — backed by real sources, not a guess.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/verify">Verify a claim</Button>
              <Button to="/trending" variant="secondary">
                See what's trending
              </Button>
            </div>
          </div>
          <div className="order-first lg:order-last">
            <SignalVisualization className="h-48 sm:h-64 lg:h-auto" />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-slate/15 bg-paper-raised py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-5 text-center text-xs text-slate">
            Cross-referenced against Nigeria's leading newsrooms and fact-checkers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 grayscale">
            {[...NEWS_SOURCES, ...FACT_CHECK_PARTNERS].map((name) => (
              <span key={name} className="font-display text-sm font-medium text-slate/70">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold text-ink">How it works</h2>
        </Reveal>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.1}>
              <div className="flex flex-col gap-3">
                <span className="font-mono text-sm text-slate">{step.n}</span>
                <h3 className="font-display text-xl font-semibold text-ink">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate">{step.body}</p>
                <Sparkline series={step.series.map((count, idx) => ({ t: idx, count }))} width={120} height={30} className="mt-1" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Live trending preview */}
      <section className="border-t border-slate/15 bg-paper-raised py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-semibold text-ink">Live right now</h2>
              <a href="/trending" className="flex items-center gap-1 text-sm font-medium text-signal-teal hover:underline">
                See all trending claims <ArrowRight size={15} />
              </a>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {preview.length
              ? preview.map((claim) => <ClaimCard key={claim.id} claim={claim} />)
              : Array.from({ length: 4 }).map((_, i) => <PulseSkeleton key={i} className="h-32 w-full" rounded="rounded-xl" />)}
          </div>
        </div>
      </section>

      {/* Verify-it-yourself teaser */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold text-ink">Seen something? Check it yourself.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate">
            Paste a claim, a link, or forward what you saw — we'll cross-reference it against the archive in seconds.
          </p>
          <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-lg border border-slate/25 bg-paper-raised p-1.5 pl-4">
            <Search size={18} className="shrink-0 text-slate" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste a claim, a link, or forward what you saw…"
              className="min-h-11 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate/70"
            />
            <Button type="submit" className="shrink-0">
              Verify
            </Button>
          </form>
        </Reveal>
      </section>

      {/* Featured image */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-xl border border-slate/15">
            {featuredImage.url ? (
              <img
                src={featuredImage.url}
                alt={featuredImage.alt}
                className="editorial-photo h-72 w-full object-cover sm:h-96"
              />
            ) : (
              <PulseSkeleton className="h-72 w-full sm:h-96" rounded="rounded-none" />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-ink/85 px-6 py-5">
              <p className="max-w-2xl text-sm text-paper sm:text-base">
                Millions of claims move through Nigerian WhatsApp groups every day — most never get a correction
                before the next forward.
              </p>
            </div>
          </div>
          <PhotoCredit credit={featuredImage.credit} className="mt-2" />
        </Reveal>
      </section>

      {/* Report a claim CTA band */}
      <section className="bg-ink py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold text-paper">Seen a claim spreading fast?</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-paper/70">
              Forward it to us. Every report helps us catch the same claim faster the next time it surfaces —
              for everyone.
            </p>
            <div className="mt-7">
              <Button to="/report">Report a claim</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
