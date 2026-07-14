import { Link } from "react-router-dom";
import { useTrendingClaims } from "../../hooks/useTrendingClaims";
import { useAuthSession } from "../../hooks/useAuthSession";
import { useProfile } from "../../hooks/useProfile";
import { sortByFastestRising } from "../../data/seed";
import { VERDICTS } from "../../lib/constants";

// The proactive-alert concept made visible everywhere: a thin auto-scrolling strip of the
// fastest-trending claims, present on every page directly under the header.
export function TickerStrip() {
  const { session } = useAuthSession();
  const profile = useProfile(session);
  const { claims } = useTrendingClaims(profile?.categories);
  const top = sortByFastestRising(claims).slice(0, 8);
  if (!top.length) return null;
  const track = [...top, ...top];

  return (
    <div className="h-10 overflow-hidden border-b border-slate/15 bg-paper-raised">
      <div className="animate-marquee flex h-full w-max items-center gap-10 whitespace-nowrap">
        {track.map((claim, i) => {
          const verdict = VERDICTS[claim.verdict] || VERDICTS.unconfirmed;
          return (
            <Link
              key={`${claim.id}-${i}`}
              to={`/trending/${claim.slug}`}
              className="flex items-center gap-2 text-sm text-ink/85 transition-colors hover:text-signal-teal"
            >
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-pulse-amber" aria-hidden="true" />
              <span className="max-w-[280px] truncate sm:max-w-[420px]">{claim.text}</span>
              <span className="shrink-0 font-mono text-xs" style={{ color: verdict.color }}>
                · {verdict.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
