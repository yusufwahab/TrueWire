import { API_BASE_URL } from "./constants";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  trendingClaims: () => request("/claims/trending"),
  claim: (id) => request(`/claims/${id}`),
  verify: (payload) => request("/verify", { method: "POST", body: JSON.stringify(payload) }),
  report: (payload) => request("/report", { method: "POST", body: JSON.stringify(payload) }),
  imageSearch: (query) => request(`/images/search?query=${encodeURIComponent(query)}`),
  insights: () => request("/insights"),
  insight: (slug) => request(`/insights/${slug}`),
  contact: (payload) => request("/contact", { method: "POST", body: JSON.stringify(payload) }),
  narrateStatus: () => request("/narrate/status"),
  // Binary response (audio), not JSON — bypasses the shared request() helper.
  async narrate(text, voice) {
    const res = await fetch(`${API_BASE_URL}/narrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Narration failed: ${res.status}`);
    }
    return res.blob();
  },
};
