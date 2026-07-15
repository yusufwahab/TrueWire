import { isGroqConfigured } from "./groq.js";
import { isGeminiConfigured } from "./gemini.js";

// Deliberately separate from claimAnalysis.js's Groq/Gemini calls (different prompt, different
// schema, different call sites) rather than forcing a shared abstraction over that already
// verified-working file. The lenient-parsing approach is carried over, not imported.
const CATEGORIES = ["Politics", "Health", "Finance", "Security", "Entertainment"];

const EXTRACTION_SYSTEM_PROMPT =
  "You process an article from a Nigerian fact-checking organization or news outlet and extract structured data for a misinformation-tracking database. Not every article is usable — some sources here are plain news wire, not fact-checkers. Respond with strict JSON only: " +
  JSON.stringify({
    isNigeriaRelevant: "boolean",
    claimText: "string",
    verdict: ["verified", "disputed", "unconfirmed"],
    explanation: "string",
    category: CATEGORIES,
  }) +
  ". Rules: isNigeriaRelevant is true only if ALL of these hold — (1) the article concerns Nigeria, Nigerian people/institutions/events, written in English, AND (2) the article is actually examining a specific claim, rumor, or contested assertion circulating publicly — not just routine news reporting (a government announcement, a policy update, an ordinary event write-up) with nothing in dispute. Ordinary news with no claim being checked is NOT relevant, even if newsworthy. claimText restates what's being claimed as a NEUTRAL statement (not the verdict) — e.g. 'Video claims X happened', never 'X did not happen'. verdict is 'disputed' if the article shows the claim is false or misleading, 'verified' if confirmed true, 'unconfirmed' if the article itself reaches no clear conclusion. explanation is 2-3 plain sentences summarizing why, grounded only in the summary given — don't invent details.";

function buildExtractionPrompt({ title, snippet, sourceName }) {
  return `Source: ${sourceName}\nHeadline: ${title}\nSummary: ${snippet || "(no summary provided)"}\n\nExtract the structured claim data as instructed.`;
}

function parseExtractionResponse(raw) {
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) text = fenceMatch[1].trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Response wasn't valid JSON: ${text.slice(0, 200)}`);
  }

  const claimText = parsed.claimText ?? parsed.claim_text ?? parsed.claim;
  const verdict = String(parsed.verdict || "").toLowerCase();
  const category = CATEGORIES.find((c) => c.toLowerCase() === String(parsed.category || "").toLowerCase());
  const explanation = parsed.explanation ?? parsed.reason;
  const isNigeriaRelevant = Boolean(parsed.isNigeriaRelevant ?? parsed.is_nigeria_relevant);

  if (
    typeof claimText !== "string" ||
    !claimText.trim() ||
    !["verified", "disputed", "unconfirmed"].includes(verdict) ||
    !category ||
    typeof explanation !== "string" ||
    !explanation.trim()
  ) {
    throw new Error(`Unexpected extraction shape: ${text.slice(0, 200)}`);
  }

  return { isNigeriaRelevant, claimText: claimText.trim(), verdict, explanation: explanation.trim(), category };
}

async function extractWithGroq(item, sourceName) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content: buildExtractionPrompt({ title: item.title, snippet: item.snippet, sourceName }) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 700,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq extraction failed: ${res.status} ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned no content");
  return parseExtractionResponse(content);
}

async function extractWithGemini(item, sourceName) {
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildExtractionPrompt({ title: item.title, snippet: item.snippet, sourceName }) }] }],
        systemInstruction: { parts: [{ text: EXTRACTION_SYSTEM_PROMPT }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              isNigeriaRelevant: { type: "boolean" },
              claimText: { type: "string" },
              verdict: { type: "string", enum: ["verified", "disputed", "unconfirmed"] },
              explanation: { type: "string" },
              category: { type: "string", enum: CATEGORIES },
            },
            required: ["isNigeriaRelevant", "claimText", "verdict", "explanation", "category"],
          },
        },
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini extraction failed: ${res.status} ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Gemini returned no content");
  return parseExtractionResponse(content);
}

// Groq first, Gemini as fallback — same resilience shape as claimAnalysis.js. Returns null (the
// item is skipped, not retried until dedupe logic decides otherwise) if both fail.
export async function extractClaimFromItem(item, sourceName) {
  if (isGroqConfigured) {
    try {
      return await extractWithGroq(item, sourceName);
    } catch (err) {
      console.error("[claimExtraction] Groq failed, falling back to Gemini:", err.message);
    }
  }
  if (isGeminiConfigured) {
    try {
      return await extractWithGemini(item, sourceName);
    } catch (err) {
      console.error("[claimExtraction] Gemini failed too:", err.message);
    }
  }
  return null;
}
