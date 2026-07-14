import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognitionImpl =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

// Browser-native speech-to-text (Web Speech API) — free, no key, no server round-trip. Only
// available in Chromium-based browsers; `supported` lets callers hide the mic entirely rather
// than show a button that would just fail silently in Firefox/Safari.
export function useSpeechRecognition({ onResult } = {}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const supported = Boolean(SpeechRecognitionImpl);

  const start = useCallback(() => {
    if (!supported || listening) return;
    setError(null);

    const recognition = new SpeechRecognitionImpl();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) onResultRef.current?.(transcript);
    };
    recognition.onerror = (event) => {
      setError(event.error === "not-allowed" ? "Microphone access was blocked." : "Couldn't hear that — try again.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [supported, listening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  return { supported, listening, error, start, stop };
}
