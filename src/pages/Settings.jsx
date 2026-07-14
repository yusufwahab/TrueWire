import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Button } from "../components/ui/Button";
import { useAuthSession } from "../hooks/useAuthSession";
import { useProfile } from "../hooks/useProfile";
import { supabase } from "../lib/supabaseClient";
import { api } from "../lib/api";
import { CATEGORIES } from "../lib/constants";

const LANGUAGES = ["English", "Pidgin", "Hausa", "Yoruba", "Igbo"];

export function Settings() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const profile = useProfile(session);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [categories, setCategories] = useState([]);
  const [language, setLanguage] = useState("English");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [accountStatus, setAccountStatus] = useState("idle");
  const [accountMsg, setAccountMsg] = useState("");
  const [prefsStatus, setPrefsStatus] = useState("idle");
  const [prefsMsg, setPrefsMsg] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState("idle");
  const [deleteMsg, setDeleteMsg] = useState("");

  useEffect(() => {
    if (session?.user?.email) setEmail(session.user.email);
  }, [session]);

  useEffect(() => {
    if (profile) {
      setCategories(profile.categories || []);
      setLanguage(profile.language || "English");
      setNotificationsEnabled(profile.notifications_enabled ?? true);
    }
  }, [profile]);

  function toggleCategory(cat) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  async function handleAccountSave(e) {
    e.preventDefault();
    setAccountStatus("loading");
    setAccountMsg("");
    try {
      const updates = {};
      if (email && email !== session.user.email) updates.email = email;
      if (password) updates.password = password;
      if (Object.keys(updates).length === 0) {
        setAccountMsg("Nothing to update.");
        return;
      }
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      setPassword("");
      setAccountMsg("Saved. If you changed your email, check it for a confirmation link.");
    } catch (err) {
      setAccountMsg(err.message);
    } finally {
      setAccountStatus("idle");
    }
  }

  async function handlePrefsSave() {
    setPrefsStatus("loading");
    setPrefsMsg("");
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: session.user.id, categories, language, notifications_enabled: notificationsEnabled });
      if (error) throw error;
      setPrefsMsg("Preferences saved.");
    } catch (err) {
      setPrefsMsg(err.message);
    } finally {
      setPrefsStatus("idle");
    }
  }

  async function handleDeleteAccount() {
    setDeleteStatus("loading");
    setDeleteMsg("");
    try {
      await api.deleteAccount();
      await supabase.auth.signOut();
      navigate("/");
    } catch (err) {
      setDeleteMsg(err.message);
      setDeleteStatus("idle");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Settings</h1>
      </div>

      <section className="mb-10 rounded-xl border border-slate/15 bg-paper-raised p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Account</h2>
        <form onSubmit={handleAccountSave} className="space-y-4">
          <div>
            <label htmlFor="settings-email" className="mb-1.5 block text-xs font-medium text-slate">
              Email
            </label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-slate/25 bg-paper px-4 text-sm text-ink outline-none focus:border-signal-teal"
            />
          </div>
          <div>
            <label htmlFor="settings-password" className="mb-1.5 block text-xs font-medium text-slate">
              New password <span className="text-slate/60">(leave blank to keep current)</span>
            </label>
            <input
              id="settings-password"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-slate/25 bg-paper px-4 text-sm text-ink outline-none focus:border-signal-teal"
            />
          </div>
          {accountMsg && <p className="text-sm text-slate">{accountMsg}</p>}
          <Button type="submit" disabled={accountStatus === "loading"}>
            {accountStatus === "loading" ? "Saving…" : "Save account changes"}
          </Button>
        </form>
      </section>

      <section className="mb-10 rounded-xl border border-slate/15 bg-paper-raised p-6">
        <h2 className="mb-1 font-display text-lg font-semibold text-ink">Preferences</h2>
        <p className="mb-4 text-sm text-slate">Set at onboarding — editable anytime.</p>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">Categories</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={clsx(
                "min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                categories.includes(cat)
                  ? "border-signal-teal bg-signal-teal text-white"
                  : "border-slate/30 text-slate hover:border-signal-teal hover:text-signal-teal",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">Language</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={clsx(
                "min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                language === lang
                  ? "border-signal-teal bg-signal-teal text-white"
                  : "border-slate/30 text-slate hover:border-signal-teal hover:text-signal-teal",
              )}
            >
              {lang}
            </button>
          ))}
        </div>

        <label className="mb-5 flex min-h-11 items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="h-4 w-4 accent-signal-teal"
          />
          Notify me about claims in my categories
        </label>

        {prefsMsg && <p className="mb-3 text-sm text-slate">{prefsMsg}</p>}
        <Button onClick={handlePrefsSave} disabled={prefsStatus === "loading"}>
          {prefsStatus === "loading" ? "Saving…" : "Save preferences"}
        </Button>
      </section>

      <section className="rounded-xl border border-alert-coral/30 bg-alert-coral/5 p-6">
        <h2 className="mb-1 font-display text-lg font-semibold text-ink">Delete account</h2>
        <p className="mb-4 text-sm text-slate">
          This permanently deletes your account and everything tied to it — saved claims, reports, notifications.
          This can't be undone.
        </p>
        {deleteMsg && <p className="mb-3 text-sm text-alert-coral">{deleteMsg}</p>}
        {confirmingDelete ? (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteStatus === "loading"}
              className="min-h-11 rounded-lg bg-alert-coral px-5 text-sm font-medium text-white hover:bg-alert-coral/90"
            >
              {deleteStatus === "loading" ? "Deleting…" : "Yes, delete my account"}
            </button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setConfirmingDelete(true)}>
            Delete my account
          </Button>
        )}
      </section>
    </div>
  );
}
