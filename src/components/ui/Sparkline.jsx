// Compact data-driven sparkline used on claim cards / detail view — one of the three places the
// site's signature pulse motif appears (see SignalVisualization for the hero, PulseSkeleton for
// loading states).
export function Sparkline({ series = [], width = 96, height = 28, className = "" }) {
  if (series.length < 2) return <div className={className} style={{ width, height }} aria-hidden="true" />;

  const counts = series.map((p) => p.count);
  const max = Math.max(...counts, 1);
  const min = Math.min(...counts, 0);
  const range = max - min || 1;
  const stepX = width / (series.length - 1);

  const points = series
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p.count - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const last = series[series.length - 1];
  const lastX = (series.length - 1) * stepX;
  const lastY = height - ((last.count - min) / range) * (height - 4) - 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Report rate over the last few hours"
    >
      <polyline points={points} fill="none" stroke="#177A6D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2" fill="#177A6D" />
    </svg>
  );
}
