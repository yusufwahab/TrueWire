import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

// The single scroll-reveal pattern used site-wide: 12px upward translate + fade, once, at 20%
// viewport visibility. Plain IntersectionObserver + CSS transition rather than a JS-driven
// animation loop, with a timeout safety net, so content can never get stuck invisible if a
// frame gets dropped or the observer never fires. prefers-reduced-motion is handled by the
// global transition-duration override in index.css.
export function Reveal({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const safety = setTimeout(() => setVisible(true), 1500);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          clearTimeout(safety);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);

    return () => {
      clearTimeout(safety);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={clsx("transition-all duration-[400ms] ease-out", visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0", className)}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
