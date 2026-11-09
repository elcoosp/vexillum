/**
 * Hand-rolled SVG charts (no chart dependency): a 30-day bar chart and a
 * compact sparkline. Deterministic input, pure presentational output.
 */
import { formatCount } from "@/lib/plans";

export function UsageBars({
  days,
  height = 140,
  ariaLabel = "Requests over the last 30 days",
}: {
  days: Array<{ date: string; requests: number }>;
  height?: number;
  ariaLabel?: string;
}) {
  const width = 640;
  const pad = { top: 8, right: 4, bottom: 18, left: 4 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...days.map((d) => d.requests), 1);
  const bw = innerW / days.length;
  const gap = Math.min(3, bw * 0.25);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className="w-full"
      preserveAspectRatio="none"
    >
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={pad.left}
          x2={width - pad.right}
          y1={pad.top + innerH * f}
          y2={pad.top + innerH * f}
          className="stroke-border"
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      ))}
      {days.map((d, i) => {
        const h = (d.requests / max) * innerH;
        return (
          <rect
            key={d.date}
            x={pad.left + i * bw + gap / 2}
            y={pad.top + innerH - h}
            width={Math.max(1, bw - gap)}
            height={Math.max(1, h)}
            rx={1.5}
            className={i === days.length - 1 ? "fill-accent" : "fill-accent/55"}
          >
            <title>{`${d.date}: ${d.requests.toLocaleString()} requests`}</title>
          </rect>
        );
      })}
      {[0, Math.floor(days.length / 2), days.length - 1].map((i) => (
        <text
          key={i}
          x={pad.left + i * bw + bw / 2}
          y={height - 4}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}
        >
          {days[i].date.slice(5)}
        </text>
      ))}
    </svg>
  );
}

export function Sparkline({
  points,
  width = 120,
  height = 32,
  ariaLabel = "recent trend",
}: {
  points: number[];
  width?: number;
  height?: number;
  ariaLabel?: string;
}) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(height - 2 - ((p - min) / span) * (height - 4)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} className="h-8 w-full">
      <path d={d} fill="none" className="stroke-accent" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

export function ChartLegend({ total, peak }: { total: number; peak: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
      <span>
        30-day total <strong className="font-mono text-foreground">{formatCount(total)}</strong>
      </span>
      <span>
        peak day <strong className="font-mono text-foreground">{formatCount(peak)}</strong>
      </span>
    </div>
  );
}
