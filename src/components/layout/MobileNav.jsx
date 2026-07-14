import { NavLink, Link } from "react-router-dom";
import clsx from "clsx";
import { X } from "lucide-react";
import { NAV_LINKS } from "../../lib/constants";
import { Button } from "../ui/Button";

// Slide-in panel from the right, offset below the header/ticker so the live ticker stays
// visible while the nav is open. Always mounted with a CSS transform transition (rather than a
// JS-driven mount/unmount animation) so open/close is never at the mercy of a dropped frame.
export function MobileNav({ open, onClose, session, onSignOut }) {
  return (
    <>
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 top-[6.5rem] z-40 bg-ink/40 transition-opacity duration-200 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={clsx(
          "fixed right-0 top-[6.5rem] z-40 flex h-[calc(100%-6.5rem)] w-[80%] max-w-xs flex-col gap-1 overflow-y-auto bg-paper-raised p-6 shadow-xl transition-transform duration-250 ease-out lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-lg font-semibold">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink"
          >
            <X size={22} />
          </button>
        </div>
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className={({ isActive }) =>
              `flex min-h-11 items-center rounded-lg px-3 py-3 text-base font-medium ${
                isActive ? "bg-signal-teal/8 text-signal-teal" : "text-ink"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
        {session ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onSignOut?.();
            }}
            tabIndex={open ? 0 : -1}
            className="flex min-h-11 items-center rounded-lg px-3 py-3 text-left text-base font-medium text-ink"
          >
            Sign out
          </button>
        ) : (
          <Link
            to="/auth"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="flex min-h-11 items-center rounded-lg px-3 py-3 text-base font-medium text-ink"
          >
            Sign in
          </Link>
        )}
        <div className="mt-4">
          <Button to="/report" onClick={onClose} tabIndex={open ? 0 : -1} className="w-full">
            Report a claim
          </Button>
        </div>
      </div>
    </>
  );
}
