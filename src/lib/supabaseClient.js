import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Read-only + realtime client for the browser. All writes with business logic go through the
// Express API (src/lib/api.js) instead, using the service-role key server-side.
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;
