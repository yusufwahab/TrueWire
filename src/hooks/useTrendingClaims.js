import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { CLAIMS } from "../data/seed";

// Live trending feed: fetches from the API (which itself falls back to seed data when Supabase
// isn't configured), then subscribes to Supabase realtime so new/changed claims refetch without
// polling. Tracks which claim ids just arrived so the UI can flash them instead of popping them in.
export function useTrendingClaims() {
  const [claims, setClaims] = useState(CLAIMS);
  const [loading, setLoading] = useState(true);
  const [newlyArrivedIds, setNewlyArrivedIds] = useState(new Set());
  const seenIds = useRef(new Set());
  const hasLoadedOnce = useRef(false);

  function applyClaims(list) {
    if (!list?.length) return;
    if (hasLoadedOnce.current) {
      const fresh = new Set(list.filter((c) => !seenIds.current.has(c.id)).map((c) => c.id));
      if (fresh.size) {
        setNewlyArrivedIds(fresh);
        setTimeout(() => setNewlyArrivedIds((prev) => {
          const next = new Set(prev);
          fresh.forEach((id) => next.delete(id));
          return next;
        }), 2500);
      }
    }
    list.forEach((c) => seenIds.current.add(c.id));
    hasLoadedOnce.current = true;
    setClaims(list);
  }

  useEffect(() => {
    let cancelled = false;
    api
      .trendingClaims()
      .then((data) => {
        if (!cancelled) applyClaims(data?.claims);
      })
      .catch(() => {
        // Keep the seed fallback already in state (e.g. API server not running yet).
        hasLoadedOnce.current = true;
        seenIds.current = new Set(CLAIMS.map((c) => c.id));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    const channel = supabase
      .channel("claims-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "claims" }, () => {
        api.trendingClaims().then((data) => applyClaims(data?.claims)).catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { claims, loading, newlyArrivedIds };
}
