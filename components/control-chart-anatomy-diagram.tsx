import { cn } from '@/lib/cn';
import { capability, compute, EXAMPLES, parseVariables, type ChartSeries, type SpcResult } from '@/lib/spc';

// The SPC tutorial's 30 torque readings, run through the Control Chart Builder's own engine, so every
// number here matches the tool and the tutorial text.
const LSL = 23.5;
const USL = 24.5;
const BASELINE = 20;
const parsed = parseVariables(EXAMPLES.imr);
const input = { type: 'imr' as const, groups: parsed.groups, decimals: parsed.decimals };
const R = compute(input, BASELINE, [1, 2, 3, 4]) as SpcResult;
const ALL = compute(input, null, [1, 2, 3, 4]) as SpcResult;
const SIGMA = R.sigmaWithin!;
const post = R.main.points.slice(BASELINE).map((p) => p.value);
const POST_MEAN = post.reduce((a, b) => a + b, 0) / post.length;
const CAP_BEFORE = capability(R.main.center, SIGMA, LSL, USL)!;
const CAP_AFTER = capability(POST_MEAN, SIGMA, LSL, USL)!;

const signals = R.main.points.map((p, i) => ({ ...p, i })).filter((p) => p.rules.length > 0);
const falseAlarms = ALL.main.points.map((p, i) => ({ ...p, i })).filter((p) => p.rules.length > 0);
const first = signals[0];

const f2 = (n: number) => n.toFixed(2);
const f3 = (n: number) => n.toFixed(3);

function Badge({ n, className }: { n: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white',
        className,
      )}
    >
      {n}
    </span>
  );
}

const Y_MIN = 23.6;
const Y_MAX = 24.55;

function IChart({
  s,
  shadeBaseline,
  compact,
  className,
}: {
  s: ChartSeries;
  shadeBaseline?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const W = compact ? 300 : 620;
  const H = compact ? (shadeBaseline ? 175 : 150) : 230;
  const PAD = { l: compact ? 30 : 38, r: compact ? 26 : 34, t: compact ? (shadeBaseline ? 26 : 10) : 18, b: compact ? 16 : 22 };
  const ruleLabels = !compact || shadeBaseline;
  const n = s.points.length;
  const x = (i: number) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + ((Y_MAX - v) / (Y_MAX - Y_MIN)) * (H - PAD.t - PAD.b);
  const sigma = (s.ucl - s.center) / 3;
  const line = s.points.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const font = compact ? 'text-[8px]' : 'text-[10px]';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("mt-2 w-full", className)} role="img" aria-label="Individuals control chart of torque readings">
      {/* Zones: within 1 sigma, 1 to 2 sigma, 2 to 3 sigma */}
      <rect x={PAD.l} width={W - PAD.l - PAD.r} y={y(s.center + sigma)} height={y(s.center - sigma) - y(s.center + sigma)} className="fill-emerald-500/10" />
      {[1, -1].map((side) => (
        <g key={side}>
          <rect
            x={PAD.l}
            width={W - PAD.l - PAD.r}
            y={Math.min(y(s.center + side * sigma), y(s.center + side * 2 * sigma))}
            height={Math.abs(y(s.center + side * 2 * sigma) - y(s.center + side * sigma))}
            className="fill-amber-500/10"
          />
          <rect
            x={PAD.l}
            width={W - PAD.l - PAD.r}
            y={Math.min(y(s.center + side * 2 * sigma), y(s.center + side * 3 * sigma))}
            height={Math.abs(y(s.center + side * 3 * sigma) - y(s.center + side * 2 * sigma))}
            className="fill-red-500/10"
          />
        </g>
      ))}
      {shadeBaseline && (
        <g>
          <line x1={(x(BASELINE - 1) + x(BASELINE)) / 2} x2={(x(BASELINE - 1) + x(BASELINE)) / 2} y1={PAD.t - 6} y2={H - PAD.b} className="stroke-fd-muted-foreground" strokeDasharray="2 3" />
          <text x={(PAD.l + x(BASELINE - 1)) / 2} y={compact ? 9 : PAD.t - 7} textAnchor="middle" className={cn('fill-fd-muted-foreground', font)}>
            {compact ? `Baseline S01–S${BASELINE}` : `Baseline: limits set from S01–S${BASELINE}`}
          </text>
          <text x={(x(BASELINE) + W - PAD.r) / 2} y={compact ? 9 : PAD.t - 7} textAnchor="middle" className={cn('fill-fd-muted-foreground', font)}>
            Monitoring
          </text>
        </g>
      )}
      {/* Center line and limits */}
      <line x1={PAD.l} x2={W - PAD.r} y1={y(s.center)} y2={y(s.center)} className="stroke-sky-600 dark:stroke-sky-400" strokeWidth={1.25} />
      {[s.ucl, s.lcl].map((v) => (
        <line key={v} x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="stroke-red-500" strokeDasharray="5 3" strokeWidth={1.25} />
      ))}
      {[
        { v: s.ucl, t: 'UCL' },
        { v: s.center, t: 'CL' },
        { v: s.lcl, t: 'LCL' },
      ].map((l) => (
        <text key={l.t} x={W - PAD.r + 3} y={y(l.v) + 3} className={cn(l.t === 'CL' ? 'fill-sky-600 dark:fill-sky-400' : 'fill-red-500', font, 'font-semibold')}>
          {l.t}
        </text>
      ))}
      {[l(s.lcl), l(s.center), l(s.ucl)].map((v) => (
        <text key={v.v} x={PAD.l - 3} y={y(v.v) + 3} textAnchor="end" className={cn('fill-fd-muted-foreground', font)}>
          {v.t}
        </text>
      ))}
      {/* Data */}
      <polyline points={line} fill="none" strokeWidth={1.25} className="stroke-fd-foreground/60" />
      {s.points.map((p, i) => {
        const hit = p.rules.length > 0;
        return (
          <g key={p.label}>
            <circle cx={x(i)} cy={y(p.value)} r={hit ? (compact ? 3 : 4) : compact ? 1.75 : 2.5} className={hit ? 'fill-red-500' : 'fill-fd-foreground/70'} />
            {hit && ruleLabels && (
              <text x={x(i)} y={y(p.value) + (p.value > s.center ? -8 : 14)} textAnchor="middle" className="fill-red-600 text-[9px] font-semibold dark:fill-red-400">
                {p.rules.join(',')}
              </text>
            )}
          </g>
        );
      })}
      {[0, 9, 19, 29].map((i) => (
        <text key={i} x={x(i)} y={H - PAD.b + (compact ? 10 : 14)} textAnchor="middle" className={cn('fill-fd-muted-foreground', font)}>
          {s.points[i].label}
        </text>
      ))}
    </svg>
  );
}

function l(v: number) {
  return { v, t: f2(v) };
}

// Spec window vs the process's ±3 sigma spread, before and after the shift.
function CapabilityBars() {
  const LO = 23.4;
  const HI = 24.6;
  const pct = (v: number) => `${((v - LO) / (HI - LO)) * 100}%`;
  const rows = [
    { label: 'S01–S20', mean: R.main.center, cap: CAP_BEFORE, tone: 'bg-emerald-500/60' },
    { label: 'S21–S30', mean: POST_MEAN, cap: CAP_AFTER, tone: 'bg-red-500/60' },
  ];
  return (
    <div className="mt-3 space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-[11px]">
            <span className="text-fd-muted-foreground">
              {r.label}, mean {f3(r.mean)}
            </span>
            <span className="font-mono font-semibold">Cpk {f2(r.cap.cpk)}</span>
          </div>
          <div className="relative mt-1 h-5 rounded-sm bg-fd-border/40">
            <div className="absolute inset-y-0 border-x-2 border-violet-500 bg-violet-500/10" style={{ left: pct(LSL), right: `calc(100% - ${pct(USL)})` }} />
            <div className={cn('absolute inset-y-1 rounded-sm', r.tone)} style={{ left: pct(r.mean - 3 * SIGMA), width: `${((6 * SIGMA) / (HI - LO)) * 100}%` }} />
            <div className="absolute inset-y-0 w-0.5 bg-fd-foreground" style={{ left: pct(r.mean) }} />
          </div>
        </div>
      ))}
      <div className="relative h-4 whitespace-nowrap text-[10px] leading-none text-violet-600 dark:text-violet-400">
        <span className="absolute -translate-x-1/2" style={{ left: pct(LSL) }}>
          LSL {LSL}
        </span>
        <span className="absolute -translate-x-1/2" style={{ left: pct(USL) }}>
          USL {USL}
        </span>
      </div>
    </div>
  );
}

export function ControlChartAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">Anatomy of a control chart</p>
      <p className="mb-4 text-xs text-fd-muted-foreground">
        The tutorial&apos;s {R.main.points.length} torque readings in N·m, spec {LSL}–{USL}, limits from the first {BASELINE}.
      </p>

      <div className="rounded-lg border border-sky-500/40 p-3">
        <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
          <Badge n="1" className="bg-sky-500" />
          Individuals chart: center line, ±3σ limits, and the 1σ / 2σ / 3σ zones
        </p>
        <IChart s={R.main} shadeBaseline className="hidden sm:block" />
        <IChart s={R.main} shadeBaseline compact className="sm:hidden" />
        <p className="mt-1 text-[11px] leading-snug text-fd-muted-foreground">
          <span className="text-emerald-600 dark:text-emerald-400">Green</span> within 1σ,{' '}
          <span className="text-amber-600 dark:text-amber-400">amber</span> 1–2σ,{' '}
          <span className="text-red-600 dark:text-red-400">red</span> 2–3σ. Red dots are signals, labeled with the
          Western Electric rules they complete.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="2" className="bg-amber-500" />
            Same data, limits from all {ALL.main.points.length} points
          </p>
          <IChart s={ALL.main} compact />
          <p className="mt-1 text-[11px] leading-snug text-fd-muted-foreground">
            UCL widens from {f3(R.main.ucl)} to {f3(ALL.main.ucl)}. The shift no longer crosses a limit, and the only
            flags left ({falseAlarms.map((p) => p.label).join(', ')}) fall in the stable stretch.
          </p>
        </div>

        <div className="rounded-lg border border-violet-500/40 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="3" className="bg-violet-500" />
            Capability: ±3σ spread against the spec
          </p>
          <CapabilityBars />
          <p className="mt-2 text-[11px] leading-snug text-fd-muted-foreground">
            Same σ ({f3(SIGMA)}) both times. Only the mean moved, and Cpk is set by the nearer spec limit.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Limits from the baseline</span> — center{' '}
            {f3(R.main.center)}, average moving range {f3(R.range!.center)}, σ = MR̄ / 1.128 = {f3(SIGMA)}. The first
            reading after the baseline, {first.label} at {first.value}, is past the UCL of {f3(R.main.ucl)} and
            completes rules {first.rules.join(', ')} at once; {signals.length} of the {R.main.points.length - BASELINE}{' '}
            monitoring points end up flagged.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Limits from everything</span> — the shifted
            readings inflate both the center line and σ, so the chart absorbs the very change it should flag, and
            readings that were fine now look low.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">Cpk</span> — {f2(CAP_BEFORE.cpk)} on the
            baseline, comfortably capable. If the process stays at its new level, it drops to {f2(CAP_AFTER.cpk)}, below
            the usual 1.33 minimum, while every reading is still inside the spec.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Result</span> — the chart flags the change at {first.label},
            long before a single part is out of spec. That head start is the whole point of SPC.
          </p>
        </div>
      </div>
    </div>
  );
}
