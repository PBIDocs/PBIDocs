import { cn } from '@/lib/cn';
import type { ParetoRow } from '@/lib/pareto';

// A Pareto chart as plain SVG: bars by rank, the cumulative % line on a fixed
// 0–100% right axis, and the threshold line. Shared by the Pareto Chart
// Builder and the tutorial's anatomy diagram.

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

const BADGE_FILL: Record<string, string> = {
  '1': 'fill-sky-500',
  '2': 'fill-amber-500',
  '3': 'fill-red-500',
  '4': 'fill-slate-500',
  '5': 'fill-violet-500',
};

function SvgBadge({ x, y, n }: { x: number; y: number; n: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={8} className={BADGE_FILL[n]} />
      <text x={x} y={y + 3.5} textAnchor="middle" className="fill-white text-[10px] font-bold">
        {n}
      </text>
    </g>
  );
}

export function ParetoChart({
  rows,
  threshold,
  format = (v) => String(v),
  compact,
  highlight,
  annotate,
  className,
  label = 'Pareto chart',
}: {
  rows: ParetoRow[];
  threshold: number;
  format?: (v: number) => string;
  compact?: boolean;
  highlight?: string;
  annotate?: boolean;
  className?: string;
  label?: string;
}) {
  const n = Math.max(rows.length, 1);
  const W = compact ? 320 : 640;
  const H = compact ? 190 : 320;
  const PAD = { l: compact ? 30 : 44, r: compact ? 30 : 40, t: compact ? 12 : 20, b: compact ? 18 : 96 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const band = plotW / n;
  const barW = band * 0.68;
  const max = niceMax(Math.max(0, ...rows.map((r) => r.value)));
  const cx = (i: number) => PAD.l + band * (i + 0.5);
  const yL = (v: number) => PAD.t + plotH - (v / max) * plotH;
  const yR = (share: number) => PAD.t + plotH - share * plotH;
  const font = compact ? 'text-[8px]' : 'text-[10px]';
  const tY = yR(threshold / 100);
  const line = rows.map((r, i) => `${cx(i).toFixed(1)},${yR(r.cumShare).toFixed(1)}`).join(' ');
  const showCumLabels = !compact && rows.length <= 12;
  const lastVital = rows.reduce((a, r, i) => (r.vital ? i : a), -1);
  const otherIdx = rows.findIndex((r) => r.isOther);
  const tiedIdx = rows.findIndex((r) => r.tied);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('w-full', className)} role="img" aria-label={label}>
      {/* Grid and axes */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={PAD.l} x2={W - PAD.r} y1={yR(f)} y2={yR(f)} className="stroke-fd-border" strokeWidth={f === 0 ? 1 : 0.5} />
      ))}
      {[0, 0.5, 1].map((f) => (
        <text key={f} x={PAD.l - 4} y={yL(max * f) + 3} textAnchor="end" className={cn('fill-fd-muted-foreground', font)}>
          {format(max * f)}
        </text>
      ))}
      {[0, 0.5, 1].map((f) => (
        <text key={f} x={W - PAD.r + 4} y={yR(f) + 3} className={cn('fill-amber-600 dark:fill-amber-400', font)}>
          {f * 100}%
        </text>
      ))}

      {/* Bars */}
      {rows.map((r, i) => (
        <g key={r.cause}>
          <rect
            x={cx(i) - barW / 2}
            width={barW}
            y={yL(r.value)}
            height={Math.max(0, yL(0) - yL(r.value))}
            rx={1.5}
            className={cn(r.vital ? 'fill-sky-600/80 dark:fill-sky-500/80' : 'fill-slate-400/50', highlight === r.cause && 'stroke-violet-500')}
            strokeWidth={highlight === r.cause ? 2.5 : 0}
          />
          {/* Value at the foot of the bar when it fits, clear of the cumulative line's labels */}
          {!compact && (
            <text
              x={cx(i)}
              y={(r.vital && yL(0) - yL(r.value) > 18) ? yL(0) - 6 : yL(r.value) - 4}
              textAnchor="middle"
              className={cn('text-[9px] font-semibold', (r.vital && yL(0) - yL(r.value) > 18) ? 'fill-white' : 'fill-fd-foreground/80')}
            >
              {format(r.value)}
            </text>
          )}
          {compact ? (
            <text x={cx(i)} y={H - PAD.b + 11} textAnchor="middle" className={cn('fill-fd-muted-foreground', font, highlight === r.cause && 'fill-violet-600 font-bold dark:fill-violet-400')}>
              {r.rank}
            </text>
          ) : (
            <text
              x={cx(i)}
              y={H - PAD.b + 12}
              textAnchor="end"
              transform={`rotate(-35 ${cx(i)} ${H - PAD.b + 12})`}
              className={cn('fill-fd-muted-foreground', font, highlight === r.cause && 'fill-violet-600 font-semibold dark:fill-violet-400')}
            >
              {r.cause.length > 22 ? `${r.cause.slice(0, 21)}…` : r.cause}
            </text>
          )}
        </g>
      ))}

      {/* Threshold */}
      <line x1={PAD.l} x2={W - PAD.r} y1={tY} y2={tY} className="stroke-red-500" strokeDasharray="5 3" strokeWidth={1.25} />
      {lastVital >= 0 && (
        <line
          x1={cx(lastVital) + band / 2}
          x2={cx(lastVital) + band / 2}
          y1={PAD.t}
          y2={yL(0)}
          className="stroke-red-500/60"
          strokeDasharray="2 3"
        />
      )}

      {/* Cumulative line */}
      <polyline points={line} fill="none" strokeWidth={compact ? 1.5 : 2} className="stroke-amber-500" />
      {rows.map((r, i) => (
        <g key={r.cause}>
          <circle cx={cx(i)} cy={yR(r.cumShare)} r={compact ? 2 : 3} className="fill-amber-500" />
          {showCumLabels && (
            <text x={cx(i)} y={yR(r.cumShare) - 7} textAnchor="middle" className="fill-amber-700 text-[9px] font-semibold dark:fill-amber-300">
              {(r.cumShare * 100).toFixed(1)}%
            </text>
          )}
        </g>
      ))}

      {annotate && rows.length > 2 && (
        <g>
          <SvgBadge x={cx(0) - barW / 2 - 2} y={yL(rows[0].value) + 12} n="1" />
          <SvgBadge x={cx(1) + 14} y={yR(rows[1].cumShare) + 14} n="2" />
          {lastVital >= 0 && <SvgBadge x={cx(lastVital) + band / 2} y={tY + 14} n="3" />}
          {otherIdx >= 0 && <SvgBadge x={cx(otherIdx)} y={yL(rows[otherIdx].value) - (compact ? 14 : 24)} n="4" />}
          {tiedIdx >= 0 && <SvgBadge x={cx(tiedIdx) + band / 2} y={yL(rows[tiedIdx].value) - (compact ? 14 : 24)} n="5" />}
        </g>
      )}
    </svg>
  );
}
