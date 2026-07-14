import { useEffect, useState } from "react";
import { api } from "../lib/api";

// Fetches a real editorial photo through the server-side image-search proxy (Openverse — free,
// keyless, Creative Commons licensed). If the request fails, returns error:true so callers render
// the pulse-skeleton / placeholder block instead of a broken <img>. `credit` carries the
// attribution CC licenses require; render it wherever the image is shown.
export function useEditorialImage(query) {
  const [state, setState] = useState({ url: null, alt: query, credit: null, loading: true, error: false });

  useEffect(() => {
    let cancelled = false;
    setState({ url: null, alt: query, credit: null, loading: true, error: false });
    api
      .imageSearch(query)
      .then((data) => {
        if (cancelled) return;
        if (data?.url) setState({ url: data.url, alt: data.alt || query, credit: data.credit || null, loading: false, error: false });
        else setState({ url: null, alt: query, credit: null, loading: false, error: true });
      })
      .catch(() => {
        if (!cancelled) setState({ url: null, alt: query, credit: null, loading: false, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return state;
}
