import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { VerdictPill } from "../components/ui/VerdictPill";
import { PulseSkeleton } from "../components/ui/PulseSkeleton";
import { useAuthSession } from "../hooks/useAuthSession";
import { supabase } from "../lib/supabaseClient";
import { timeAgo } from "../lib/format";

export function Notifications() {
  const { session } = useAuthSession();
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return undefined;
    let cancelled = false;
    supabase
      .from("notifications")
      .select("id, created_at, read, claims:claim_id(text, verdict, slug)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        const rows = data || [];
        setNotifications(rows);
        const unreadIds = rows.filter((n) => !n.read).map((n) => n.id);
        if (unreadIds.length) {
          supabase.from("notifications").update({ read: true }).in("id", unreadIds).then(() => {});
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Notifications</h1>
        <p className="mt-2 text-sm text-slate">Claims in your categories, as they're detected.</p>
      </div>

      {notifications === null ? (
        <div className="space-y-3">
          <PulseSkeleton className="h-16 w-full" rounded="rounded-xl" />
          <PulseSkeleton className="h-16 w-full" rounded="rounded-xl" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="rounded-xl border border-slate/15 bg-paper-raised px-4 py-8 text-center text-sm text-slate">
          No alerts yet — you'll see claims here as they match your saved categories.
        </p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id}>
              <Link
                to={`/trending/${n.claims?.slug || ""}`}
                className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors hover:border-signal-teal/40 ${
                  n.read ? "border-slate/15 bg-paper-raised" : "border-signal-teal/30 bg-signal-teal/5"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink/90">{n.claims?.text}</p>
                  <p className="font-mono text-xs text-slate">{timeAgo(n.created_at)}</p>
                </div>
                {n.claims?.verdict && <VerdictPill verdict={n.claims.verdict} />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
