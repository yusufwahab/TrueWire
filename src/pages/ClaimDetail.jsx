import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { ClaimDetailPanel } from "../components/claims/ClaimDetailPanel";
import { PulseSkeleton } from "../components/ui/PulseSkeleton";
import { api } from "../lib/api";
import { CLAIMS } from "../data/seed";

export function ClaimDetail() {
  const { slug } = useParams();
  const [claim, setClaim] = useState(() => CLAIMS.find((c) => c.slug === slug) ?? null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    api
      .claim(slug)
      .then((data) => {
        if (!cancelled && data?.claim) setClaim(data.claim);
      })
      .catch(() => {
        const fallback = CLAIMS.find((c) => c.slug === slug);
        if (!cancelled) {
          if (fallback) setClaim(fallback);
          else setNotFound(true);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/trending" className="mb-6 inline-flex items-center gap-1 text-sm text-slate hover:text-signal-teal">
        <ChevronLeft size={16} /> Back to trending
      </Link>

      {loading && !claim ? (
        <div className="space-y-4">
          <PulseSkeleton className="h-8 w-2/3" />
          <PulseSkeleton className="h-24 w-full" rounded="rounded-xl" />
          <PulseSkeleton className="h-24 w-full" rounded="rounded-xl" />
        </div>
      ) : notFound || !claim ? (
        <p className="text-sm text-slate">We couldn't find that claim.</p>
      ) : (
        <ClaimDetailPanel claim={claim} />
      )}
    </div>
  );
}
