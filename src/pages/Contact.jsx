import { useState } from "react";
import { Mail } from "lucide-react";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | done | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await api.contact(form);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong sending your message.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Contact</h1>
        <p className="mt-3 text-sm text-slate">Questions, press inquiries, or partnership requests — reach us directly.</p>
      </Reveal>

      {status === "done" ? (
        <div className="mt-8 rounded-xl border border-signal-teal/30 bg-signal-teal/8 p-6">
          <p className="text-sm text-ink">Thanks — your message has been sent. We'll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium text-slate">
              Name
            </label>
            <input
              id="contact-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="min-h-11 w-full rounded-lg border border-slate/25 bg-paper-raised px-4 text-sm text-ink outline-none focus:border-signal-teal"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1.5 block text-xs font-medium text-slate">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="min-h-11 w-full rounded-lg border border-slate/25 bg-paper-raised px-4 text-sm text-ink outline-none focus:border-signal-teal"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium text-slate">
              Message
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border border-slate/25 bg-paper-raised p-4 text-sm text-ink outline-none focus:border-signal-teal"
            />
          </div>

          {status === "error" && <p className="text-sm text-alert-coral">{errorMsg}</p>}

          <Button type="submit" disabled={status === "submitting"} className="w-full">
            {status === "submitting" ? "Sending…" : "Send message"}
          </Button>
        </form>
      )}

      <div className="mt-10 flex items-center gap-3 rounded-lg border border-slate/15 bg-paper-raised px-4 py-3.5">
        <Mail size={18} className="shrink-0 text-slate" />
        <a href="mailto:hello@truewire.ng" className="text-sm text-slate hover:text-signal-teal">
          hello@truewire.ng
        </a>
      </div>
    </div>
  );
}
