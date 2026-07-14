import clsx from "clsx";

export function Card({ children, className, hover = true, as: As = "div", ...props }) {
  return (
    <As
      className={clsx(
        "rounded-xl border border-slate/15 bg-paper-raised p-5",
        hover && "transition-all duration-200 hover:-translate-y-0.5 hover:border-signal-teal/40 hover:shadow-lg hover:shadow-ink/5",
        className,
      )}
      {...props}
    >
      {children}
    </As>
  );
}
