'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Download, Shuffle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import {
  DEFAULT_START,
  TUTORIAL_TASKS,
  formatDate,
  fromSerial,
  generateDax,
  orderTasks,
  parseTasks,
  percentileSerial,
  probabilityBy,
  simulate,
  simulationsCsv,
  tasksCsv,
  toSerial,
  type DayMode,
  type Distribution,
  type SimulationResult,
} from '@/lib/schedule-risk';

const inputClass =
  'w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

const ITERATIONS = [1000, 5000, 10000] as const;
const DEFAULT_SEED = 20260105;

function pct(v: number) {
  if (v > 0 && v < 0.01) return '<1%';
  if (v < 1 && v > 0.99) return '>99%';
  return `${Math.round(v * 100)}%`;
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-fit flex-wrap rounded-full border border-fd-border p-1 text-xs">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-full px-3 py-1 font-medium transition-colors',
            value === o.value ? 'bg-fd-primary text-fd-primary-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Tile({ label, value, note, tone }: { label: string; value: string; note: string; tone?: 'good' | 'watch' | 'poor' }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-fd-border p-3">
      <p className="text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">{label}</p>
      <p
        className={cn(
          'font-mono text-xl font-bold sm:text-2xl',
          tone === 'good' && 'text-emerald-600 dark:text-emerald-400',
          tone === 'watch' && 'text-amber-600 dark:text-amber-400',
          tone === 'poor' && 'text-red-600 dark:text-red-400',
        )}
      >
        {value}
      </p>
      <p className="text-xs text-fd-muted-foreground">{note}</p>
    </div>
  );
}

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

interface Marker {
  serial: number;
  label: string;
  kind: 'plan' | 'p80' | 'target';
}

function SCurve({ r, markers }: { r: SimulationResult; markers: Marker[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const height = 260;
  const pad = { top: 34, right: 16, bottom: 30, left: 40 };
  const innerW = Math.max(100, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;

  const lo = Math.min(r.sorted[0], ...markers.map((m) => m.serial)) - 3;
  const hi = Math.max(r.sorted[r.sorted.length - 1], ...markers.map((m) => m.serial)) + 3;
  const x = (s: number) => pad.left + ((s - lo) / Math.max(1, hi - lo)) * innerW;
  const y = (p: number) => pad.top + (1 - p) * innerH;

  // One step per distinct finish date.
  const path = (() => {
    const parts: string[] = [`M${x(lo)},${y(0)}`];
    let prev = 0;
    let i = 0;
    const n = r.sorted.length;
    while (i < n) {
      const s = r.sorted[i];
      while (i < n && r.sorted[i] === s) i++;
      const p = i / n;
      parts.push(`L${x(s)},${y(prev)}`, `L${x(s)},${y(p)}`);
      prev = p;
    }
    parts.push(`L${x(hi)},${y(1)}`);
    return parts.join('');
  })();

  // Month ticks, thinned to fit the width.
  const ticks = (() => {
    const out: number[] = [];
    const d = new Date(lo * 86_400_000);
    let m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    while (m.getTime() / 86_400_000 <= hi) {
      out.push(Math.round(m.getTime() / 86_400_000));
      m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1));
    }
    const step = Math.max(1, Math.ceil(out.length / Math.max(1, Math.floor(innerW / 70))));
    return out.filter((_, i) => i % step === 0);
  })();

  const markerClass: Record<Marker['kind'], string> = {
    plan: 'stroke-fd-muted-foreground',
    p80: 'stroke-fd-foreground',
    target: 'stroke-fd-foreground',
  };

  // Stagger marker labels into rows so close dates don't overlap.
  const placed = (() => {
    const sortedMarkers = [...markers].sort((a, b) => a.serial - b.serial);
    const rowsEnd: number[] = [];
    return sortedMarkers.map((m) => {
      const cx = x(m.serial);
      const w = m.label.length * 6.2 + 8;
      let row = rowsEnd.findIndex((end) => end < cx - w / 2);
      if (row === -1) row = rowsEnd.length;
      rowsEnd[row] = cx + w / 2;
      return { ...m, cx, row: Math.min(row, 2) };
    });
  })();

  const hoverP = hover === null ? null : probabilityBy(r.sorted, hover);

  return (
    <div ref={ref} className="relative w-full">
      <svg
        width={width}
        height={height}
        className="block touch-pan-y"
        role="img"
        aria-label={`S-curve of ${r.iterations.toLocaleString('en-US')} simulated finish dates from ${formatDate(r.sorted[0])} to ${formatDate(r.sorted[r.sorted.length - 1])}`}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const s = Math.round(lo + ((e.clientX - rect.left - pad.left) / innerW) * (hi - lo));
          setHover(s >= lo && s <= hi ? s : null);
        }}
        onPointerLeave={() => setHover(null)}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <g key={p}>
            <line x1={pad.left} x2={pad.left + innerW} y1={y(p)} y2={y(p)} className="stroke-fd-border" strokeWidth={1} />
            <text x={pad.left - 6} y={y(p) + 3.5} textAnchor="end" className="fill-fd-muted-foreground text-[11px]">
              {p * 100}%
            </text>
          </g>
        ))}
        {ticks.map((t) => (
          <text key={t} x={x(t)} y={height - 10} textAnchor="middle" className="fill-fd-muted-foreground text-[11px]">
            {new Date(t * 86_400_000).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: '2-digit' })}
          </text>
        ))}
        {placed.map((m) => (
          <g key={m.kind}>
            <line
              x1={m.cx}
              x2={m.cx}
              y1={pad.top - 4 - m.row * 13}
              y2={pad.top + innerH}
              className={markerClass[m.kind]}
              strokeWidth={1}
              strokeDasharray={m.kind === 'p80' ? undefined : '3 3'}
            />
            <text
              x={Math.min(Math.max(m.cx, pad.left + 30), pad.left + innerW - 30)}
              y={pad.top - 8 - m.row * 13}
              textAnchor="middle"
              className={cn('text-[11px]', m.kind === 'plan' ? 'fill-fd-muted-foreground' : 'fill-fd-foreground font-medium')}
            >
              {m.label}
            </text>
          </g>
        ))}
        <path d={path} className="fill-none stroke-fd-primary" strokeWidth={2} strokeLinejoin="round" />
        {hover !== null && hoverP !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} className="stroke-fd-muted-foreground/60" />
            <circle cx={x(hover)} cy={y(hoverP)} r={4} className="fill-fd-primary stroke-fd-background" strokeWidth={2} />
          </g>
        )}
      </svg>
      {hover !== null && hoverP !== null && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-fd-border bg-fd-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{
            left: Math.min(Math.max(x(hover) + 10, 0), width - 170),
            top: Math.max(0, y(hoverP) - 52),
          }}
        >
          <p className="font-medium">{formatDate(hover)}</p>
          <p className="text-fd-muted-foreground">
            <span className="font-mono text-fd-foreground">{pct(hoverP)}</span> of runs finished by then
          </p>
        </div>
      )}
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

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ScheduleRiskSimulator() {
  const [text, setText] = useState(TUTORIAL_TASKS);
  const [start, setStart] = useState(DEFAULT_START);
  const [target, setTarget] = useState('');
  const [dist, setDist] = useState<Distribution>('pert');
  const [dayMode, setDayMode] = useState<DayMode>('calendar');
  const [iterations, setIterations] = useState<number>(10000);
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const deferredText = useDeferredValue(text);

  const { tasks, errors } = useMemo(() => parseTasks(deferredText), [deferredText]);
  const ordered = useMemo(() => orderTasks(tasks), [tasks]);
  const startSerial = toSerial(start);
  const cycle = 'cycle' in ordered ? ordered.cycle : null;

  const r = useMemo(() => {
    if (!('order' in ordered) || tasks.length === 0 || startSerial === null) return null;
    return simulate(tasks, ordered.order, { iterations, dist, seed, startSerial, dayMode });
  }, [tasks, ordered, iterations, dist, seed, startSerial, dayMode]);

  const stats = useMemo(() => {
    if (!r) return null;
    const p50 = percentileSerial(r.sorted, 0.5);
    const p80 = percentileSerial(r.sorted, 0.8);
    const p90 = percentileSerial(r.sorted, 0.9);
    return { p50, p80, p90, planProb: probabilityBy(r.sorted, r.planSerial) };
  }, [r]);

  const targetSerial = toSerial(target);
  const targetProb = r && targetSerial !== null ? probabilityBy(r.sorted, targetSerial) : null;

  const dax = r
    ? generateDax({ planIso: fromSerial(r.planSerial), targetIso: targetSerial !== null ? fromSerial(targetSerial) : null })
    : '';

  const markers: Marker[] =
    r && stats
      ? [
          { serial: r.planSerial, label: 'Plan', kind: 'plan' as const },
          { serial: stats.p80, label: 'P80', kind: 'p80' as const },
          ...(targetSerial !== null ? [{ serial: targetSerial, label: 'Target', kind: 'target' as const }] : []),
        ]
      : [];

  const byCriticality = r ? [...r.tasks].sort((a, b) => b.criticality - a.criticality) : [];
  const dayWord = dayMode === 'working' ? 'working days' : 'days';
  const tone = (p: number) => (p >= 0.8 ? 'good' : p >= 0.5 ? 'watch' : 'poor') as 'good' | 'watch' | 'poor';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-xl border border-fd-border p-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          <span>Tasks</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            spellCheck={false}
            className={cn(inputClass, 'font-mono text-xs leading-relaxed')}
          />
          <span className="text-xs font-normal text-fd-muted-foreground">
            One task per line: ID, name, optimistic, most likely, and pessimistic duration in {dayWord}, then
            predecessor IDs separated by <code>;</code>. Commas or tabs, so you can paste from Excel. Links are
            finish-to-start. The sample is the{' '}
            <Link
              href="/tutorials/build-a-schedule-risk-monte-carlo-dashboard"
              className="text-fd-primary hover:underline"
            >
              schedule risk tutorial
            </Link>
            &apos;s task list, which builds the same simulation in DAX.
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span>Start date</span>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span>Target finish (optional)</span>
            <input type="date" value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass} />
          </label>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="w-24 font-medium">Distribution</span>
            <Segmented
              label="Distribution"
              value={dist}
              onChange={setDist}
              options={[
                { value: 'pert', label: 'Beta-PERT' },
                { value: 'triangular', label: 'Triangular' },
              ]}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="w-24 font-medium">Durations</span>
            <Segmented
              label="Duration units"
              value={dayMode}
              onChange={setDayMode}
              options={[
                { value: 'calendar', label: 'Calendar days' },
                { value: 'working', label: 'Working days (Mon–Fri)' },
              ]}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="w-24 font-medium">Iterations</span>
            <Segmented
              label="Iterations"
              value={iterations}
              onChange={setIterations}
              options={ITERATIONS.map((n) => ({ value: n, label: n.toLocaleString('en-US') }))}
            />
            <button
              type="button"
              onClick={() => setSeed((s) => (Math.imul(s ^ (s >>> 13), 0x5bd1e995) + 0x9e3779b9) >>> 0)}
              className="flex items-center gap-1.5 rounded-full border border-fd-border px-3 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
            >
              <Shuffle className="size-3.5" />
              Re-run
            </button>
          </div>
        </div>

        {(errors.length > 0 || cycle || startSerial === null) && (
          <ul className="flex flex-col gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
            {startSerial === null && <li>Pick a start date.</li>}
            {cycle && <li>These tasks depend on each other in a loop, so no finish date exists: {cycle.join(', ')}.</li>}
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>

      {r && stats && (
        <>
          <p
            className={cn(
              'rounded-lg border px-4 py-3 text-sm font-medium',
              stats.planProb >= 0.5
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200',
            )}
          >
            Adding up the most-likely durations finishes on {formatDate(r.planSerial)}, but only{' '}
            {pct(stats.planProb)} of {r.iterations.toLocaleString('en-US')} simulated runs finished by then.
            For 80% confidence, plan on {formatDate(stats.p80)}: {stats.p80 - r.planSerial} calendar days of
            schedule reserve.
          </p>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Tile
              label="Plan date"
              value={fromSerial(r.planSerial)}
              note={`Most-likely durations, ${Math.round(r.planDays)} ${dayWord}. ${pct(stats.planProb)} chance.`}
              tone={tone(stats.planProb)}
            />
            <Tile label="P50" value={fromSerial(stats.p50)} note="Half the runs finished by this date." />
            <Tile label="P80" value={fromSerial(stats.p80)} note="A common commitment level." />
            <Tile label="P90" value={fromSerial(stats.p90)} note="One run in ten finished later." />
          </div>

          {targetProb !== null && targetSerial !== null && (
            <Tile
              label="Chance of hitting the target"
              value={pct(targetProb)}
              note={`${formatDate(targetSerial)}: ${Math.round(targetProb * r.iterations).toLocaleString('en-US')} of ${r.iterations.toLocaleString('en-US')} runs finished on or before it.`}
              tone={tone(targetProb)}
            />
          )}

          <figure className="flex flex-col gap-2 rounded-xl border border-fd-border p-4">
            <figcaption className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">Probability of finishing by each date</span>
              <span className="text-xs text-fd-muted-foreground">
                The S-curve of every simulated finish. Hover to read any date. The dashed line is the plan
                date; the solid line is P80.
              </span>
            </figcaption>
            <SCurve r={r} markers={markers} />
          </figure>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Which tasks drive the finish?</h2>
            <p className="text-sm text-fd-muted-foreground">
              The criticality index is the share of runs in which a task was on the critical path. Parallel
              paths split it between them, and that&apos;s why the plan date is optimistic: the project
              waits for whichever branch runs late. <strong className="text-fd-foreground">Plan</strong> marks
              the critical path when every task takes its most-likely duration.
            </p>
            <div className="overflow-x-auto rounded-xl border border-fd-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-fd-border text-left text-xs text-fd-muted-foreground">
                    <th className="px-3 py-2 font-medium">Task</th>
                    <th className="hidden px-3 py-2 text-right font-medium whitespace-nowrap sm:table-cell">O / M / P</th>
                    <th className="px-3 py-2 text-right font-medium">Mean</th>
                    <th className="w-[40%] min-w-28 px-3 py-2 font-medium">Criticality</th>
                  </tr>
                </thead>
                <tbody>
                  {byCriticality.map((t) => (
                    <tr key={t.id} className="border-b border-fd-border last:border-0">
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs text-fd-muted-foreground">{t.id}</span> {t.name}
                        {t.planCritical && (
                          <span className="ml-2 rounded border border-fd-border px-1 py-px text-[10px] font-medium text-fd-muted-foreground uppercase">
                            Plan
                          </span>
                        )}
                      </td>
                      <td className="hidden px-3 py-2 text-right font-mono text-xs whitespace-nowrap sm:table-cell">
                        {t.o} / {t.m} / {t.p}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs">{t.mean.toFixed(1)}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-fd-secondary">
                            <div
                              className="h-2 rounded-full bg-fd-primary"
                              style={{ width: `${Math.max(t.criticality > 0 ? 2 : 0, t.criticality * 100)}%` }}
                            />
                          </div>
                          <span className="w-10 text-right font-mono text-xs">{pct(t.criticality)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-fd-border p-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold">Take it into Power BI</h2>
              <p className="text-sm text-fd-muted-foreground">
                DAX can&apos;t walk a task network, so run the simulation here and load the runs as a table.
                Download both files, then <strong className="text-fd-foreground">Get data &gt; Text/CSV</strong>.
                The measures below reproduce every number on this page from them.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => download('schedule_simulations.csv', simulationsCsv(r))}
                className="flex items-center gap-1.5 rounded-md border border-fd-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-fd-accent"
              >
                <Download className="size-3.5" />
                schedule_simulations.csv
                <span className="font-normal text-fd-muted-foreground">({r.iterations.toLocaleString('en-US')} rows)</span>
              </button>
              <button
                type="button"
                onClick={() => download('schedule_tasks.csv', tasksCsv(r))}
                className="flex items-center gap-1.5 rounded-md border border-fd-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-fd-accent"
              >
                <Download className="size-3.5" />
                schedule_tasks.csv
                <span className="font-normal text-fd-muted-foreground">({r.tasks.length} rows)</span>
              </button>
            </div>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-fd-muted-foreground">
                The S-curve is the same disconnected-date pattern the EVM tutorial uses for planned value.
                For a fuller calendar, use the{' '}
                <Link href="/tools/date-table-generator" className="text-fd-primary hover:underline">
                  Date Table Generator
                </Link>
                .
              </p>
              <CopyButton text={dax} />
            </div>
            <pre className="max-h-[28rem] overflow-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
              <code>{highlightCode(dax)}</code>
            </pre>
          </section>
        </>
      )}
    </div>
  );
}
