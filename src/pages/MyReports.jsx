import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { VerdictPill } from "../components/ui/VerdictPill";
import { PulseSkeleton } from "../components/ui/PulseSkeleton";
import { useAuthSession } from "../hooks/useAuthSession";
import { supabase } from "../lib/supabaseClient";
import { timeAgo } from "../lib/format";

// There's no moderation backend yet, so rather than trust a status column nothing ever
// transitions, the pill is derived live from the report's matched claim each time this loads:
// no match → Pending, matched but still unconfirmed → Under review, matched and resolved →
// that verdict. Self-updates as claims get resolved instead of going stale.
function StatusPill({ label }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-slate/30 bg-slate/8 px-2.5 py-1 text-xs font-medium text-slate">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate" aria-hidden="true" />
      {label}
    </span>
  );
}

export function MyReports() {
  const { session } = useAuthSession();
  const [reports, setReports] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return undefined;
    let cancelled = false;
    supabase
      .from("user_reports")
      .select("id, content, category, created_at, claims:matched_claim_id(text, verdict, slug)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!cancelled) setReports(data || []);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">My reports</h1>
        <p className="mt-2 text-sm text-slate">Claims you've reported, and where each one stands.</p>
      </div>

      {reports === null ? (
        <div className="space-y-3">
          <PulseSkeleton className="h-20 w-full" rounded="rounded-xl" />
          <PulseSkeleton className="h-20 w-full" rounded="rounded-xl" />
        </div>
      ) : reports.length === 0 ? (
        <p className="rounded-xl border border-slate/15 bg-paper-raised px-4 py-8 text-center text-sm text-slate">
          You haven't reported anything yet.{" "}
          <Link to="/report" className="text-signal-teal hover:underline">
            Report a claim
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => {
            const claim = r.claims;
            return (
              <li key={r.id} className="rounded-xl border border-slate/15 bg-paper-raised p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="text-sm text-ink/90">{claim?.text || r.content}</p>
                  {claim?.verdict === "verified" || claim?.verdict === "disputed" ? (
                    <VerdictPill verdict={claim.verdict} />
                  ) : claim?.verdict === "unconfirmed" ? (
                    <StatusPill label="Under review" />
                  ) : (
                    <StatusPill label="Pending" />
                  )}
                </div>
                <p className="font-mono text-xs text-slate">
                  reported {timeAgo(r.created_at)}
                  {r.category ? ` · ${r.category}` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
