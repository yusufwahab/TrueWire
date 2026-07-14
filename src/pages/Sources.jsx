import { Reveal } from "../components/ui/Reveal";
import { NEWS_SOURCES, FACT_CHECK_PARTNERS } from "../lib/constants";

function SourceGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((name) => (
        <div key={name} className="rounded-lg border border-slate/15 bg-paper-raised px-4 py-4 text-center">
          <span className="font-display text-sm font-medium text-ink">{name}</span>
        </div>
      ))}
    </div>
  );
}

export function Sources() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Sources & partners</h1>
        <p className="mt-4 max-w-xl text-sm text-slate">
          A verification product is only as trustworthy as what it's checked against — so here's exactly which
          newsrooms and fact-checkers every claim on this site is cross-referenced with.
        </p>
      </Reveal>

      <div className="mt-12 space-y-12">
        <Reveal>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate">News sources</h2>
          <SourceGrid items={NEWS_SOURCES} />
        </Reveal>
        <Reveal>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate">Fact-check partners</h2>
          <SourceGrid items={FACT_CHECK_PARTNERS} />
        </Reveal>
      </div>
    </div>
  );
}
