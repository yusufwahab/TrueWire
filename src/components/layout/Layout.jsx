import { useLayoutEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { TickerStrip } from "./TickerStrip";
import { Footer } from "./Footer";

export function Layout() {
  const chromeRef = useRef(null);

  // MobileNav needs to sit exactly below the header+ticker, but that combined height isn't a
  // fixed number — the header shrinks on scroll and the ticker only renders once claims load —
  // so measure it live rather than guessing a static offset that drifts.
  useLayoutEffect(() => {
    const el = chromeRef.current;
    if (!el) return;
    const setOffset = () => document.documentElement.style.setProperty("--chrome-height", `${el.offsetHeight}px`);
    setOffset();
    const observer = new ResizeObserver(setOffset);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div ref={chromeRef}>
        <Header />
        <TickerStrip />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
