import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

const LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Saved", to: "/saved" },
  { label: "My reports", to: "/my-reports" },
  { label: "Notifications", to: "/notifications" },
  { label: "Settings", to: "/settings" },
];

// Text-based account menu — no avatar icon circle, per this design system's "no icon-in-circle
// badges" component rule. Always one click from any public page into the authed area.
export function AccountMenu({ session, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink/80 hover:text-signal-teal"
      >
        <span className="max-w-40 truncate" title={session.user.email}>
          {session.user.email}
        </span>
        <ChevronDown size={14} className={clsx("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-48 rounded-lg border border-slate/15 bg-paper-raised p-1.5 shadow-lg">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex min-h-9 items-center rounded-md px-3 text-sm text-ink hover:bg-paper"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex min-h-9 w-full items-center rounded-md px-3 text-left text-sm text-ink hover:bg-paper"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
