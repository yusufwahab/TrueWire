import { Reveal } from "../components/ui/Reveal";
import { Sparkline } from "../components/ui/Sparkline";

const STAGES = [
  {
    n: "01",
    title: "Detect",
    body: [
      "We continuously ingest articles and published fact-checks from the trusted Nigerian newsrooms and fact-check partners listed on our Sources & partners page, on an ongoing basis rather than a periodic crawl.",
      "Alongside that, we track how often a given claim is being reported to us or resurfacing across the sources we monitor, which is what lets the trending feed show report-rate rather than just a static list.",
    ],
    series: [2, 3, 4, 6, 8, 11, 15, 19, 24, 29],
  },
  {
    n: "02",
    title: "Verify",
    body: [
      "Every incoming claim is compared against our fact-check archive using semantic and entity matching — not exact-text matching, since the same claim usually resurfaces reworded, retranslated, or with a new date swapped in.",
      "When a strong match exists, the claim inherits that verdict and its supporting evidence. When the match is weak or absent, the claim is marked unconfirmed rather than guessed at, and queued for closer review.",
    ],
    series: [5, 5, 7, 6, 9, 12, 11, 14, 17, 16],
  },
  {
    n: "03",
    title: "Alert",
    body: [
      "Claims that clear a reporting threshold surface on the live ticker and trending feed automatically, over a realtime connection rather than a page refresh — so the site reflects what's spreading right now, not what was spreading when the page loaded.",
      "Edge cases — ambiguous wording, conflicting sources, or genuinely new claims with no archive match — are routed for human review before a confident verdict is shown.",
    ],
    series: [1, 2, 5, 9, 15, 21, 25, 28, 30, 33],
  },
];

export function HowItWorks() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">How it works</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate">
            The mechanism behind the trending feed and the verify tool, in plain language — written for the
            journalists and skeptics who'll want to know exactly how a verdict gets made.
          </p>
        </Reveal>
      </section>

      <div className="mx-auto max-w-3xl divide-y divide-slate/15 px-4 sm:px-6 lg:px-8">
        {STAGES.map((stage) => (
          <section key={stage.n} className="py-14">
            <Reveal>
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-sm text-slate">{stage.n}</span>
                <h2 className="font-display text-2xl font-semibold text-ink">{stage.title}</h2>
              </div>
              {stage.body.map((p) => (
                <p key={p.slice(0, 24)} className="mb-4 text-base leading-relaxed text-ink/85">
                  {p}
                </p>
              ))}
              <Sparkline series={stage.series.map((count, i) => ({ t: i, count }))} width={140} height={32} className="mt-2" />
            </Reveal>
          </section>
        ))}
      </div>

      <section className="border-t border-slate/15 bg-paper-raised py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink">What we don't do</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-ink/85">
              <p>
                We don't claim omniscience. If a claim hasn't been reported enough or doesn't match anything in the
                archive, it's shown as <strong className="font-medium">unconfirmed</strong> — not quietly marked
                false, and not stamped true to seem more useful than we actually are.
              </p>
              <p>
                We don't publish a verdict without evidence attached. Every verified or disputed claim links out to
                the actual sources behind that call, so you can check our work rather than take our word for it.
              </p>
              <p>
                We don't fully automate edge cases. Claims with conflicting sources or ambiguous wording go to
                human review before a confident verdict is shown, and a confidence score reflects how strongly the
                evidence agrees — not how important the claim is.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
