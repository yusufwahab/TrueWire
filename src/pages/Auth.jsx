import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Button } from "../components/ui/Button";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { CATEGORIES } from "../lib/constants";

const LANGUAGES = ["English", "Pidgin", "Hausa", "Yoruba", "Igbo"];

export function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [step, setStep] = useState("form"); // form | check-email | onboarding-categories | onboarding-language | done
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [language, setLanguage] = useState("English");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Single source of truth for post-sign-in routing, covering both email and Google OAuth
  // (the OAuth redirect back to this page fires SIGNED_IN here rather than resolving from a
  // direct call, which is what the old code missed). A missing profiles row means onboarding
  // hasn't been completed yet, regardless of how the user signed in.
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== "SIGNED_IN" || !session?.user) return;
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", session.user.id).maybeSingle();
      if (profile) {
        navigate("/trending");
      } else {
        setStep("onboarding-categories");
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setErrorMsg("Sign-in isn't connected yet — add your Supabase keys to .env and server/.env to enable it.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const { data, error } =
        mode === "signup"
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // If the project requires email confirmation, signUp succeeds but returns no session —
      // nothing will trigger the listener above until the user confirms, so say so plainly
      // instead of leaving them on a form that looks like it did nothing.
      if (mode === "signup" && !data.session) setStep("check-email");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setStatus("idle");
    }
  }

  async function handleGoogle() {
    if (!isSupabaseConfigured) {
      setErrorMsg("Sign-in isn't connected yet — add your Supabase keys to enable it.");
      return;
    }
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  function toggleCategory(cat) {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  async function finishOnboarding() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (userId) {
        const { error } = await supabase.from("profiles").upsert({ id: userId, categories: selectedCategories, language });
        if (error) throw error;
      }
      setStep("done");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16 sm:px-6">
      <div className="w-full rounded-xl border border-slate/15 bg-paper-raised p-8">
        {step === "form" && (
          <>
            <h1 className="font-display text-2xl font-semibold text-ink">{mode === "signup" ? "Create an account" : "Sign in"}</h1>
            <p className="mt-1.5 text-sm text-slate">Save alert preferences and get a trending feed tuned to what you care about.</p>

            {!isSupabaseConfigured && (
              <p className="mt-4 rounded-lg border border-slate/20 bg-paper px-3 py-2 text-xs text-slate">
                Sign-in isn't connected yet. Once Supabase keys are added, this form works as-is.
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="auth-email" className="mb-1.5 block text-xs font-medium text-slate">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-11 w-full rounded-lg border border-slate/25 bg-paper px-4 text-sm text-ink outline-none focus:border-signal-teal"
                />
              </div>
              <div>
                <label htmlFor="auth-password" className="mb-1.5 block text-xs font-medium text-slate">
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-11 w-full rounded-lg border border-slate/25 bg-paper px-4 text-sm text-ink outline-none focus:border-signal-teal"
                />
              </div>

              {errorMsg && <p className="text-sm text-alert-coral">{errorMsg}</p>}

              <Button type="submit" disabled={status === "loading"} className="w-full">
                {mode === "signup" ? "Create account" : "Sign in"}
              </Button>
            </form>

            <button
              type="button"
              onClick={handleGoogle}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate/25 text-sm font-medium text-ink hover:border-signal-teal"
            >
              Continue with Google
            </button>

            <p className="mt-6 text-center text-sm text-slate">
              {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="font-medium text-signal-teal hover:underline"
              >
                {mode === "signup" ? "Sign in" : "Create an account"}
              </button>
            </p>
          </>
        )}

        {step === "check-email" && (
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold text-ink">Check your email</h1>
            <p className="mt-2 text-sm text-slate">
              We've sent a confirmation link to <span className="font-medium text-ink">{email}</span>. Confirm your
              address, then come back and sign in.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setStep("form");
                setMode("signin");
              }}
              className="mt-6 w-full"
            >
              Back to sign in
            </Button>
          </div>
        )}

        {step === "onboarding-categories" && (
          <>
            <p className="mb-1 font-mono text-xs text-slate">Step 1 of 2</p>
            <h1 className="font-display text-2xl font-semibold text-ink">What matters to you?</h1>
            <p className="mt-1.5 text-sm text-slate">Pick a few categories to personalize your trending feed and ticker.</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={clsx(
                    "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors",
                    selectedCategories.includes(cat)
                      ? "border-signal-teal bg-signal-teal text-white"
                      : "border-slate/30 text-slate hover:border-signal-teal hover:text-signal-teal",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Button onClick={() => setStep("onboarding-language")} className="mt-8 w-full">
              Continue
            </Button>
          </>
        )}

        {step === "onboarding-language" && (
          <>
            <p className="mb-1 font-mono text-xs text-slate">Step 2 of 2</p>
            <h1 className="font-display text-2xl font-semibold text-ink">Preferred language</h1>
            <p className="mt-1.5 text-sm text-slate">We'll use this for future alerts where a translation is available.</p>

            <div className="mt-6 space-y-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={clsx(
                    "flex min-h-11 w-full items-center justify-between rounded-lg border px-4 text-sm font-medium transition-colors",
                    language === lang ? "border-signal-teal bg-signal-teal/8 text-signal-teal" : "border-slate/25 text-ink hover:border-signal-teal/50",
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>

            {errorMsg && <p className="mt-4 text-sm text-alert-coral">{errorMsg}</p>}

            <Button onClick={finishOnboarding} disabled={status === "loading"} className="mt-8 w-full">
              {status === "loading" ? "Saving…" : "Finish"}
            </Button>
          </>
        )}

        {step === "done" && (
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold text-ink">You're set up.</h1>
            <p className="mt-2 text-sm text-slate">Your trending feed and ticker are now tuned to your preferences.</p>
            <Button to="/trending" className="mt-6 w-full">
              Go to Trending
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
