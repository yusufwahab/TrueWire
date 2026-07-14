import { Link } from "react-router-dom";
import clsx from "clsx";
import { Card } from "../ui/Card";
import { VerdictPill } from "../ui/VerdictPill";
import { Sparkline } from "../ui/Sparkline";
import { timeAgo } from "../../lib/format";

export function ClaimCard({ claim, dense = false, flash = false }) {
  return (
    <Card
      as={Link}
      to={`/trending/${claim.slug}`}
      className={clsx(
        "block",
        dense ? "flex items-center justify-between gap-4 py-4" : "flex flex-col gap-4",
        flash && "animate-ticker-flash",
      )}
    >
      <div className={clsx("flex-1", dense && "min-w-0")}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <VerdictPill verdict={claim.verdict} confidence={claim.confidence} />
          <span className="font-mono text-xs text-slate">{claim.sourceCount} sources</span>
        </div>
        <p className={clsx("text-ink", dense ? "truncate text-sm font-medium" : "text-base font-medium leading-snug")}>
          {claim.text}
        </p>
        {!dense && <p className="mt-2 font-mono text-xs text-slate">reported {timeAgo(claim.firstReportedAt)}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Sparkline series={claim.reportSeries} />
        {dense && <span className="whitespace-nowrap font-mono text-xs text-slate">{timeAgo(claim.firstReportedAt)}</span>}
      </div>
    </Card>
  );
}
