import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";
import { PulseSkeleton } from "../ui/PulseSkeleton";

// Wraps every protected route (Dashboard, Saved, My reports, Notifications, Settings). No
// session → bounce to /auth carrying return_to, so a gated action (e.g. Save while signed out)
// lands the user back on the exact page they were on, not a generic destination.
export function RequireAuth() {
  const { session, loading } = useAuthSession();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-16 sm:px-6 lg:px-8">
        <PulseSkeleton className="h-8 w-1/3" />
        <PulseSkeleton className="h-32 w-full" rounded="rounded-xl" />
      </div>
    );
  }

  if (!session) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?return_to=${encodeURIComponent(returnTo)}`} replace />;
  }

  return <Outlet />;
}
