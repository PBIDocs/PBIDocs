'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import {
  EAC_METHODS,
  EARNED_SCHEDULE_DAX,
  TUTORIAL_INPUTS,
  TUTORIAL_PV_CURVE_TEXT,
  TUTORIAL_STATUS_DATE,
  calculate,
  earnedSchedule,
  fromDay,
  generateDax,
  indexHealth,
  parsePvCurve,
  statusSummary,
  toDay,
  type EacMethod,
  type EvmInputs,
  type Health,
} from '@/lib/evm';

type ProgressMode = 'amount' | 'percent';

const inputClass =
  'w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

const HEALTH_CLASS: Record<Health, string> = {
  good: 'text-emerald-600 dark:text-emerald-400',
  watch: 'text-amber-600 dark:text-amber-400',
  poor: 'text-red-600 dark:text-red-400',
};

function money(value: number | null): string {
  if (value === null) return '—';
  const rounded = Math.round(value);
  return `${rounded < 0 ? '-' : ''}$${Math.abs(rounded).toLocaleString('en-US')}`;
}

function ratio(value: number | null): string {
  return value === null ? '—' : value.toFixed(2);
}

function parse(text: string): number {
  const n = Number(text.replace(/[$,\s%]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function Tile({
  label,
  value,
  health,
  note,
  keepCase = false,
  compact = false,
}: {
  label: string;
  value: string;
  health?: Health | null;
  note: string;
  keepCase?: boolean; // for labels like SPI(t), where uppercasing changes the meaning
  compact?: boolean; // for longer values such as dates
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-fd-border p-3">
      <p className={cn('text-xs font-semibold tracking-wide text-fd-muted-foreground', !keepCase && 'uppercase')}>
        {label}
      </p>
      <p
        className={cn(
          'font-mono font-bold',
          compact ? 'text-lg leading-8 whitespace-nowrap' : 'text-2xl',
          health && HEALTH_CLASS[health],
        )}
      >
        {value}
      </p>
      <p className="text-xs text-fd-muted-foreground">{note}</p>
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

function longDate(day: number): string {
  return new Date(Math.round(day) * 86400000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function EarnedSchedulePanel({ ev, spi }: { ev: number; spi: number | null }) {
  const [curveText, setCurveText] = useState(TUTORIAL_PV_CURVE_TEXT);
  const [statusDate, setStatusDate] = useState(TUTORIAL_STATUS_DATE);
  const { points, error } = useMemo(() => parsePvCurve(curveText), [curveText]);
  const statusDay = /^\d{4}-\d{2}-\d{2}$/.test(statusDate) ? toDay(statusDate) : NaN;
  let problem = error;
  if (!problem && !Number.isFinite(statusDay)) problem = 'Enter the status date as YYYY-MM-DD.';
  if (!problem && statusDay <= points[0].day) problem = 'The status date has to be after the first baseline date.';
  const r = problem ? null : earnedSchedule(points, ev, statusDay);
  const spiTHealth = indexHealth(r?.spiT ?? null);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-fd-border p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Earned Schedule: how late, in days</h2>
        <p className="text-sm text-fd-muted-foreground">
          SPI says how far behind you are in money. Earned Schedule finds the date your baseline planned to reach
          today&apos;s EV, so the answer comes out in days, and it doesn&apos;t drift back to 1.0 at the end of a late
          program. Uses the EV above.{' '}
          <Link href="/docs/dax-patterns/earned-schedule" className="text-fd-primary hover:underline">
            How it works
          </Link>
          .
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Baseline: cumulative PV by date
          <textarea
            value={curveText}
            onChange={(e) => setCurveText(e.target.value)}
            rows={8}
            spellCheck={false}
            className={cn(inputClass, 'font-mono')}
          />
          <span className="text-xs font-normal text-fd-muted-foreground">
            One line per date: <span className="font-mono">YYYY-MM-DD, amount</span>. Start with the baseline start at
            0 and end at the planned finish. Month-ends are enough.
          </span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium sm:w-44">
          Status date
          <input
            type="text"
            value={statusDate}
            onChange={(e) => setStatusDate(e.target.value.trim())}
            className={cn(inputClass, 'font-mono')}
            placeholder="YYYY-MM-DD"
          />
          <span className="text-xs font-normal text-fd-muted-foreground">The date EV and AC were reported.</span>
        </label>
      </div>

      {problem || !r ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
          {problem}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile
              label="Earned schedule"
              compact
              value={longDate(r.esDay)}
              note={`Day ${r.es.toFixed(1)}: when the plan expected today's EV.`}
            />
            <Tile
              label="SPI(t)"
              keepCase
              value={ratio(r.spiT)}
              health={spiTHealth}
              note={spi !== null ? `ES ÷ AT. SPI in money is ${spi.toFixed(2)}.` : 'ES ÷ AT.'}
            />
            <Tile
              label="SV(t)"
              keepCase
              value={`${r.svT >= 0 ? '+' : ''}${Math.round(r.svT)} days`}
              health={r.svT >= 0 ? 'good' : r.svT >= -0.1 * r.pd ? 'watch' : 'poor'}
              note={r.svT < 0 ? `Behind the plan, ${Math.round(r.at)} days in.` : 'At or ahead of the plan.'}
            />
            <Tile
              label="Forecast finish"
              compact
              value={r.forecastFinish === null ? '—' : longDate(r.forecastFinish)}
              health={r.forecastFinish === null ? null : r.forecastFinish <= r.plannedFinish + 0.5 ? 'good' : 'poor'}
              note={`Plan: ${longDate(r.plannedFinish)}. Assumes today's pace continues.`}
            />
          </div>
          {ev >= points[points.length - 1].pv && (
            <p className="text-xs text-fd-muted-foreground">
              EV has reached the end of the baseline, so ES is the planned finish ({fromDay(r.plannedFinish)}). Any
              delay now shows only in SPI(t) and SV(t), not in SPI.
            </p>
          )}
        </>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-fd-muted-foreground">
            The same measures in DAX, on the tutorial&apos;s daily PV measure and disconnected date table.
          </p>
          <CopyButton text={EARNED_SCHEDULE_DAX} />
        </div>
        <pre className="max-h-[22rem] overflow-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
          <code>{highlightCode(EARNED_SCHEDULE_DAX)}</code>
        </pre>
      </div>
    </section>
  );
}

const CHART = { size: 220, pad: 28, min: 0.5, max: 1.5 };

function QuadrantChart({ cpi, spi }: { cpi: number | null; spi: number | null }) {
  const { size, pad, min, max } = CHART;
  const inner = size - pad * 2;
  const scale = (v: number) => (Math.min(max, Math.max(min, v)) - min) / (max - min);
  const x = (v: number) => pad + scale(v) * inner;
  const y = (v: number) => pad + (1 - scale(v)) * inner;
  const mid = x(1);
  const clipped = cpi !== null && spi !== null && (cpi < min || cpi > max || spi < min || spi > max);

  return (
    <figure className="flex flex-col items-center gap-2">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[260px]"
        role="img"
        aria-label={
          cpi !== null && spi !== null
            ? `Performance chart: SPI ${spi.toFixed(2)} on the horizontal axis, CPI ${cpi.toFixed(2)} on the vertical axis`
            : 'Performance chart with no point plotted'
        }
      >
        <rect x={pad} y={pad} width={inner / 2} height={inner / 2} className="fill-amber-500/10" />
        <rect x={mid} y={pad} width={inner / 2} height={inner / 2} className="fill-emerald-500/10" />
        <rect x={pad} y={mid} width={inner / 2} height={inner / 2} className="fill-red-500/10" />
        <rect x={mid} y={mid} width={inner / 2} height={inner / 2} className="fill-amber-500/10" />
        <rect x={pad} y={pad} width={inner} height={inner} className="fill-none stroke-fd-border" />
        <line x1={mid} y1={pad} x2={mid} y2={pad + inner} className="stroke-fd-muted-foreground/50" strokeDasharray="3 3" />
        <line x1={pad} y1={mid} x2={pad + inner} y2={mid} className="stroke-fd-muted-foreground/50" strokeDasharray="3 3" />
        <g className="fill-fd-muted-foreground text-[8px]">
          <text x={pad + 4} y={pad + 11}>Under budget, behind</text>
          <text x={pad + inner - 4} y={pad + 11} textAnchor="end">Under budget, ahead</text>
          <text x={pad + 4} y={pad + inner - 5}>Over budget, behind</text>
          <text x={pad + inner - 4} y={pad + inner - 5} textAnchor="end">Over budget, ahead</text>
        </g>
        <g className="fill-fd-muted-foreground text-[9px]">
          <text x={pad} y={size - 8} textAnchor="middle">{min}</text>
          <text x={mid} y={size - 8} textAnchor="middle">1.0</text>
          <text x={pad + inner} y={size - 8} textAnchor="middle">{max}</text>
          <text x={pad - 6} y={pad + inner + 3} textAnchor="end">{min}</text>
          <text x={pad - 6} y={mid + 3} textAnchor="end">1.0</text>
          <text x={pad - 6} y={pad + 3} textAnchor="end">{max}</text>
        </g>
        {cpi !== null && spi !== null && (
          <circle cx={x(spi)} cy={y(cpi)} r={6} className="fill-fd-primary stroke-fd-background" strokeWidth={2} />
        )}
      </svg>
      <figcaption className="text-center text-xs text-fd-muted-foreground">
        SPI across, CPI up. Top right is under budget and ahead of schedule.
        {clipped && ' The point is pinned to the edge because a value is outside 0.5–1.5.'}
      </figcaption>
    </figure>
  );
}

export function EvmCalculator() {
  const [fields, setFields] = useState({
    bac: String(TUTORIAL_INPUTS.bac),
    pv: String(TUTORIAL_INPUTS.pv),
    ev: String(TUTORIAL_INPUTS.ev),
    ac: String(TUTORIAL_INPUTS.ac),
  });
  const [mode, setMode] = useState<ProgressMode>('amount');
  const [method, setMethod] = useState<EacMethod>('cpi');
  const bac = parse(fields.bac);
  const inputs: EvmInputs = {
    bac,
    pv: mode === 'percent' ? (bac * parse(fields.pv)) / 100 : parse(fields.pv),
    ev: mode === 'percent' ? (bac * parse(fields.ev)) / 100 : parse(fields.ev),
    ac: parse(fields.ac),
  };
  const r = calculate(inputs, method);
  const dax = useMemo(() => generateDax(method), [method]);

  function switchMode(next: ProgressMode) {
    if (next === mode) return;
    // Convert the PV/EV fields so the numbers carry over instead of resetting.
    const convert = (text: string) => {
      const v = parse(text);
      if (bac === 0) return '0';
      return next === 'percent' ? String(Math.round((v / bac) * 1000) / 10) : String(Math.round((bac * v) / 100));
    };
    setFields((f) => ({ ...f, pv: convert(f.pv), ev: convert(f.ev) }));
    setMode(next);
  }

  const cpiHealth = indexHealth(r.cpi);
  const spiHealth = indexHealth(r.spi);
  // TCPI reads the other way round: above 1 means the rest has to go better than plan.
  const tcpiHealth: Health | null = r.tcpi === null ? null : r.tcpi <= 1 ? 'good' : r.tcpi <= 1.1 ? 'watch' : 'poor';
  const overall: Health | null =
    cpiHealth && spiHealth
      ? cpiHealth === 'poor' || spiHealth === 'poor'
        ? 'poor'
        : cpiHealth === 'watch' || spiHealth === 'watch'
          ? 'watch'
          : 'good'
      : null;

  const fieldsConfig = [
    { key: 'bac', label: 'BAC', hint: 'Budget at completion: the total planned budget', percent: false },
    {
      key: 'pv',
      label: 'PV',
      hint: mode === 'percent' ? 'Planned value: % of BAC scheduled by now' : 'Planned value: budgeted cost of work scheduled by now',
      percent: true,
    },
    {
      key: 'ev',
      label: 'EV',
      hint: mode === 'percent' ? 'Earned value: % of BAC actually completed' : 'Earned value: budgeted cost of work actually completed',
      percent: true,
    },
    { key: 'ac', label: 'AC', hint: 'Actual cost: what that work actually cost', percent: false },
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-xl border border-fd-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">Status as of your reporting date</p>
          <div className="inline-flex w-fit rounded-full border border-fd-border p-1 text-xs">
            {(['amount', 'percent'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  'rounded-full px-3 py-1 font-medium transition-colors',
                  mode === m ? 'bg-fd-primary text-fd-primary-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
                )}
              >
                {m === 'amount' ? 'PV and EV as amounts' : 'PV and EV as % of BAC'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {fieldsConfig.map((f) => (
            <label key={f.key} className="flex flex-col gap-1.5 text-sm font-medium">
              <span>
                {f.label}
                {f.percent && mode === 'percent' ? ' (%)' : ''}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={fields[f.key]}
                onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className={cn(inputClass, 'font-mono')}
              />
              <span className="text-xs font-normal text-fd-muted-foreground">{f.hint}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-fd-muted-foreground">
          Pre-filled with the status-date numbers from the{' '}
          <Link href="/tutorials/build-an-evm-dashboard" className="text-fd-primary hover:underline">
            EVM dashboard tutorial
          </Link>
          . Any currency works; amounts are shown with $ for readability.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <p
          className={cn(
            'rounded-lg border px-4 py-3 text-sm font-medium',
            overall === 'good' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
            overall === 'watch' && 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
            overall === 'poor' && 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
            overall === null && 'border-fd-border text-fd-muted-foreground',
          )}
        >
          {statusSummary(r.cpi, r.spi)}
        </p>

        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-2 gap-3">
            <Tile
              label="CPI"
              value={ratio(r.cpi)}
              health={cpiHealth}
              note={r.cpi === null ? 'Needs actual cost.' : `Each $1 spent earned $${r.cpi.toFixed(2)} of planned work.`}
            />
            <Tile
              label="SPI"
              value={ratio(r.spi)}
              health={spiHealth}
              note={
                r.spi === null
                  ? 'Needs planned value.'
                  : `Work is being done at ${Math.round(r.spi * 100)}% of the planned rate.`
              }
            />
            <Tile
              label="Cost variance"
              value={money(r.cv)}
              note={r.cv < 0 ? 'Spent more than the completed work is worth.' : 'Completed work is worth at least what it cost.'}
            />
            <Tile
              label="Schedule variance"
              value={money(r.sv)}
              note={r.sv < 0 ? 'Value of planned work not yet done.' : 'Value of work done ahead of plan.'}
            />
          </div>
          <QuadrantChart cpi={r.cpi} spi={r.spi} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile label="EAC" value={money(r.eac[method])} note="Forecast total cost at completion." />
          <Tile label="ETC" value={money(r.etc)} note="Still to spend from today." />
          <Tile
            label="VAC"
            value={money(r.vac)}
            health={r.vac === null ? null : r.vac >= 0 ? 'good' : 'poor'}
            note={r.vac !== null && r.vac < 0 ? 'Forecast overrun against BAC.' : 'Forecast to finish within BAC.'}
          />
          <Tile
            label="TCPI"
            value={ratio(r.tcpi)}
            health={tcpiHealth}
            note={
              r.tcpi === null
                ? 'The budget is already spent.'
                : r.tcpi > 1
                  ? `The rest must run ${Math.round((r.tcpi - 1) * 100)}% more efficiently to hit BAC.`
                  : 'BAC is reachable at current efficiency.'
            }
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold">Which EAC?</legend>
        <p className="text-sm text-fd-muted-foreground">
          There&apos;s more than one standard forecast, and each assumes something different about the
          remaining work. The one you pick drives ETC, VAC, and the DAX below.
        </p>
        <div className="flex flex-col gap-2">
          {EAC_METHODS.map((m) => (
            <label
              key={m.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                method === m.id ? 'border-fd-primary/50 bg-fd-primary/5' : 'border-fd-border hover:bg-fd-accent/50',
              )}
            >
              <input
                type="radio"
                name="eac-method"
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
                className="mt-1 size-4 shrink-0 accent-fd-primary"
              />
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="font-mono text-sm font-medium">{m.label}</span>
                <span className="text-xs text-fd-muted-foreground">{m.assumption}</span>
              </span>
              <span className="font-mono text-sm font-semibold">{money(r.eac[m.id])}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <EarnedSchedulePanel ev={inputs.ev} spi={r.spi} />

      <div className="flex flex-col gap-3 rounded-xl border border-fd-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">The same metrics as DAX measures</p>
            <p className="text-sm text-fd-muted-foreground">
              Built on the PV, EV, AC, and BAC measures from the{' '}
              <Link href="/tutorials/build-an-evm-dashboard" className="text-fd-primary hover:underline">
                tutorial
              </Link>
              , using the EAC you picked. Paste each one into <strong className="text-fd-foreground">New measure</strong>.
            </p>
          </div>
          <CopyButton text={dax} />
        </div>
        <pre className="max-h-[28rem] overflow-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
          <code>{highlightCode(dax)}</code>
        </pre>
      </div>
    </div>
  );
}
