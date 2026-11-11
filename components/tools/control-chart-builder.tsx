'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, CircleCheck, Copy, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import {
  EXAMPLES,
  EXAMPLE_SETTINGS,
  RULES,
  capability,
  compute,
  generateDax,
  parseAttributes,
  parseVariables,
  type ChartPoint,
  type ChartSeries,
  type ChartType,
  type RuleId,
  type SpcInput,
  type SpcResult,
} from '@/lib/spc';

const inputClass =
  'w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

const TYPES: { id: ChartType; label: string; sub: string; hint: string }[] = [
  {
    id: 'imr',
    label: 'Individuals',
    sub: 'I-MR chart',
    hint: 'One measurement per line, in time order: a sample label, then the value. Commas or tabs, so a copy from Excel works.',
  },
  {
    id: 'xbar-r',
    label: 'Subgroups',
    sub: 'X̄-R chart',
    hint: 'One subgroup per line (label, then its 2–10 values), or one measurement per line with the subgroup label repeated, the way a Power BI table holds it.',
  },
  {
    id: 'p',
    label: 'Defectives',
    sub: 'p chart',
    hint: 'One sample per line, in time order: a label, the number defective, and the number inspected. Sample sizes can differ.',
  },
];

const ALL_RULES: RuleId[] = [1, 2, 3, 4];
const ruleText = (r: RuleId) => RULES.find((x) => x.id === r)!.text;

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function niceTicks(lo: number, hi: number, count: number) {
  const raw = (hi - lo) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) ticks.push(Number(v.toPrecision(12)));
  return { ticks, decimals: Math.max(0, -Math.floor(Math.log10(step) + 1e-9)) };
}

interface ChartProps {
  s: ChartSeries;
  slots: number; // x positions, shared with the chart above so points line up
  offset?: number; // the moving range chart starts at the second sample
  baseline: number;
  fmt: (v: number) => string;
  percent?: boolean;
  zones?: boolean;
  height?: number;
  title: string;
}

function ControlChart({ s, slots, offset = 0, baseline, fmt, percent, zones, height = 280, title }: ChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pts = s.points;
  const sideW = Math.max(...[s.ucl, s.center, s.lcl].map((v) => fmt(v).length)) * 6.4 + 34;
  const pad = { top: 24, right: Math.round(sideW), bottom: 28, left: 48 };
  const innerW = Math.max(80, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const step = innerW / slots;
  const x = (i: number) => pad.left + (i + offset + 0.5) * step;

  const all = pts.flatMap((p) => [p.value, p.ucl, p.lcl]);
  let lo = Math.min(...all);
  let hi = Math.max(...all);
  const span = hi - lo || Math.abs(hi) || 1;
  lo -= span * 0.08;
  hi += span * 0.1;
  const { ticks, decimals } = niceTicks(lo, hi, height > 200 ? 5 : 3);
  const tickLabel = (v: number) => (percent ? `${(v * 100).toFixed(Math.max(0, decimals - 2))}%` : v.toFixed(decimals));
  const y = (v: number) => pad.top + (1 - (v - lo) / (hi - lo)) * innerH;

  // Limits as steps, so a p chart's per-sample limits read correctly; constant
  // limits come out as straight lines.
  const stepPath = (f: (p: ChartPoint) => number) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i) - step / 2},${y(f(p))}L${x(i) + step / 2},${y(f(p))}`).join('');
  const valuePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join('');

  const labelLen = Math.max(...pts.map((p) => p.label.length)) * 6.2 + 10;
  const every = Math.max(1, Math.ceil(labelLen / step));
  const last = pts[pts.length - 1];
  const divider = baseline < slots ? pad.left + baseline * step : null;

  // Right-hand labels for the three lines, nudged apart if they'd touch.
  const sideLabels = (() => {
    const items = [
      { key: 'UCL', v: last.ucl },
      { key: 'CL', v: last.center },
      { key: 'LCL', v: last.lcl },
    ].map((l) => ({ ...l, cy: y(l.v) + 3.5 }));
    for (let i = 1; i < items.length; i++) items[i].cy = Math.max(items[i].cy, items[i - 1].cy + 12);
    return items;
  })();

  const hp = hover === null ? null : pts[hover];

  return (
    <div ref={ref} className="relative w-full">
      <svg
        width={width}
        height={height}
        className="block touch-pan-y"
        role="img"
        aria-label={`${title}: ${pts.length} points, center line ${fmt(s.center)}, ${pts.filter((p) => p.rules.length).length} flagged`}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const i = Math.floor((e.clientX - rect.left - pad.left) / step) - offset;
          setHover(i >= 0 && i < pts.length ? i : null);
        }}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={pad.left + innerW} y1={y(t)} y2={y(t)} className="stroke-fd-border/70" strokeWidth={1} />
            <text x={pad.left - 6} y={y(t) + 3.5} textAnchor="end" className="fill-fd-muted-foreground text-[11px]">
              {tickLabel(t)}
            </text>
          </g>
        ))}
        {pts.map((p, i) =>
          (i + offset) % every === 0 ? (
            <text key={i} x={x(i)} y={height - 9} textAnchor="middle" className="fill-fd-muted-foreground text-[11px]">
              {p.label}
            </text>
          ) : null,
        )}
        {divider !== null && (
          <g>
            <line
              x1={divider}
              x2={divider}
              y1={pad.top - 14}
              y2={pad.top + innerH}
              className="stroke-fd-muted-foreground/50"
              strokeDasharray="2 3"
            />
            <text x={divider - 6} y={pad.top - 8} textAnchor="end" className="fill-fd-muted-foreground text-[11px]">
              Baseline
            </text>
            <text x={divider + 6} y={pad.top - 8} className="fill-fd-muted-foreground text-[11px]">
              Monitoring
            </text>
          </g>
        )}
        {zones &&
          [-2, -1, 1, 2].map((k) => (
            <path
              key={k}
              d={stepPath((p) => p.center + k * p.sigma)}
              className="fill-none stroke-fd-muted-foreground/45"
              strokeWidth={1}
              strokeDasharray="1 3"
            />
          ))}
        <path d={stepPath((p) => p.ucl)} className="fill-none stroke-fd-foreground/70" strokeWidth={1.25} strokeDasharray="5 3" />
        <path d={stepPath((p) => p.lcl)} className="fill-none stroke-fd-foreground/70" strokeWidth={1.25} strokeDasharray="5 3" />
        <path d={stepPath((p) => p.center)} className="fill-none stroke-fd-muted-foreground" strokeWidth={1} />
        {sideLabels.map((l) => (
          <text key={l.key} x={pad.left + innerW + 6} y={l.cy} className="fill-fd-muted-foreground text-[11px]">
            <tspan className="fill-fd-foreground font-medium">{l.key}</tspan> {fmt(l.v)}
          </text>
        ))}
        <path d={valuePath} className="fill-none stroke-fd-primary" strokeWidth={2} strokeLinejoin="round" />
        {hp && hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={pad.top}
            y2={pad.top + innerH}
            className="stroke-fd-muted-foreground/60"
            pointerEvents="none"
          />
        )}
        {pts.map((p, i) =>
          p.rules.length ? (
            <g key={i}>
              <circle cx={x(i)} cy={y(p.value)} r={5} className="fill-red-500 stroke-fd-background dark:fill-red-400" strokeWidth={2} />
              {step >= 16 && (
                <text x={x(i)} y={y(p.value) - 9} textAnchor="middle" className="fill-fd-foreground text-[10px] font-semibold">
                  {p.rules.join(',')}
                </text>
              )}
            </g>
          ) : (
            <circle
              key={i}
              cx={x(i)}
              cy={y(p.value)}
              r={hover === i ? 4.5 : 3}
              className="fill-fd-primary stroke-fd-background"
              strokeWidth={1.5}
            />
          ),
        )}
      </svg>
      {hp && hover !== null && (
        <div
          className="pointer-events-none absolute z-10 w-56 rounded-md border border-fd-border bg-fd-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{
            left: x(hover) + 12 + 224 > width ? x(hover) - 12 - 224 : x(hover) + 12,
            top: Math.max(0, Math.min(y(hp.value) - 30, height - 90)),
          }}
        >
          <p className="font-medium">{hp.label}</p>
          <p className="text-fd-muted-foreground">
            <span className="font-mono text-fd-foreground">{fmt(hp.value)}</span>
            {hp.n !== undefined && (
              <>
                {' '}
                ({hp.count} of {hp.n})
              </>
            )}
            {' · '}limits {fmt(hp.lcl)} to {fmt(hp.ucl)}
          </p>
          {hp.rules.map((r) => (
            <p key={r} className="text-red-600 dark:text-red-400">
              Rule {r}: {ruleText(r)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function Legend({ zones }: { zones: boolean }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fd-muted-foreground">
      <span className="flex items-center gap-1.5">
        <svg width="18" height="8" aria-hidden>
          <line x1="0" x2="18" y1="4" y2="4" className="stroke-fd-primary" strokeWidth={2} />
          <circle cx="9" cy="4" r="3" className="fill-fd-primary" />
        </svg>
        Measured value
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="18" height="8" aria-hidden>
          <line x1="0" x2="18" y1="4" y2="4" className="stroke-fd-foreground/70" strokeWidth={1.25} strokeDasharray="5 3" />
        </svg>
        Control limits (3σ)
      </span>
      {zones && (
        <span className="flex items-center gap-1.5">
          <svg width="18" height="8" aria-hidden>
            <line x1="0" x2="18" y1="4" y2="4" className="stroke-fd-muted-foreground/60" strokeDasharray="1 3" />
          </svg>
          1σ and 2σ zones
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <svg width="10" height="10" aria-hidden>
          <circle cx="5" cy="5" r="4" className="fill-red-500 dark:fill-red-400" />
        </svg>
        Signal, labeled with the rule number
      </span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex shrink-0 items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-fd-border p-3">
      <span className="text-xs text-fd-muted-foreground">{label}</span>
      <span className="font-mono text-xl font-bold">{value}</span>
      {note && <span className="text-xs text-fd-muted-foreground">{note}</span>}
    </div>
  );
}

const parseOptional = (s: string) => {
  const t = s.trim();
  if (t === '') return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : NaN;
};

export function ControlChartBuilder() {
  const [type, setType] = useState<ChartType>('imr');
  const [texts, setTexts] = useState(EXAMPLES);
  const [settings, setSettings] = useState(EXAMPLE_SETTINGS);
  const [rules, setRules] = useState<RuleId[]>(ALL_RULES);
  const text = useDeferredValue(texts[type]);
  const cfg = settings[type];
  const setCfg = (patch: Partial<typeof cfg>) => setSettings((s) => ({ ...s, [type]: { ...s[type], ...patch } }));

  const warnings: string[] = [];
  const baselineValue = parseOptional(cfg.baseline);
  const baselineOk = baselineValue === null || (Number.isInteger(baselineValue) && baselineValue >= 3);
  if (!baselineOk) warnings.push('The baseline needs a whole number of 3 or more, or leave it blank to use every point.');
  const lsl = type === 'p' ? null : parseOptional(cfg.lsl);
  const usl = type === 'p' ? null : parseOptional(cfg.usl);
  const specOk = !Number.isNaN(lsl) && !Number.isNaN(usl) && (lsl === null || usl === null || usl > lsl);
  if (!specOk) warnings.push('Spec limits need to be numbers, with the upper limit above the lower.');

  const parsed = useMemo(() => {
    if (type === 'p') {
      const { samples, errors } = parseAttributes(text);
      return { input: { type: 'p' as const, samples }, errors };
    }
    const { groups, errors, decimals } = parseVariables(text);
    return { input: { type, groups, decimals } as SpcInput, errors };
  }, [type, text]);

  const result = useMemo(
    () => compute(parsed.input, baselineOk ? baselineValue : null, rules),
    [parsed, baselineOk, baselineValue, rules],
  );
  const r: SpcResult | null = 'error' in result ? null : result;
  const error = 'error' in result ? result.error : null;

  const fmt = (v: number) =>
    r?.type === 'p' ? `${(v * 100).toFixed(2)}%` : v.toFixed(Math.min(6, (r?.decimals ?? 2) + 1));
  const cap =
    r && r.sigmaWithin && specOk ? capability(r.main.center, r.sigmaWithin, lsl as number | null, usl as number | null) : null;

  const flagged = r ? r.main.points.map((p, i) => ({ ...p, i })).filter((p) => p.rules.length > 0) : [];
  const inBaseline = r ? flagged.filter((p) => p.i < r.baseline) : [];
  const rangeFlags = r?.range ? r.range.points.filter((p) => p.rules.length > 0) : [];
  const first = flagged[0];
  if (r && r.baseline < 20) {
    warnings.push(
      `Limits from ${r.baseline} points are provisional. The usual guidance is 20–25, so recalculate them once you have more.`,
    );
  }

  const dax = generateDax({
    type,
    table: cfg.table.trim() || EXAMPLE_SETTINGS[type].table,
    baseline: r && r.baseline < r.main.points.length ? r.baseline : null,
    rules,
    subgroupSize: r?.subgroupSize,
    lsl: specOk ? (lsl as number | null) : null,
    usl: specOk ? (usl as number | null) : null,
  });

  const typeInfo = TYPES.find((t) => t.id === type)!;
  const rangeName = type === 'imr' ? 'Moving range' : 'Range';
  const unit = type === 'xbar-r' ? 'subgroups' : 'points';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-xl border border-fd-border p-5">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium">What are you charting?</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Chart type">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={type === t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  'flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors',
                  type === t.id ? 'border-fd-primary bg-fd-primary/10' : 'border-fd-border hover:bg-fd-accent',
                )}
              >
                <span className="text-sm font-medium">{t.label}</span>
                <span className="text-xs text-fd-muted-foreground">{t.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Data
          <textarea
            value={texts[type]}
            onChange={(e) => setTexts((t) => ({ ...t, [type]: e.target.value }))}
            rows={9}
            spellCheck={false}
            className={cn(inputClass, 'resize-y font-mono text-xs')}
          />
          <span className="text-xs font-normal text-fd-muted-foreground">{typeInfo.hint}</span>
        </label>

        <div className={cn('grid gap-3', type === 'p' ? 'sm:grid-cols-1' : 'sm:grid-cols-3')}>
          <label className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
            Limits from the first … {unit}
            <input
              type="text"
              inputMode="numeric"
              value={cfg.baseline}
              placeholder="All"
              onChange={(e) => setCfg({ baseline: e.target.value })}
              className={cn(inputClass, 'font-mono', type === 'p' && 'sm:max-w-48')}
            />
          </label>
          {type !== 'p' && (
            <>
              <label className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
                Lower spec limit (optional)
                <input
                  type="text"
                  inputMode="decimal"
                  value={cfg.lsl}
                  onChange={(e) => setCfg({ lsl: e.target.value })}
                  className={cn(inputClass, 'font-mono')}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
                Upper spec limit (optional)
                <input
                  type="text"
                  inputMode="decimal"
                  value={cfg.usl}
                  onChange={(e) => setCfg({ usl: e.target.value })}
                  className={cn(inputClass, 'font-mono')}
                />
              </label>
            </>
          )}
        </div>
        <p className="-mt-2 text-xs text-fd-muted-foreground">
          Set the limits from a stable baseline period, then judge every later point against them. Blank uses every
          point, which lets a shift drag the limits toward itself.
        </p>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-medium">Western Electric rules</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {RULES.map((rule) => (
              <label key={rule.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={rules.includes(rule.id)}
                  onChange={(e) =>
                    setRules((rs) =>
                      e.target.checked ? [...rs, rule.id].sort() : rs.filter((x) => x !== rule.id),
                    )
                  }
                  className="mt-0.5 size-4 shrink-0 accent-fd-primary"
                />
                <span>
                  <span className="font-medium">Rule {rule.id}:</span>{' '}
                  <span className="text-fd-muted-foreground">{rule.text}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {(error || warnings.length > 0 || parsed.errors.length > 0) && (
          <ul className="flex flex-col gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {error && <li>{error}</li>}
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
            {parsed.errors.slice(0, 5).map((e) => (
              <li key={e}>{e}</li>
            ))}
            {parsed.errors.length > 5 && <li>…and {parsed.errors.length - 5} more.</li>}
          </ul>
        )}
      </div>

      {r && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label={type === 'xbar-r' ? 'Grand mean (X̿)' : type === 'p' ? 'Center line (p̄)' : 'Center line (X̄)'} value={fmt(r.main.center)} />
            {type === 'p' ? (
              <Stat
                label="UCL"
                value={`${fmt(Math.min(...r.main.points.map((p) => p.ucl)))}–${fmt(Math.max(...r.main.points.map((p) => p.ucl))).replace('%', '')}%`}
                note="varies with sample size"
              />
            ) : (
              <Stat label="UCL" value={fmt(r.main.ucl)} />
            )}
            {type === 'p' ? (
              <Stat
                label="LCL"
                value={fmt(Math.min(...r.main.points.map((p) => p.lcl)))}
                note={r.main.points.every((p) => p.lcl === 0) ? 'floored at 0' : undefined}
              />
            ) : (
              <Stat label="LCL" value={fmt(r.main.lcl)} />
            )}
            <Stat
              label="Signals"
              value={String(flagged.length)}
              note={`of ${r.main.points.length} ${unit}`}
            />
          </div>

          {flagged.length === 0 && rangeFlags.length === 0 ? (
            <div className="flex gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
              <CircleCheck className="mt-0.5 size-4 shrink-0" />
              <p>
                <strong>No signals.</strong> Every point is inside the limits and none of the selected rules fired, so the
                variation looks like common cause: the process is in statistical control against this baseline.
              </p>
            </div>
          ) : (
            <div className="flex gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <div className="flex flex-col gap-1.5">
                {first ? (
                  <p>
                    <strong>First signal at {first.label}:</strong> {first.rules.map(ruleText).join('; ')}.{' '}
                    {flagged.length > 1 && <>{flagged.length - 1} more {flagged.length === 2 ? 'point' : 'points'} flagged after it. </>}
                    Something changed in the process around then. Look for a special cause before adjusting anything.
                  </p>
                ) : (
                  <p>
                    <strong>The {rangeName.toLowerCase()} chart has a signal</strong> at {rangeFlags.map((p) => p.label).join(', ')}
                    : the spread jumped there, even though the {type === 'imr' ? 'values' : 'means'} stayed inside their limits.
                  </p>
                )}
                {inBaseline.length > 0 && (
                  <p>
                    {inBaseline.length === 1 ? 'One signal is' : `${inBaseline.length} signals are`} inside the baseline (
                    {inBaseline.map((p) => p.label).join(', ')}). Find the cause and drop those points, or the limits are
                    built on a process that wasn&apos;t stable.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              {type === 'imr' ? 'Individuals chart' : type === 'xbar-r' ? 'X̄ chart (subgroup means)' : 'p chart (proportion defective)'}
            </h2>
            <ControlChart
              s={r.main}
              slots={r.main.points.length}
              baseline={r.baseline}
              fmt={fmt}
              percent={type === 'p'}
              zones={rules.includes(2) || rules.includes(3)}
              title={typeInfo.sub}
            />
            <Legend zones={rules.includes(2) || rules.includes(3)} />
          </div>

          {r.range && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">{rangeName} chart</h2>
              <p className="-mt-1.5 text-sm text-fd-muted-foreground">
                {type === 'imr'
                  ? 'The gap between each value and the one before it. The moving range sets the width of the limits above, so check it first.'
                  : `The spread inside each subgroup of ${r.subgroupSize}. The average range sets the width of the X̄ limits, so check it first.`}{' '}
                Only rule 1 applies here.
              </p>
              <ControlChart
                s={r.range}
                slots={r.main.points.length}
                offset={r.main.points.length - r.range.points.length}
                baseline={r.baseline}
                fmt={fmt}
                height={190}
                title={`${rangeName} chart`}
              />
            </div>
          )}

          {cap && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Process capability</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {cap.cp !== null && <Stat label="Cp" value={cap.cp.toFixed(2)} note="spread vs. spec width" />}
                <Stat label="Cpk" value={cap.cpk.toFixed(2)} note="also counts centering" />
                {cap.cpl !== null && <Stat label="Cpl" value={cap.cpl.toFixed(2)} />}
                {cap.cpu !== null && <Stat label="Cpu" value={cap.cpu.toFixed(2)} />}
              </div>
              <p className="text-sm text-fd-muted-foreground">
                From the within-{type === 'imr' ? 'sample' : 'subgroup'} sigma of {fmt(r.sigmaWithin!)} and the baseline
                center line. Cpk of 1.33 or more is the common target.{' '}
                {flagged.length > 0 && (
                  <strong className="text-fd-foreground">
                    The chart shows signals, so these numbers describe the baseline, not the process as it runs now.
                  </strong>
                )}
              </p>
            </div>
          )}

          {(flagged.length > 0 || rangeFlags.length > 0) && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Signals</h2>
              <div className="overflow-x-auto rounded-lg border border-fd-border">
                <table className="w-full text-sm">
                  <thead className="bg-fd-secondary/60 text-left text-xs">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Point</th>
                      <th className="px-3 py-2 text-right font-semibold">Value</th>
                      <th className="px-3 py-2 font-semibold">Rule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flagged.map((p) => (
                      <tr key={`m-${p.i}`} className="border-t border-fd-border">
                        <td className="px-3 py-1.5 font-mono text-xs">
                          {p.label}
                          {p.i < r.baseline && <span className="ml-1.5 font-sans text-fd-muted-foreground">baseline</span>}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono">{fmt(p.value)}</td>
                        <td className="px-3 py-1.5">
                          {p.rules.map((rule) => (
                            <span key={rule} className="block">
                              <strong>{rule}</strong> <span className="text-fd-muted-foreground">{ruleText(rule)}</span>
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                    {rangeFlags.map((p) => (
                      <tr key={`r-${p.label}`} className="border-t border-fd-border">
                        <td className="px-3 py-1.5 font-mono text-xs">
                          {p.label}
                          <span className="ml-1.5 font-sans text-fd-muted-foreground">{type === 'imr' ? 'moving range' : 'range'}</span>
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono">{fmt(p.value)}</td>
                        <td className="px-3 py-1.5">
                          <strong>1</strong>{' '}
                          <span className="text-fd-muted-foreground">{rangeName.toLowerCase()} beyond its upper limit</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <details className="rounded-lg border border-fd-border">
            <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium">Every point as a table</summary>
            <div className="max-h-96 overflow-auto border-t border-fd-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-fd-secondary text-left text-xs">
                  <tr>
                    <th className="px-3 py-2 font-semibold">#</th>
                    <th className="px-3 py-2 font-semibold">Label</th>
                    <th className="px-3 py-2 text-right font-semibold">Value</th>
                    <th className="px-3 py-2 text-right font-semibold">LCL</th>
                    <th className="px-3 py-2 text-right font-semibold">UCL</th>
                    <th className="px-3 py-2 font-semibold">Rules</th>
                  </tr>
                </thead>
                <tbody>
                  {r.main.points.map((p, i) => (
                    <tr key={i} className={cn('border-t border-fd-border', i === r.baseline && 'border-t-2 border-t-fd-muted-foreground/40')}>
                      <td className="px-3 py-1 font-mono text-xs text-fd-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-1 font-mono text-xs">{p.label}</td>
                      <td className="px-3 py-1 text-right font-mono">{fmt(p.value)}</td>
                      <td className="px-3 py-1 text-right font-mono text-fd-muted-foreground">{fmt(p.lcl)}</td>
                      <td className="px-3 py-1 text-right font-mono text-fd-muted-foreground">{fmt(p.ucl)}</td>
                      <td className="px-3 py-1 font-mono text-xs">{p.rules.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-fd-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">The same chart in Power BI</p>
            <p className="text-sm text-fd-muted-foreground">
              Measures for the center line, control limits, and every rule you ticked, with the baseline you set.
              {type === 'imr' && ' The moving range is a calculated column, because each row needs the one before it.'}
            </p>
          </div>
          <CopyButton text={dax} />
        </div>
        <label className="flex max-w-xs flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
          Table name
          <input
            type="text"
            value={cfg.table}
            onChange={(e) => setCfg({ table: e.target.value })}
            className={cn(inputClass, 'font-mono')}
          />
        </label>
        <pre className="max-h-[32rem] overflow-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
          <code>{highlightCode(dax)}</code>
        </pre>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-fd-muted-foreground">
          <li>
            Add a line chart with <code className="text-fd-foreground">{type === 'xbar-r' ? 'SubgroupNo' : 'SampleNo'}</code> on
            the X-axis, and set the axis type to Categorical so every point shows.
          </li>
          <li>
            Put{' '}
            <code className="text-fd-foreground">
              {type === 'imr' ? 'Sample Value' : type === 'xbar-r' ? 'Subgroup Mean' : 'Proportion Defective'}
            </code>
            , <code className="text-fd-foreground">{type === 'xbar-r' ? 'Grand Mean' : 'Center Line'}</code>,{' '}
            <code className="text-fd-foreground">UCL</code>, and <code className="text-fd-foreground">LCL</code> on the
            Y-axis. Make the limits dashed under Format &gt; Lines.
          </li>
          {rules.length > 0 && (
            <li>
              Add <code className="text-fd-foreground">Signal Point</code> to the Y-axis too, set its line width to 0, turn
              on its markers, and color them red. Put <code className="text-fd-foreground">Signal Rules</code> in the
              tooltips.
            </li>
          )}
          {r?.range && (
            <li>
              Build a second line chart underneath for the {rangeName.toLowerCase()}, from{' '}
              <code className="text-fd-foreground">{type === 'imr' ? 'Moving Range Value' : 'Subgroup Range'}</code> and its
              limits. Keep it a separate chart: the two have different scales, so they shouldn&apos;t share an axis.
            </li>
          )}
        </ol>
        <p className="text-xs text-fd-muted-foreground">
          The rules work on <code>Z Score</code>, so they behave the same on a p chart whose limits change with sample
          size. Each rule flags the point that completes the pattern, the same convention this page uses. More on the
          measures behind it in{' '}
          <Link href="/docs/dax/calculate" className="text-fd-primary hover:underline">
            CALCULATE
          </Link>{' '}
          and{' '}
          <Link href="/docs/dax/filter-functions" className="text-fd-primary hover:underline">
            ALL and REMOVEFILTERS
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
