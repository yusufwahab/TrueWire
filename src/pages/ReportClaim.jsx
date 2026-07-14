import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { CATEGORIES, WHATSAPP_REPORT_NUMBER } from "../lib/constants";

export function ReportClaim() {
  const [content, setContent] = useState("");
  const [type, setType] = useState("text");
  const [category, setCategory] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | done | error
  const [response, setResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setStatus("submitting");
    try {
      const data = await api.report({ content, type, category: category || null, contactEmail: contactEmail || null });
      setResponse(data);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong submitting your report.");
      setStatus("error");
    }
  }

  if (status === "done" && response) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Reveal>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-signal-teal">Report received</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Thanks — this is genuinely useful.</h1>
          <p className="mt-4 text-base leading-relaxed text-slate">{response.message}</p>
          <div className="mt-8">
            <Button
              onClick={() => {
                setStatus("idle");
                setContent("");
                setResponse(null);
              }}
              variant="secondary"
            >
              Report another claim
            </Button>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Report a claim</h1>
        <p className="mt-3 text-sm text-slate">
          Seen something spreading that looks off? Forward it here — reports are one of the main ways we catch a
          claim before it spreads further.
        </p>
      </Reveal>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="report-type" className="mb-1.5 block text-xs font-medium text-slate">
            What are you sharing?
          </label>
          <div className="flex gap-2">
            {[
              { key: "text", label: "Text" },
              { key: "link", label: "Link" },
              { key: "image", label: "Image" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setType(opt.key)}
                className={`min-h-11 rounded-lg border px-4 text-sm font-medium transition-colors ${
                  type === opt.key ? "border-signal-teal bg-signal-teal/8 text-signal-teal" : "border-slate/25 text-slate hover:border-signal-teal/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {type === "image" && (
            <p className="mt-2 text-xs text-slate">Image upload is coming soon — for now, paste a link or describe what you saw below.</p>
          )}
        </div>

        <div>
          <label htmlFor="report-content" className="mb-1.5 block text-xs font-medium text-slate">
            {type === "link" ? "Link" : "Paste the text, or describe what you saw"}
          </label>
          <textarea
            id="report-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            required
            className="w-full rounded-lg border border-slate/25 bg-paper-raised p-4 text-sm text-ink outline-none focus:border-signal-teal"
          />
        </div>

        <div>
          <label htmlFor="report-category" className="mb-1.5 block text-xs font-medium text-slate">
            Category <span className="text-slate/60">(optional)</span>
          </label>
          <select
            id="report-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-slate/25 bg-paper-raised px-4 text-sm text-ink outline-none focus:border-signal-teal"
          >
            <option value="">Not sure</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="report-email" className="mb-1.5 block text-xs font-medium text-slate">
            Email for follow-up <span className="text-slate/60">(optional)</span>
          </label>
          <input
            id="report-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-slate/25 bg-paper-raised px-4 text-sm text-ink outline-none focus:border-signal-teal"
          />
        </div>

        {status === "error" && <p className="text-sm text-alert-coral">{errorMsg}</p>}

        <Button type="submit" disabled={status === "submitting"} className="w-full">
          {status === "submitting" ? "Sending…" : "Submit report"}
        </Button>
      </form>

      <div className="mt-10 flex items-center gap-3 rounded-lg border border-slate/15 bg-paper-raised px-4 py-3.5">
        <MessageCircle size={18} className="shrink-0 text-slate" />
        <p className="text-xs text-slate">
          {WHATSAPP_REPORT_NUMBER
            ? `You can also forward claims to us on WhatsApp: ${WHATSAPP_REPORT_NUMBER}.`
            : "Forwarding claims directly via WhatsApp is coming soon — use the form above for now."}
        </p>
      </div>
    </div>
  );
}
