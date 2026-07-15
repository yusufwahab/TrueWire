import Parser from "rss-parser";

const parser = new Parser({ timeout: 10_000 });

// Normalizes an RSS/Atom feed into a flat item list. Returns [] on fetch/parse failure rather
// than throwing — one broken feed shouldn't stop the ingestion cycle for the others.
export async function fetchFeedItems(feedUrl) {
  try {
    const feed = await parser.parseURL(feedUrl);
    return (feed.items || []).map((item) => ({
      guid: item.guid || item.link || item.title,
      title: item.title || "",
      link: item.link || "",
      snippet: item.contentSnippet || item.summary || "",
      isoDate: item.isoDate || item.pubDate || null,
    }));
  } catch (err) {
    console.error(`[rssFetcher] failed to fetch ${feedUrl}:`, err.message);
    return [];
  }
}
