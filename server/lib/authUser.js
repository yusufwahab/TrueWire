import { supabaseAdmin, isSupabaseConfigured } from "./supabaseAdmin.js";

// Resolves the signed-in user's id from a Bearer token, verified server-side against Supabase
// — never trust a client-supplied user id directly. Returns null for anonymous requests or an
// invalid/expired token, which callers treat as "not signed in" rather than an error.
export async function getUserIdFromRequest(req) {
  if (!isSupabaseConfigured) return null;
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) return null;
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}
