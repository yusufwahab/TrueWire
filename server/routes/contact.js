import { Router } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabaseAdmin.js";

export const contactRouter = Router();

contactRouter.post("/", async (req, res) => {
  const { name = "", email = "", message = "" } = req.body || {};

  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ error: "Name, email, and message are all required." });
  }

  let saved = false;
  if (isSupabaseConfigured) {
    const { error } = await supabaseAdmin.from("contact_messages").insert({ name, email, message });
    if (error) console.error("[contact] insert failed:", error.message);
    saved = !error;
  }

  res.json({ received: true, saved });
});
