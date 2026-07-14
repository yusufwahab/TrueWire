import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import clsx from "clsx";
import { Button } from "../ui/Button";
import { MobileNav } from "./MobileNav";
import { NAV_LINKS, SITE_NAME } from "../../lib/constants";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-30 bg-paper/95 backdrop-blur transition-all duration-200",
        scrolled ? "border-b border-slate/15 py-2" : "py-4",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-pulse-amber" aria-hidden="true" />
          <span className="font-display text-lg font-semibold tracking-tight text-ink">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                clsx("text-sm font-medium transition-colors", isActive ? "text-signal-teal" : "text-ink/80 hover:text-signal-teal")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link to="/auth" className="text-sm font-medium text-ink/80 hover:text-signal-teal">
            Sign in
          </Link>
          <Button to="/report" className="px-4 py-2.5">
            Report a claim
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-ink lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
    </header>
  );
}
