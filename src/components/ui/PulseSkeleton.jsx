import clsx from "clsx";

// The site-wide loading state: a pulse sweeping left to right, used instead of spinners
// anywhere content is loading (claim cards, images, verify results).
export function PulseSkeleton({ className = "h-4 w-full", rounded = "rounded-md" }) {
  return (
    <div className={clsx("relative overflow-hidden bg-slate/10", rounded, className)}>
      <div className="animate-pulse-sweep absolute inset-0 bg-gradient-to-r from-transparent via-paper-raised/70 to-transparent" />
    </div>
  );
}
