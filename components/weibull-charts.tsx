import { cn } from '@/lib/cn';
import { bLife, reliability, type WeibullFit } from '@/lib/weibull';

// Weibull probability plot and reliability curve as plain SVG. Shared by the
// Weibull Analysis tool and the tutorial's anatomy diagram.

const fmtH = (v: number) => (v >= 10000 ? `${+(v / 1000).toFixed(0)}k` : v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(Math.round(v)));
const wy = (F: number) => Math.log(-Math.log(1 - F));
const SERIES = [1, 2, 5];
// Round every SVG coordinate: Math.log can differ in the last digit between the
// server and the browser, which would otherwise cause a hydration mismatch.
const r2 = (v: number) => Math.round(v * 100) / 100;

function niceLogBounds(lo: number, hi: number): [number, number] {
  const below = (v: number) => {
    const p = 10 ** Math.floor(Math.log10(v));
    for (const m of [5, 2, 1]) if (m * p <= v) return m * p;
    return p;
  };
  const above = (v: number) => {
    const p = 10 ** Math.floor(Math.log10(v));
    for (const m of [1, 2, 5, 10]) if (m * p >= v) return m * p;
    return 10 * p;
  };
  return [below(lo), above(hi)];
}

function SvgBadge({ x, y, n, className }: { x: number; y: number; n: string; className: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={8} className={className} />
      <text x={x} y={y + 3.5} textAnchor="middle" className="fill-white text-[10px] font-bold">
        {n}
      </text>
    </g>
  );
}

export function ProbabilityPlot({
  fit,
  bPercent = 10,
  compact,
  annotate,
  className,
}: {
  fit: WeibullFit;
  bPercent?: number;
  compact?: boolean;
  annotate?: boolean;
  className?: string;
}) {
  const W = compact ? 320 : 640;
  const H = compact ? 220 : 330;
  const PAD = { l: compact ? 34 : 44, r: compact ? 10 : 16, t: 12, b: compact ? 30 : 36 };
  const hours = fit.ranked.map((u) => u.hours);
  const bl = bLife(fit.beta, fit.eta, bPercent / 100);
  const [x0, x1] = niceLogBounds(Math.min(...hours, bl) * 0.9, Math.max(...hours, fit.eta) * 1.1);
  const F_TICKS = compact ? [0.01, 0.1, 0.632, 0.99] : [0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.632, 0.9, 0.99];
  const y0 = wy(0.01);
  const y1 = wy(0.99);
  const sx = (h: number) => r2(PAD.l + ((Math.log(h) - Math.log(x0)) / (Math.log(x1) - Math.log(x0))) * (W - PAD.l - PAD.r));
  const sy = (y: number) => r2(PAD.t + ((y1 - y) / (y1 - y0)) * (H - PAD.t - PAD.b));
  const lineY = (h: number) => fit.beta * (Math.log(h) - Math.log(fit.eta));
  const xTicks: number[] = [];
  for (let p = 10 ** Math.floor(Math.log10(x0)); p <= x1; p *= 10) for (const m of SERIES) if (m * p >= x0 && m * p <= x1) xTicks.push(m * p);
  const font = compact ? 'text-[8px]' : 'text-[10px]';
  const clampY = (y: number) => Math.max(y0, Math.min(y1, y));
  const lineStart = Math.max(x0, fit.eta * Math.exp(y0 / fit.beta));
  const lineEnd = Math.min(x1, fit.eta * Math.exp(y1 / fit.beta));
  const pts = fit.ranked.filter((u) => u.y !== null);
  const susp = fit.ranked.filter((u) => u.status === 'S');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('w-full', className)} role="img" aria-label="Weibull probability plot">
      {xTicks.map((h) => (
        <g key={h}>
          <line x1={sx(h)} x2={sx(h)} y1={PAD.t} y2={H - PAD.b} className="stroke-fd-border" strokeWidth={0.5} />
          <text x={sx(h)} y={H - PAD.b + 12} textAnchor="middle" className={cn('fill-fd-muted-foreground', font)}>
            {fmtH(h)}
          </text>
        </g>
      ))}
      <text x={(PAD.l + W - PAD.r) / 2} y={H - 3} textAnchor="middle" className={cn('fill-fd-muted-foreground', font)}>
        Operating hours (log scale)
      </text>
      {F_TICKS.map((F) => (
        <g key={F}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={sy(wy(F))}
            y2={sy(wy(F))}
            className={F === 0.632 ? 'stroke-violet-500/50' : 'stroke-fd-border'}
            strokeWidth={0.5}
          />
          <text x={PAD.l - 4} y={sy(wy(F)) + 3} textAnchor="end" className={cn('fill-fd-muted-foreground', font)}>
            {F === 0.632 ? '63.2%' : `${Math.round(F * 100)}%`}
          </text>
        </g>
      ))}

      {/* B-life and eta guides */}
      <line x1={PAD.l} x2={sx(bl)} y1={sy(wy(bPercent / 100))} y2={sy(wy(bPercent / 100))} className="stroke-red-500" strokeDasharray="4 3" />
      <line x1={sx(bl)} x2={sx(bl)} y1={sy(wy(bPercent / 100))} y2={H - PAD.b} className="stroke-red-500" strokeDasharray="4 3" />
      <line x1={PAD.l} x2={sx(fit.eta)} y1={sy(0)} y2={sy(0)} className="stroke-violet-500" strokeDasharray="4 3" />
      <line x1={sx(fit.eta)} x2={sx(fit.eta)} y1={sy(0)} y2={H - PAD.b} className="stroke-violet-500" strokeDasharray="4 3" />
      {!compact && (
        <>
          <text x={sx(bl) - 5} y={sy(wy(bPercent / 100)) - 5} textAnchor="end" className="fill-red-600 text-[10px] font-semibold dark:fill-red-400">
            B{bPercent} {Math.round(bl).toLocaleString('en-US')} h
          </text>
          <text x={sx(fit.eta) + 6} y={sy(0) + 14} className="fill-violet-600 text-[10px] font-semibold dark:fill-violet-400">
            η {Math.round(fit.eta).toLocaleString('en-US')} h
          </text>
        </>
      )}

      {/* Fitted line */}
      <line
        x1={sx(lineStart)}
        x2={sx(lineEnd)}
        y1={sy(clampY(lineY(lineStart)))}
        y2={sy(clampY(lineY(lineEnd)))}
        className="stroke-sky-600 dark:stroke-sky-400"
        strokeWidth={1.75}
      />

      {/* Failures, plotted at their median ranks */}
      {pts.map((u) => (
        <circle key={u.id + u.order} cx={sx(u.hours)} cy={sy(u.y!)} r={compact ? 2.5 : 3.5} className="fill-fd-foreground/80" />
      ))}
      {/* Suspensions: not plotted as points, but they move the failures' ranks */}
      {susp.map((u) => (
        <path
          key={u.id + u.order}
          d={`M ${sx(u.hours)} ${H - PAD.b - 1} l -3 -6 l 6 0 z`}
          className="fill-none stroke-amber-500"
          strokeWidth={1.25}
        />
      ))}

      {annotate && (
        <g>
          <SvgBadge x={sx(pts[1].hours) + 8} y={sy(pts[1].y!) + 15} n="1" className="fill-slate-500" />
          {susp.length > 0 && <SvgBadge x={sx(susp[0].hours) - 14} y={H - PAD.b - 16} n="2" className="fill-amber-500" />}
          <SvgBadge x={sx(lineEnd) - 14} y={sy(clampY(lineY(lineEnd))) + 12} n="3" className="fill-sky-500" />
          <SvgBadge x={PAD.l + 12} y={sy(wy(bPercent / 100)) - 11} n="4" className="fill-red-500" />
          <SvgBadge x={PAD.l + 12} y={sy(0) - 11} n="5" className="fill-violet-500" />
        </g>
      )}
    </svg>
  );
}

export function ReliabilityCurve({
  fit,
  mtbf,
  interval,
  compact,
  className,
}: {
  fit: WeibullFit;
  mtbf: number | null;
  interval: number;
  compact?: boolean;
  className?: string;
}) {
  const W = compact ? 320 : 640;
  const H = compact ? 190 : 260;
  const PAD = { l: compact ? 30 : 40, r: compact ? 10 : 16, t: 12, b: compact ? 26 : 32 };
  const tMax = Math.max(interval * 1.25, fit.eta * 1.6);
  const step = 10 ** Math.floor(Math.log10(tMax / 4));
  const tickStep = [1, 2, 5].map((m) => m * step).find((s) => tMax / s <= 6) ?? 10 * step;
  const sx = (t: number) => r2(PAD.l + (t / tMax) * (W - PAD.l - PAD.r));
  const sy = (r: number) => r2(PAD.t + (1 - r) * (H - PAD.t - PAD.b));
  const N = 80;
  const path = (f: (t: number) => number) =>
    Array.from({ length: N + 1 }, (_, i) => (i / N) * tMax)
      .map((t, i) => `${i ? 'L' : 'M'} ${sx(t).toFixed(1)} ${sy(f(t)).toFixed(1)}`)
      .join(' ');
  const rW = reliability(fit.beta, fit.eta, interval);
  const rE = mtbf ? Math.exp(-interval / mtbf) : null;
  const font = compact ? 'text-[8px]' : 'text-[10px]';
  const ticks: number[] = [];
  for (let t = 0; t <= tMax; t += tickStep) ticks.push(t);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('w-full', className)} role="img" aria-label="Reliability over operating hours">
      {[0, 0.25, 0.5, 0.75, 1].map((r) => (
        <g key={r}>
          <line x1={PAD.l} x2={W - PAD.r} y1={sy(r)} y2={sy(r)} className="stroke-fd-border" strokeWidth={r === 0 ? 1 : 0.5} />
          <text x={PAD.l - 4} y={sy(r) + 3} textAnchor="end" className={cn('fill-fd-muted-foreground', font)}>
            {r * 100}%
          </text>
        </g>
      ))}
      {ticks.map((t) => (
        <text key={t} x={sx(t)} y={H - PAD.b + 12} textAnchor="middle" className={cn('fill-fd-muted-foreground', font)}>
          {fmtH(t)}
        </text>
      ))}
      <text x={(PAD.l + W - PAD.r) / 2} y={H - 3} textAnchor="middle" className={cn('fill-fd-muted-foreground', font)}>
        Operating hours
      </text>

      {mtbf && (
        <path d={path((t) => Math.exp(-t / mtbf))} fill="none" strokeWidth={1.5} strokeDasharray="5 4" className="stroke-slate-400" />
      )}
      <path d={path((t) => reliability(fit.beta, fit.eta, t))} fill="none" strokeWidth={2} className="stroke-sky-600 dark:stroke-sky-400" />

      <line x1={sx(interval)} x2={sx(interval)} y1={PAD.t} y2={H - PAD.b} className="stroke-red-500" strokeDasharray="4 3" />
      <circle cx={sx(interval)} cy={sy(rW)} r={compact ? 3 : 4} className="fill-sky-600 dark:fill-sky-400" />
      {rE !== null && <circle cx={sx(interval)} cy={sy(rE)} r={compact ? 3 : 4} className="fill-slate-400" />}
      {!compact && (
        <>
          <text x={sx(interval) + 6} y={sy(rW) + 4} className="fill-sky-700 text-[10px] font-semibold dark:fill-sky-300">
            Weibull {(rW * 100).toFixed(0)}%
          </text>
          {rE !== null && (
            <text x={sx(interval) + 6} y={sy(rE) + 4} className="fill-slate-500 text-[10px] font-semibold dark:fill-slate-400">
              Exponential {(rE * 100).toFixed(0)}%
            </text>
          )}
          <text x={sx(interval) - 4} y={PAD.t + 10} textAnchor="end" className="fill-red-600 text-[10px] font-semibold dark:fill-red-400">
            {interval.toLocaleString('en-US')} h
          </text>
        </>
      )}
    </svg>
  );
}
