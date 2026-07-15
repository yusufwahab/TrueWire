import { CATEGORIES, ANSWER_TYPES, ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt, parseAnalysisResponse } from "./analysisPrompt.js";

const API_KEY = process.env.GEMINI_API_KEY;
// Google has been retiring dated Gemini model names faster than announced (2.0-flash in
// March 2026, 2.5-flash cut off for new API keys days after being documented as current) — use
// the "-latest" alias instead of a pinned version so this points at whatever Google currently
// considers their default flash model, rather than a name that can 404 without warning.
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

export const isGeminiConfigured = Boolean(API_KEY);

export async function analyzeWithGemini(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildAnalysisPrompt(text) }] }],
        systemInstruction: { parts: [{ text: ANALYSIS_SYSTEM_PROMPT }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              answerType: { type: "string", enum: ANSWER_TYPES },
              explanation: { type: "string" },
              suggestedCategory: { type: "string", enum: CATEGORIES },
            },
            required: ["answerType", "explanation", "suggestedCategory"],
          },
        },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini request failed: ${res.status} ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Gemini returned no content");
  return parseAnalysisResponse(content);
}
