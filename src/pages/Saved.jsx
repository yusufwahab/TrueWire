import { ClaimCard } from "../components/claims/ClaimCard";
import { PulseSkeleton } from "../components/ui/PulseSkeleton";
import { useAuthSession } from "../hooks/useAuthSession";
import { useSavedClaims } from "../hooks/useSavedClaims";
import { useTrendingClaims } from "../hooks/useTrendingClaims";

export function Saved() {
  const { session } = useAuthSession();
  const { savedIds, loading: savedLoading } = useSavedClaims(session);
  const { claims, loading: claimsLoading } = useTrendingClaims();
  const saved = claims.filter((c) => savedIds.has(c.id));
  const loading = savedLoading || claimsLoading;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Saved</h1>
        <p className="mt-2 text-sm text-slate">Claims you've bookmarked from Trending or Verify.</p>
      </div>

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <PulseSkeleton key={i} className="h-20 w-full" rounded="rounded-xl" />)
          : saved.map((claim) => <ClaimCard key={claim.id} claim={claim} dense />)}
        {!loading && !saved.length && (
          <p className="rounded-xl border border-slate/15 bg-paper-raised px-4 py-8 text-center text-sm text-slate">
            Nothing saved yet — tap the bookmark icon on any claim to keep it here.
          </p>
        )}
      </div>
    </div>
  );
}
