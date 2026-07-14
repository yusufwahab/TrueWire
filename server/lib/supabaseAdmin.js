import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && serviceKey);

// Server-side client using the service-role key — bypasses RLS, so all writes with business
// logic (verify matching, report intake, contact form) go through here, never the anon client.
export const supabaseAdmin = isSupabaseConfigured ? createClient(url, serviceKey) : null;
