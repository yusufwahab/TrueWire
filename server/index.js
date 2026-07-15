import "./loadEnv.js";
import express from "express";
import cors from "cors";
import { claimsRouter } from "./routes/claims.js";
import { verifyRouter } from "./routes/verify.js";
import { reportRouter } from "./routes/report.js";
import { imagesRouter } from "./routes/images.js";
import { insightsRouter } from "./routes/insights.js";
import { contactRouter } from "./routes/contact.js";
import { narrateRouter } from "./routes/narrate.js";
import { accountRouter } from "./routes/account.js";
import { isSupabaseConfigured } from "./lib/supabaseAdmin.js";
import { isGroqConfigured } from "./lib/groq.js";
import { isGeminiConfigured } from "./lib/gemini.js";
import { isYarnGptConfigured } from "./lib/narration.js";

const app = express();
const PORT = process.env.PORT || 8787;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    supabase: isSupabaseConfigured,
    groq: isGroqConfigured,
    gemini: isGeminiConfigured,
    yarnGpt: isYarnGptConfigured,
  }),
);
app.use("/api/claims", claimsRouter);
app.use("/api/verify", verifyRouter);
app.use("/api/report", reportRouter);
app.use("/api/images", imagesRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/narrate", narrateRouter);
app.use("/api/account", accountRouter);

app.listen(PORT, () => {
  console.log(`Truewire API listening on http://localhost:${PORT}`);
  if (!isSupabaseConfigured) {
    console.log("Supabase env vars not set — serving seed data. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to server/.env to go live.");
  }
  if (!isGroqConfigured && !isGeminiConfigured) {
    console.log("No GROQ_API_KEY or GEMINI_API_KEY set — Verify falls back to the static unconfirmed message. Add either to server/.env to enable.");
  } else {
    console.log(`Claim analysis: Groq ${isGroqConfigured ? "configured" : "not set"}, Gemini ${isGeminiConfigured ? "configured" : "not set"} (Groq tried first, Gemini as fallback).`);
  }
  if (!isYarnGptConfigured) {
    console.log("YarnGPT key not set — the Listen button stays hidden. Add YARNGPT_API_KEY to server/.env to enable.");
  }
});
