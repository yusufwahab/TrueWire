const API_KEY = process.env.YARNGPT_API_KEY;
const BASE_URL = "https://yarngpt.ai/api/v1";
const TTL_MS = 60 * 60 * 1000;
const MAX_CHARS = 2000;
const cache = new Map();

export const isYarnGptConfigured = Boolean(API_KEY);

// YarnGPT (yarngpt.ai) — a hosted, keyed REST API for Nigerian-accented text-to-speech. Cached
// per text+voice so repeat/demo narration of the same claim doesn't re-bill.
export async function synthesizeSpeech(text, voice = "Idera") {
  if (!isYarnGptConfigured) return null;

  const clipped = text.slice(0, MAX_CHARS);
  const key = `${voice}:${clipped}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;

  const res = await fetch(`${BASE_URL}/tts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: clipped, voice, response_format: "mp3" }),
  });
  if (!res.ok) {
    throw new Error(`YarnGPT request failed: ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const data = { buffer, contentType: "audio/mpeg" };
  cache.set(key, { at: Date.now(), data });
  return data;
}
