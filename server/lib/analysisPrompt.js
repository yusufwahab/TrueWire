// Shared between the Groq and Gemini analyzers so the two providers behave identically and
// stay in sync — mirrors CATEGORIES in src/lib/constants.js (kept separate because that file
// reads import.meta.env, which doesn't exist in this plain Node server).
export const CATEGORIES = ["Politics", "Health", "Finance", "Security", "Entertainment"];

export const ANSWER_TYPES = ["general_knowledge", "no_evidence"];

export const ANALYSIS_SYSTEM_PROMPT =
  "You help a Nigerian misinformation-verification product respond to submissions that don't match its fact-check archive. First classify the submission as one of two answerType values, then respond accordingly:\n\n" +
  "- \"general_knowledge\": ONLY for stable, apolitical, non-current-affairs facts that are true or false independent of any news cycle — calendar/date math (e.g. what day of the week it is), arithmetic, basic science, geography. If the submission mentions a specific person, organization, event, health claim, or statistic, it is NEVER general_knowledge, even if it sounds obviously true or false — classify it as no_evidence instead. When general_knowledge, answer directly and confidently in 1-2 plain sentences.\n" +
  "- \"no_evidence\": everything else, including anything claim-shaped about people, organizations, events, health, or statistics. Be honest and hedge appropriately — never assert a claim is true or false without evidence, since there is none here. Write 2-3 plain-language sentences a general reader can follow. Note specific red flags in phrasing (urgency, unverifiable specifics) only if genuinely present — don't invent concerns that aren't there. Critically: never invent details the submission doesn't contain — no dates, event stages (e.g. 'semi-final'), locations, or names beyond what's literally there. If it's vague or missing specifics, say so plainly instead of filling in plausible-sounding detail.\n\n" +
  "Respond with strict JSON only: " +
  JSON.stringify({ answerType: ANSWER_TYPES, explanation: "string", suggestedCategory: CATEGORIES }) +
  ".";

function currentLagosDate() {
  return new Date().toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function buildAnalysisPrompt(text) {
  return `Today's date (West Africa Time) is ${currentLagosDate()}.\n\nThis submission could not be matched against our fact-check archive:\n\n"${text}"\n\nClassify it and respond as instructed, and suggest which category it most likely belongs to.`;
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
  const rawAnswerType = parsed.answerType ?? parsed.answer_type ?? parsed.type;
  const answerType = ANSWER_TYPES.includes(rawAnswerType) ? rawAnswerType : "no_evidence";

  if (typeof explanation !== "string" || !explanation.trim() || !suggestedCategory) {
    throw new Error(`Unexpected response shape: ${text.slice(0, 200)}`);
  }

  return { explanation, suggestedCategory, answerType };
}
