import clsx from "clsx";
import { VERDICTS } from "../../lib/constants";

export function VerdictPill({ verdict, confidence, size = "md" }) {
  const v = VERDICTS[verdict] || VERDICTS.unconfirmed;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 font-medium",
        size === "md" ? "text-xs" : "text-sm",
        v.className,
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: v.color }} />
      {v.label}
      {typeof confidence === "number" && (
        <span className="font-mono text-[0.7em] opacity-70">{Math.round(confidence * 100)}%</span>
      )}
    </span>
  );
}
