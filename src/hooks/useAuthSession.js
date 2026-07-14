import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

// Tracks the current Supabase auth session reactively — including catching the redirect-back
// from an OAuth provider (Google), which fires onAuthStateChange rather than resolving from a
// direct call. Used by Header/MobileNav for signed-in state and by Auth.jsx to route a
// completed OAuth sign-in correctly.
export function useAuthSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
