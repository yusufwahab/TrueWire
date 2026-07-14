import "dotenv/config";
import express from "express";
import cors from "cors";
import { claimsRouter } from "./routes/claims.js";
import { verifyRouter } from "./routes/verify.js";
import { reportRouter } from "./routes/report.js";
import { imagesRouter } from "./routes/images.js";
import { insightsRouter } from "./routes/insights.js";
import { contactRouter } from "./routes/contact.js";
import { isSupabaseConfigured } from "./lib/supabaseAdmin.js";

const app = express();
const PORT = process.env.PORT || 8787;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true, supabase: isSupabaseConfigured }));
app.use("/api/claims", claimsRouter);
app.use("/api/verify", verifyRouter);
app.use("/api/report", reportRouter);
app.use("/api/images", imagesRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/contact", contactRouter);

app.listen(PORT, () => {
  console.log(`Truewire API listening on http://localhost:${PORT}`);
  if (!isSupabaseConfigured) {
    console.log("Supabase env vars not set — serving seed data. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to server/.env to go live.");
  }
});
