export const SITE_NAME = "Truewire";
export const SITE_TAGLINE = "Real-time misinformation detection for Nigeria";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787/api";

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Trending", to: "/trending" },
  { label: "Verify", to: "/verify" },
  { label: "How it works", to: "/how-it-works" },
  { label: "About", to: "/about" },
];

export const FOOTER_LINKS = {
  Product: [
    { label: "Trending", to: "/trending" },
    { label: "Verify", to: "/verify" },
    { label: "How it works", to: "/how-it-works" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ],
  Trust: [
    { label: "Sources & partners", to: "/sources" },
    { label: "Methodology", to: "/how-it-works" },
  ],
  Legal: [
    { label: "Privacy", to: "/privacy" },
    { label: "Terms", to: "/terms" },
  ],
};

export const CATEGORIES = ["Politics", "Health", "Finance", "Security", "Entertainment"];

export const VERDICTS = {
  verified: {
    label: "Verified",
    description: "Corroborated by trusted sources",
    color: "var(--color-signal-teal)",
    className: "text-signal-teal border-signal-teal/30 bg-signal-teal/8",
  },
  disputed: {
    label: "Disputed",
    description: "Contradicted by trusted sources",
    color: "var(--color-alert-coral)",
    className: "text-alert-coral border-alert-coral/30 bg-alert-coral/8",
  },
  unconfirmed: {
    label: "Unconfirmed",
    description: "No confident match yet — queued for review",
    color: "var(--color-slate)",
    className: "text-slate border-slate/30 bg-slate/8",
  },
  general_knowledge: {
    label: "General knowledge",
    description: "Answered from general knowledge — not cross-checked against our fact-check archive",
    color: "var(--color-pulse-amber)",
    className: "text-pulse-amber border-pulse-amber/30 bg-pulse-amber/8",
  },
};

export const NEWS_SOURCES = [
  "Punch",
  "Vanguard",
  "Premium Times",
  "TheCable",
  "Daily Trust",
  "Channels TV",
  "The Guardian Nigeria",
  "PM News",
];

export const FACT_CHECK_PARTNERS = ["Dubawa", "FactCheckHub", "Africa Check", "CDD Fact-check"];

export const WHATSAPP_REPORT_NUMBER = null; // set to a real number to go live, e.g. "+234 800 000 0000"

// Picks a default YarnGPT voice persona from a signed-in user's saved language preference.
// These are Nigerian-accented English voices, not literal Yoruba/Igbo/Hausa translations — the
// app has no translated copy, so narration text stays English regardless of this choice.
export const VOICE_BY_LANGUAGE = {
  English: "Idera",
  Pidgin: "Tayo",
  Hausa: "Umar",
  Yoruba: "Femi",
  Igbo: "Nonso",
};
export const DEFAULT_VOICE = "Idera";
