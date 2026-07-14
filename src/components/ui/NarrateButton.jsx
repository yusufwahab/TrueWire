import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { api } from "../../lib/api";
import { DEFAULT_VOICE } from "../../lib/constants";

// A "Listen" button for the explanation text on Verify results and claim detail pages —
// narrated via YarnGPT (Nigerian-accented text-to-speech), reflecting how much misinformation
// in Nigeria actually spreads by voice, not just text. Renders nothing until the backend
// confirms YarnGPT is configured, so there's never a button that just errors on click.
// `autoPlay` starts narration as soon as it's available (used when the question itself was
// asked by voice, so the answer comes back read aloud without an extra click) — if the browser
// blocks the autoplay, the button just falls back to its normal "retry" state.
export function NarrateButton({ text, voice = DEFAULT_VOICE, autoPlay = false, className = "" }) {
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | playing | error
  const audioRef = useRef(null);
  const autoPlayedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    api
      .narrateStatus()
      .then((data) => {
        if (!cancelled) setAvailable(Boolean(data?.configured));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      audioRef.current?.pause();
    };
  }, []);

  async function play() {
    setStatus("loading");
    try {
      const blob = await api.narrate(text, voice);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setStatus("idle");
      audio.onerror = () => setStatus("error");
      await audio.play();
      setStatus("playing");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    if (autoPlay && available && !autoPlayedRef.current) {
      autoPlayedRef.current = true;
      play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, available]);

  async function handleClick() {
    if (status === "playing") {
      audioRef.current?.pause();
      setStatus("idle");
      return;
    }
    await play();
  }

  if (!available) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate/25 px-3 text-xs font-medium text-slate transition-colors hover:border-signal-teal hover:text-signal-teal ${className}`}
    >
      <Volume2 size={14} />
      {status === "loading" && "Loading audio…"}
      {status === "playing" && "Stop"}
      {status === "error" && "Couldn't play — retry"}
      {status === "idle" && "Listen (English narration)"}
    </button>
  );
}
