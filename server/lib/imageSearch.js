const TTL_MS = 60 * 60 * 1000;
const cache = new Map();

// Openverse (openverse.org) aggregates openly-licensed photos from Flickr, Wikimedia, and other
// sources, and its search API is free and keyless — no account or access token required, unlike
// Unsplash. We still proxy it server-side to keep caching centralized and avoid hammering the
// same query from every client. Results carry a real Creative Commons license, so we surface
// creator attribution alongside the image rather than dropping it.
export async function searchPhoto(query) {
  const cached = cache.get(query);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;

  const res = await fetch(
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=10&mature=false&license_type=commercial,modification`,
  );
  if (!res.ok) return null;

  const json = await res.json();
  const results = json.results || [];
  if (!results.length) return null;

  // Prefer a landscape-ish result for hero/banner placement; fall back to the top match.
  const photo = results.find((r) => r.width && r.height && r.width >= r.height) || results[0];

  const data = {
    url: photo.url,
    alt: photo.title || query,
    credit: {
      name: photo.creator || null,
      link: photo.foreign_landing_url || photo.creator_url || null,
      license: photo.license ? photo.license.toUpperCase() : null,
    },
  };
  cache.set(query, { at: Date.now(), data });
  return data;
}
