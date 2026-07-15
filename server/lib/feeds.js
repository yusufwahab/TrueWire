// Verified working (fetched directly, not guessed) as of this build. Africa Check's
// Nigeria-specific feed 404'd and CDD Fact-check wasn't checked — add them here once a working
// feed URL is confirmed; everything downstream (dedupe, extraction, insertion) already handles
// an arbitrary list of sources.
export const FEED_SOURCES = [
  { name: "FactCheckHub", url: "https://factcheckhub.com/feed/" },
  { name: "Dubawa", url: "https://dubawa.org/feed/" },
];
