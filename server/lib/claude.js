import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

// Mirrors CATEGORIES in src/lib/constants.js — kept separate because that file reads
// import.meta.env, which only exists in Vite's browser build, not this plain Node server.
const CATEGORIES = ["Politics", "Health", "Finance", "Security", "Entertainment"];

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
const TTL_MS = 60 * 60 * 1000;
const cache = new Map();

export const isClaudeConfigured = Boolean(API_KEY);
const client = isClaudeConfigured ? new Anthropic({ apiKey: API_KEY }) : null;

const AnalysisSchema = z.object({
  explanation: z.string(),
  suggestedCategory: z.enum(CATEGORIES),
});

const SYSTEM_PROMPT =
  "You help a Nigerian misinformation-verification product explain claims that don't match its fact-check archive. Be honest and hedge appropriately — never assert a claim is true or false without evidence, since there is none here. Write 2-3 plain-language sentences a general reader can follow. Note specific red flags in phrasing (urgency, unverifiable specifics) only if genuinely present — don't invent concerns that aren't there.";

// Called only when the word-overlap matcher (server/lib/matching.js) finds nothing in the
// archive. Replaces the generic canned "unconfirmed" message with real reasoning about the
// text that was actually submitted. Cached per normalized input so repeat/demo queries don't
// re-bill. Returns null (caller falls back to the static message) if unconfigured or on error.
export async function analyzeUnmatchedClaim(text) {
  if (!isClaudeConfigured) return null;

  const key = text.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `This claim could not be matched against our fact-check archive:\n\n"${text}"\n\nExplain plainly why it's unconfirmed (not verified true or false), and suggest which category it most likely belongs to.`,
        },
      ],
      output_config: { format: zodOutputFormat(AnalysisSchema) },
    });

    const data = response.parsed_output;
    if (!data) return null;

    cache.set(key, { at: Date.now(), data });
    return data;
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      console.error("[claude] rate limited:", err.message);
    } else if (err instanceof Anthropic.APIError) {
      console.error("[claude] API error:", err.status, err.message);
    } else {
      console.error("[claude] request failed:", err.message);
    }
    return null;
  }
}
