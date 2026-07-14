// Small, quiet attribution line for the Creative Commons photos served via useEditorialImage —
// unobtrusive by design, consistent with the "no decorative noise" component rules.
export function PhotoCredit({ credit, className = "" }) {
  if (!credit?.name) return null;

  const label = `Photo: ${credit.name}${credit.license ? ` · ${credit.license}` : ""}`;

  return (
    <p className={`font-mono text-[11px] text-slate/60 ${className}`}>
      {credit.link ? (
        <a href={credit.link} target="_blank" rel="noreferrer" className="hover:text-slate">
          {label}
        </a>
      ) : (
        label
      )}
    </p>
  );
}
