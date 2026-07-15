// Shared between the Groq and Gemini analyzers so the two providers behave identically and
// stay in sync — mirrors CATEGORIES in src/lib/constants.js (kept separate because that file
// reads import.meta.env, which doesn't exist in this plain Node server).
export const CATEGORIES = ["Politics", "Health", "Finance", "Security", "Entertainment"];

export const ANALYSIS_SYSTEM_PROMPT =
  "You help a Nigerian misinformation-verification product explain claims that don't match its fact-check archive. Be honest and hedge appropriately — never assert a claim is true or false without evidence, since there is none here. Write 2-3 plain-language sentences a general reader can follow. Note specific red flags in phrasing (urgency, unverifiable specifics) only if genuinely present — don't invent concerns that aren't there. Critically: never invent details the claim doesn't contain — no dates, event stages (e.g. 'semi-final'), locations, or names beyond what's literally in the claim text. If the claim is vague or missing specifics, say so plainly instead of filling in plausible-sounding detail. Respond with strict JSON only: " +
  JSON.stringify({ explanation: "string", suggestedCategory: CATEGORIES }) +
  ".";

export function buildAnalysisPrompt(text) {
  return `This claim could not be matched against our fact-check archive:\n\n"${text}"\n\nExplain plainly why it's unconfirmed (not verified true or false), and suggest which category it most likely belongs to.`;
}

// Gemini's responseSchema enforces the exact shape server-side, but Groq's JSON mode (and any
// other OpenAI-compatible provider) only guarantees syntactically valid JSON — an open-weight
// model can still use a slightly different key name or wrap the object in markdown fences
// despite the prompt's instructions. Parse defensively rather than trusting the shape exactly,
// and include the raw text in any thrown error so a real failure is diagnosable from the logs.
export function parseAnalysisResponse(raw) {
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) text = fenceMatch[1].trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Response wasn't valid JSON: ${text.slice(0, 200)}`);
  }

  const explanation = parsed.explanation ?? parsed.reason ?? parsed.summary;
  const rawCategory = parsed.suggestedCategory ?? parsed.category ?? parsed.suggested_category;
  const suggestedCategory = CATEGORIES.find((c) => c.toLowerCase() === String(rawCategory).toLowerCase());

  if (typeof explanation !== "string" || !explanation.trim() || !suggestedCategory) {
    throw new Error(`Unexpected response shape: ${text.slice(0, 200)}`);
  }

  return { explanation, suggestedCategory };
}
