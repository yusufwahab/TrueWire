import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { CLAIMS } from "../data/seed";

// Live trending feed: fetches from the API (which itself falls back to seed data when Supabase
// isn't configured), then subscribes to Supabase realtime so new/changed claims refetch without
// polling. Tracks which claim ids just arrived so the UI can flash them instead of popping them in.
// `preferredCategories` (from a signed-in user's saved profile) boosts matching claims to the
// front — nothing is hidden, it's a reorder, not a filter.
export function useTrendingClaims(preferredCategories = []) {
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
    // Multiple components (TickerStrip, Home, Trending) each call this hook, and Supabase
    // reuses a channel object when you ask for a name that's already registered — reusing a
    // fixed name across instances (or across React StrictMode's dev double-mount) means a
    // second `.on()` call lands on an already-subscribed channel, which Supabase rejects. A
    // name that's unique per subscription sidesteps that entirely.
    const channelName = `claims-changes-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "claims" }, () => {
        api.trendingClaims().then((data) => applyClaims(data?.claims)).catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const orderedClaims = useMemo(() => {
    if (!preferredCategories?.length) return claims;
    const preferred = new Set(preferredCategories);
    const boosted = [];
    const rest = [];
    claims.forEach((c) => (preferred.has(c.category) ? boosted : rest).push(c));
    return [...boosted, ...rest];
  }, [claims, preferredCategories]);

  return { claims: orderedClaims, loading, newlyArrivedIds };
}
