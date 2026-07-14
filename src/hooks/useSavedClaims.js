import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Save/unsave claims for the signed-in user, direct against Supabase (owner-scoped RLS on
// saved_claims — same pattern as useProfile) rather than through the Express API.
export function useSavedClaims(session) {
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setSavedIds(new Set());
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("saved_claims")
      .select("claim_id")
      .eq("user_id", session.user.id)
      .then(({ data }) => {
        if (!cancelled) setSavedIds(new Set((data || []).map((r) => r.claim_id)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const toggle = useCallback(
    async (claimId) => {
      if (!session?.user?.id) return;
      const currentlySaved = savedIds.has(claimId);

      if (currentlySaved) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(claimId);
          return next;
        });
        const { error } = await supabase.from("saved_claims").delete().eq("user_id", session.user.id).eq("claim_id", claimId);
        if (error) setSavedIds((prev) => new Set(prev).add(claimId)); // revert on failure
      } else {
        setSavedIds((prev) => new Set(prev).add(claimId));
        const { error } = await supabase.from("saved_claims").insert({ user_id: session.user.id, claim_id: claimId });
        if (error) {
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(claimId);
            return next;
          });
        }
      }
    },
    [session?.user?.id, savedIds],
  );

  return { savedIds, loading, toggle, isSaved: (id) => savedIds.has(id) };
}
