import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt, parseAnalysisResponse } from "./analysisPrompt.js";

const API_KEY = process.env.GROQ_API_KEY;
// llama-3.3-70b-versatile / llama-3.1-8b-instant were deprecated by Groq in favor of the
// gpt-oss line — override via GROQ_MODEL if this drifts again.
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

export const isGroqConfigured = Boolean(API_KEY);

export async function analyzeWithGroq(text) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: buildAnalysisPrompt(text) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 700,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq request failed: ${res.status} ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned no content");
  return parseAnalysisResponse(content);
}
