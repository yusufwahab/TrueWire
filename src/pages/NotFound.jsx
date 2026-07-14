import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center sm:px-6">
      <Reveal>
        <svg viewBox="0 0 400 80" className="mb-8 h-16 w-full max-w-sm" aria-hidden="true">
          <path
            d="M0,40 C20,40 30,20 45,20 C60,20 65,60 80,60 C95,60 100,30 115,30 C130,30 138,45 150,45 L400,45"
            stroke="#4A5A57"
            strokeWidth="2"
            strokeDasharray="1 9"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-slate">Signal lost</p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">That page isn't in our index.</h1>
        <p className="mt-3 text-sm text-slate">It may have moved, or never existed. Everything else is where you left it.</p>
        <div className="mt-8">
          <Button to="/">Back to Home</Button>
        </div>
      </Reveal>
    </div>
  );
}
