import { Router } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabaseAdmin.js";
import { getUserIdFromRequest } from "../lib/authUser.js";

export const accountRouter = Router();

// Deleting an auth user requires the admin API (service-role key), so this can't happen
// client-side like the rest of Settings does. Cascading FKs (profiles, saved_claims,
// notifications, verify_submissions.user_id, user_reports.user_id) clean up automatically.
accountRouter.delete("/", async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.status(501).json({ error: "Account management isn't connected yet." });
  }

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ error: "Sign in required." });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("[account] delete failed:", error.message);
    return res.status(500).json({ error: "Couldn't delete your account. Try again." });
  }

  res.json({ deleted: true });
});
