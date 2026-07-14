import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../components/ui/Reveal";
import { ClaimCard } from "../components/claims/ClaimCard";
import { PulseSkeleton } from "../components/ui/PulseSkeleton";
import { VerdictPill } from "../components/ui/VerdictPill";
import { useAuthSession } from "../hooks/useAuthSession";
import { useProfile } from "../hooks/useProfile";
import { useSavedClaims } from "../hooks/useSavedClaims";
import { useTrendingClaims } from "../hooks/useTrendingClaims";
import { supabase } from "../lib/supabaseClient";
import { timeAgo } from "../lib/format";

// The default landing point post-login. Unlike the ticker/Home/Trending's boost-only
// personalization, this feed hard-filters to the user's saved categories — this is the one
// place that's supposed to be exactly "yours," not everything with your interests nudged up.
export function Dashboard() {
  const { session } = useAuthSession();
  const profile = useProfile(session);
  const { claims, loading } = useTrendingClaims();
  const { savedIds } = useSavedClaims(session);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return undefined;
    let cancelled = false;
    supabase
      .from("verify_submissions")
      .select("id, input_text, created_at, claims:matched_claim_id(text, verdict, slug)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (!cancelled) setHistory(data || []);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const hasPreferences = Boolean(profile?.categories?.length);
  const feed = hasPreferences ? claims.filter((c) => profile.categories.includes(c.category)) : claims;
  const saved = claims.filter((c) => savedIds.has(c.id)).slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-sm text-slate">
          {hasPreferences ? (
            "Your feed, tuned to what you follow."
          ) : (
            <>
              Pick some categories in{" "}
              <Link to="/settings" className="text-signal-teal hover:underline">
                Settings
              </Link>{" "}
              to personalize this feed — showing everything for now.
            </>
          )}
        </p>
      </div>

      {saved.length > 0 && (
        <Reveal className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">Saved claims</h2>
            <Link to="/saved" className="text-sm font-medium text-signal-teal hover:underline">
              See all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {saved.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </Reveal>
      )}

      <Reveal className="mb-12">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">Recent verifications</h2>
        {history === null ? (
          <div className="space-y-2">
            <PulseSkeleton className="h-14 w-full" rounded="rounded-lg" />
            <PulseSkeleton className="h-14 w-full" rounded="rounded-lg" />
          </div>
        ) : history.length === 0 ? (
          <p className="rounded-lg border border-slate/15 bg-paper-raised px-4 py-3 text-sm text-slate">
            Nothing verified yet — try the{" "}
            <Link to="/verify" className="text-signal-teal hover:underline">
              Verify
            </Link>{" "}
            page.
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate/15 bg-paper-raised px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink/85">{h.claims?.text || h.input_text}</p>
                  <p className="font-mono text-xs text-slate">{timeAgo(h.created_at)}</p>
                </div>
                {h.claims?.verdict && <VerdictPill verdict={h.claims.verdict} />}
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      <div>
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">Your feed</h2>
        <div className="space-y-3">
          {loading && !feed.length
            ? Array.from({ length: 4 }).map((_, i) => <PulseSkeleton key={i} className="h-20 w-full" rounded="rounded-xl" />)
            : feed.map((claim) => <ClaimCard key={claim.id} claim={claim} dense />)}
          {!loading && !feed.length && (
            <p className="rounded-xl border border-slate/15 bg-paper-raised px-4 py-8 text-center text-sm text-slate">
              No claims in your categories right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
