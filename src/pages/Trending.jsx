import { useMemo, useState } from "react";
import clsx from "clsx";
import { ClaimCard } from "../components/claims/ClaimCard";
import { PulseSkeleton } from "../components/ui/PulseSkeleton";
import { useTrendingClaims } from "../hooks/useTrendingClaims";
import { sortByFastestRising, sortByMostReported } from "../data/seed";
import { CATEGORIES } from "../lib/constants";

const CHIPS = ["All", ...CATEGORIES];
const SORTS = [
  { key: "fastest", label: "Fastest rising" },
  { key: "most", label: "Most reported" },
];

export function Trending() {
  const { claims, loading, newlyArrivedIds } = useTrendingClaims();
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("fastest");

  const list = useMemo(() => {
    const filtered = category === "All" ? claims : claims.filter((c) => c.category === category);
    return sort === "fastest" ? sortByFastestRising(filtered) : sortByMostReported(filtered);
  }, [claims, category, sort]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Trending</h1>
        <p className="mt-2 text-sm text-slate">The full live feed of claims we're tracking right now.</p>
      </div>

      <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-slate/15 bg-paper/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setCategory(chip)}
                className={clsx(
                  "min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  category === chip
                    ? "border-signal-teal bg-signal-teal text-white"
                    : "border-slate/30 text-slate hover:border-signal-teal hover:text-signal-teal",
                )}
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {SORTS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSort(opt.key)}
                className={clsx(
                  "min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  sort === opt.key
                    ? "border-signal-teal bg-signal-teal text-white"
                    : "border-slate/30 text-slate hover:border-signal-teal hover:text-signal-teal",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading && !claims.length
          ? Array.from({ length: 5 }).map((_, i) => <PulseSkeleton key={i} className="h-20 w-full" rounded="rounded-xl" />)
          : list.map((claim) => <ClaimCard key={claim.id} claim={claim} dense flash={newlyArrivedIds.has(claim.id)} />)}
        {!loading && !list.length && (
          <p className="rounded-xl border border-slate/15 bg-paper-raised px-4 py-8 text-center text-sm text-slate">
            No claims match this filter right now.
          </p>
        )}
      </div>
    </div>
  );
}
