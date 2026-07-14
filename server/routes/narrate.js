import { Router } from "express";
import { synthesizeSpeech, isYarnGptConfigured } from "../lib/narration.js";

export const narrateRouter = Router();

// The frontend checks this before rendering a "Listen" button at all, rather than showing a
// button that would just error on click.
narrateRouter.get("/status", (req, res) => {
  res.json({ configured: isYarnGptConfigured });
});

narrateRouter.post("/", async (req, res) => {
  if (!isYarnGptConfigured) {
    return res.status(501).json({ error: "Narration isn't configured yet." });
  }

  const { text, voice } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    const audio = await synthesizeSpeech(text, voice);
    res.setHeader("Content-Type", audio.contentType);
    res.send(audio.buffer);
  } catch (err) {
    console.error("[narrate]", err.message);
    res.status(502).json({ error: "Narration failed." });
  }
});
