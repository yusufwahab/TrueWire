import { Bookmark } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useAuthSession } from "../../hooks/useAuthSession";
import { useSavedClaims } from "../../hooks/useSavedClaims";

// The spec's literal "gated action" example: clicking Save while signed out bounces to
// /auth?return_to=<here> instead of silently failing, and lands back on this exact page once
// signed in.
export function SaveButton({ claimId, className = "" }) {
  const { session } = useAuthSession();
  const { isSaved, toggle } = useSavedClaims(session);
  const navigate = useNavigate();
  const location = useLocation();
  const saved = isSaved(claimId);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      navigate(`/auth?return_to=${encodeURIComponent(`${location.pathname}${location.search}`)}`);
      return;
    }
    toggle(claimId);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove from saved" : "Save this claim"}
      aria-pressed={saved}
      className={clsx(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors",
        saved ? "border-signal-teal text-signal-teal" : "border-slate/25 text-slate hover:border-signal-teal hover:text-signal-teal",
        className,
      )}
    >
      <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
