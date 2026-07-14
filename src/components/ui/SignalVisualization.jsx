// The hero's ambient live-signal visual — one of the three places the site's signature pulse
// motif appears. This is the only place the one permitted gradient (teal to transparent) is
// used. Pure CSS keyframes (see index.css) rather than a JS-driven animation loop, so the draw-in
// and moving dot always reach their end state reliably. prefers-reduced-motion is handled by the
// global transition/animation-duration override in index.css.
const WAVE_PATH =
  "M0,150 C30,150 45,150 60,150 C75,150 80,70 95,70 C110,70 115,150 130,150 C170,150 190,150 210,150 C225,150 235,40 250,40 C265,40 270,190 285,190 C300,190 310,150 330,150 C400,150 420,150 440,150 C455,150 462,90 478,90 C494,90 500,150 520,150 C560,150 580,150 600,150";

export function SignalVisualization({ className = "" }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 600 240" className="h-auto w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="signal-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#177A6D" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#177A6D" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="600" height="240" fill="url(#signal-fade)" />
        <path
          d={WAVE_PATH}
          pathLength="1000"
          stroke="#177A6D"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          className="animate-draw-signal"
        />
        <circle r="4.5" fill="#D99A2B" className="animate-signal-dot" style={{ offsetPath: `path("${WAVE_PATH}")` }} />
      </svg>
    </div>
  );
}
