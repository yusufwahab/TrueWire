import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Fetches the signed-in user's saved categories/language preferences (written during
// onboarding). Returns null when signed out, or when the row doesn't exist yet.
export function useProfile(session) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      return undefined;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("categories, language")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile(data);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return profile;
}
