import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Link2, FileText, ImageIcon, Mic } from "lucide-react";
import clsx from "clsx";
import { Button } from "../components/ui/Button";
import { PulseSkeleton } from "../components/ui/PulseSkeleton";
import { VerdictPill } from "../components/ui/VerdictPill";
import { NarrateButton } from "../components/ui/NarrateButton";
import { SaveButton } from "../components/ui/SaveButton";
import { useAuthSession } from "../hooks/useAuthSession";
import { useProfile } from "../hooks/useProfile";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { api } from "../lib/api";
import { CLAIMS } from "../data/seed";
import { VOICE_BY_LANGUAGE, DEFAULT_VOICE } from "../lib/constants";

const TABS = [
  { key: "text", label: "Paste text", icon: FileText },
  { key: "link", label: "Paste a link", icon: Link2 },
  { key: "image", label: "Upload an image", icon: ImageIcon, disabled: true },
];

const STATUS_MESSAGES = ["Checking fact-check archive…", "Cross-referencing trusted sources…", "Weighing corroborating evidence…"];

export function Verify() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState("text");
  const [text, setText] = useState(searchParams.get("q") || "");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | result | error
  const [statusStep, setStatusStep] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [askedByVoice, setAskedByVoice] = useState(false);
  const intervalRef = useRef(null);
  const { session } = useAuthSession();
  const profile = useProfile(session);
  const voice = VOICE_BY_LANGUAGE[profile?.language] || DEFAULT_VOICE;

  useEffect(() => {
    if (status !== "loading") {
      clearInterval(intervalRef.current);
      return undefined;
    }
    setStatusStep(0);
    intervalRef.current = setInterval(() => {
      setStatusStep((s) => (s + 1) % STATUS_MESSAGES.length);
    }, 750);
    return () => clearInterval(intervalRef.current);
  }, [status]);

  async function runVerify(value) {
    if (!value?.trim()) return;

    setStatus("loading");
    setErrorMsg("");
    const minDelay = new Promise((resolve) => setTimeout(resolve, 1400));

    try {
      const [data] = await Promise.all([api.verify({ inputType: tab, inputText: value, inputUrl: link }), minDelay]);
      setResult(data);
      setStatus("result");
    } catch (err) {
      await minDelay;
      setErrorMsg(err.message || "Something went wrong. Try again.");
      setStatus("error");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setAskedByVoice(false);
    runVerify(tab === "link" ? link : text);
  }

  const speech = useSpeechRecognition({
    onResult: (transcript) => {
      setText(transcript);
      setAskedByVoice(true);
      runVerify(transcript);
    },
  });

  function reset() {
    setStatus("idle");
    setResult(null);
    setAskedByVoice(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Verify a claim</h1>
        <p className="mt-2 text-sm text-slate">Paste text, a link, an image, or just ask out loud — we'll check it against the archive.</p>
      </div>

      {status === "idle" && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3 flex gap-2 border-b border-slate/15">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                disabled={t.disabled}
                onClick={() => setTab(t.key)}
                className={clsx(
                  "flex min-h-11 items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors",
                  tab === t.key ? "border-signal-teal text-signal-teal" : "border-transparent text-slate hover:text-ink",
                  t.disabled && "cursor-not-allowed opacity-40 hover:text-slate",
                )}
              >
                <t.icon size={15} />
                {t.label}
                {t.disabled && <span className="ml-1 font-mono text-[10px] uppercase text-slate">Soon</span>}
              </button>
            ))}
          </div>

          {tab === "text" && (
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder={speech.supported ? "Paste the claim, message, or text you want checked… or tap the mic to speak it." : "Paste the claim, message, or text you want checked…"}
                className="w-full rounded-lg border border-slate/25 bg-paper-raised p-4 pr-14 text-sm text-ink outline-none focus:border-signal-teal"
              />
              {speech.supported && (
                <button
                  type="button"
                  onClick={() => (speech.listening ? speech.stop() : speech.start())}
                  aria-label={speech.listening ? "Stop listening" : "Ask by voice"}
                  className={clsx(
                    "absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                    speech.listening
                      ? "border-signal-teal bg-signal-teal text-white"
                      : "border-slate/25 text-slate hover:border-signal-teal hover:text-signal-teal",
                  )}
                >
                  <Mic size={16} />
                </button>
              )}
            </div>
          )}
          {tab === "text" && speech.listening && (
            <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-slate">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pulse-amber" aria-hidden="true" />
              Listening…
            </p>
          )}
          {tab === "text" && speech.error && <p className="mt-2 text-xs text-alert-coral">{speech.error}</p>}
          {tab === "link" && (
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://…"
              className="min-h-11 w-full rounded-lg border border-slate/25 bg-paper-raised p-4 text-sm text-ink outline-none focus:border-signal-teal"
            />
          )}
          {tab === "image" && (
            <div className="rounded-lg border border-dashed border-slate/30 bg-paper-raised p-8 text-center text-sm text-slate">
              Image upload for media forensics is coming soon.
            </div>
          )}

          <Button type="submit" className="mt-4 w-full">
            Verify this
          </Button>
        </form>
      )}

      {status === "loading" && (
        <div className="space-y-4 rounded-xl border border-slate/15 bg-paper-raised p-8 text-center">
          <PulseSkeleton className="mx-auto h-3 w-2/3" />
          <PulseSkeleton className="mx-auto h-3 w-1/2" />
          <p className="pt-2 font-mono text-sm text-slate">{STATUS_MESSAGES[statusStep]}</p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-alert-coral/30 bg-alert-coral/5 p-6 text-center">
          <p className="text-sm text-alert-coral">{errorMsg}</p>
          <button type="button" onClick={reset} className="mt-4 text-sm font-medium text-signal-teal hover:underline">
            Try again
          </button>
        </div>
      )}

      {status === "result" && result && (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <VerdictPill verdict={result.verdict} confidence={result.confidence ?? undefined} size="lg" />
            {result.claim?.id && <SaveButton claimId={result.claim.id} />}
          </div>
          <div className="rounded-xl border border-slate/15 bg-paper-raised p-6">
            <div className="mb-1 flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate">Why we think this</p>
              <NarrateButton text={result.explanation} voice={voice} autoPlay={askedByVoice} />
            </div>
            <p className="text-base leading-relaxed text-ink/90">{result.explanation}</p>
          </div>

          {result.sources?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">Sources</p>
              <ul className="space-y-2">
                {result.sources.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-slate/15 bg-paper-raised px-4 py-3 text-sm hover:border-signal-teal/40"
                    >
                      <span className="font-medium text-ink">{s.name}</span>
                      <span className={`ml-2 font-mono text-xs ${s.stance === "contradicts" ? "text-alert-coral" : "text-signal-teal"}`}>
                        {s.stance}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button type="button" onClick={reset} className="w-full text-center text-sm font-medium text-signal-teal hover:underline">
            Check another claim
          </button>
        </div>
      )}

      {status === "idle" && (
        <div className="mt-14">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate">Recently verified</p>
          <ul className="space-y-2">
            {CLAIMS.slice(0, 3).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate/15 bg-paper-raised px-4 py-3">
                <span className="truncate text-sm text-ink/85">{c.text}</span>
                <VerdictPill verdict={c.verdict} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
