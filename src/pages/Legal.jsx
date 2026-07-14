import { Reveal } from "../components/ui/Reveal";
import { SITE_NAME } from "../lib/constants";

const COPY = {
  privacy: {
    title: "Privacy",
    body: [
      `${SITE_NAME} collects the minimum needed to run the product: account email for sign-in, saved category/language preferences, and the content of claims you submit through Verify or Report a claim.`,
      "Replace this placeholder with your actual privacy policy — covering data retention, third-party processors (Supabase, Openverse), and user rights — before launch.",
    ],
  },
  terms: {
    title: "Terms",
    body: [
      `Placeholder terms of use for ${SITE_NAME}. Replace with your actual terms covering acceptable use, verdict accuracy disclaimers, and account rules before launch.`,
    ],
  },
};

export function Legal({ page }) {
  const content = COPY[page] || COPY.privacy;
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{content.title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate">
          {content.body.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
