import { ExternalLink } from "lucide-react";
import { VerdictPill } from "../ui/VerdictPill";
import { Sparkline } from "../ui/Sparkline";
import { NarrateButton } from "../ui/NarrateButton";
import { VERDICTS, DEFAULT_VOICE } from "../../lib/constants";
import { timeAgo } from "../../lib/format";

export function ClaimDetailPanel({ claim, voice = DEFAULT_VOICE }) {
  const verdict = VERDICTS[claim.verdict] || VERDICTS.unconfirmed;

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <VerdictPill verdict={claim.verdict} confidence={claim.confidence} size="lg" />
          <span className="font-mono text-xs text-slate">
            {claim.sourceCount} sources · first reported {timeAgo(claim.firstReportedAt)}
          </span>
        </div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">{claim.text}</h1>
      </div>

      <div className="rounded-xl border border-slate/15 bg-paper-raised p-5">
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate">Why we think this</p>
          <NarrateButton text={claim.explanation} voice={voice} />
        </div>
        <p className="text-base leading-relaxed text-ink/90">{claim.explanation}</p>
        <p className="mt-3 text-xs text-slate">{verdict.description}.</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">Report activity, last few hours</p>
        <div className="rounded-xl border border-slate/15 bg-paper-raised p-5">
          <Sparkline series={claim.reportSeries} width={520} height={90} className="w-full" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">
          {claim.sources?.length ? "Corroborating & contradicting sources" : "Sources"}
        </p>
        {claim.sources?.length ? (
          <ul className="space-y-2">
            {claim.sources.map((source) => (
              <li key={source.name}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate/15 bg-paper-raised px-4 py-3 text-sm transition-colors hover:border-signal-teal/40"
                >
                  <span>
                    <span className="font-medium text-ink">{source.name}</span>
                    <span
                      className={`ml-2 font-mono text-xs ${source.stance === "contradicts" ? "text-alert-coral" : "text-signal-teal"}`}
                    >
                      {source.stance}
                    </span>
                  </span>
                  <ExternalLink size={15} className="shrink-0 text-slate" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-slate/15 bg-paper-raised px-4 py-3 text-sm text-slate">
            No corroborating or contradicting source has been matched yet — this claim stays unconfirmed until one is.
          </p>
        )}
      </div>
    </div>
  );
}
