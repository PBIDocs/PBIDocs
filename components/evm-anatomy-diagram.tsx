import Link from 'next/link';
import { cn } from '@/lib/cn';

// The EVM dashboard tutorial's full dataset (program_status.csv), as of its mid-May status date.
const STATUS_DATE = '2026-05-15';

const RAW_TASKS = [
  { name: 'Requirements Analysis', short: 'Reqs', start: '2026-01-01', end: '2026-02-15', bac: 45000, complete: 1.0, actual: 42000 },
  { name: 'System Architecture', short: 'Architecture', start: '2026-01-15', end: '2026-03-15', bac: 60000, complete: 0.9, actual: 58000 },
  { name: 'Subsystem A Design', short: 'Subsys A', start: '2026-02-15', end: '2026-04-30', bac: 80000, complete: 0.65, actual: 58000 },
  { name: 'Subsystem B Design', short: 'Subsys B', start: '2026-02-15', end: '2026-04-30', bac: 75000, complete: 0.55, actual: 50000 },
  { name: 'Integration Planning', short: 'Integration', start: '2026-03-01', end: '2026-04-15', bac: 30000, complete: 0.4, actual: 15000 },
  { name: 'Prototype Build', short: 'Prototype', start: '2026-04-01', end: '2026-06-30', bac: 120000, complete: 0.2, actual: 30000 },
  { name: 'Verification & Test', short: 'V&T', start: '2026-05-01', end: '2026-07-31', bac: 90000, complete: 0.05, actual: 5000 },
  { name: 'Documentation', short: 'Docs', start: '2026-01-01', end: '2026-07-31', bac: 25000, complete: 0.35, actual: 10000 },
];

// Same as the tutorial's PV measure: share of each task's baseline duration elapsed, clamped to 0–100%.
const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const TASKS = RAW_TASKS.map((t) => ({
  ...t,
  planned: Math.min(1, Math.max(0, (day(STATUS_DATE) - day(t.start)) / (day(t.end) - day(t.start)))),
}));
const prototype = TASKS.find((t) => t.name === 'Prototype Build')!;

const sum = (f: (t: (typeof TASKS)[number]) => number) => TASKS.reduce((s, t) => s + f(t), 0);

const BAC = sum((t) => t.bac);
const PV = sum((t) => t.bac * t.planned);
const EV = sum((t) => t.bac * t.complete);
const AC = sum((t) => t.actual);
const CPI = EV / AC;
const SPI = EV / PV;
const EAC = BAC / CPI;

// The "blended percentage" mistake: total BAC times one program-wide average percent complete.
const blendedEV = BAC * (sum((t) => t.complete) / TASKS.length);

const fmt = (n: number) => `${n < 0 ? '−' : ''}$${Math.round(Math.abs(n)).toLocaleString('en-US')}`;
// Table cells use $K so all seven columns fit at phone width; the cards below carry the exact totals.
const fmtK = (n: number) => `$${Math.round(n / 1000)}K`;
const pct = (n: number) => `${Math.round(n * 100)}%`;

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

const DERIVED = [
  { label: 'CPI', formula: 'EV ÷ AC', value: CPI.toFixed(2), bad: CPI < 1, note: CPI < 1 ? 'over budget' : 'on/under budget' },
  { label: 'SPI', formula: 'EV ÷ PV', value: SPI.toFixed(2), bad: SPI < 1, note: SPI < 1 ? 'behind schedule' : 'on/ahead of schedule' },
  { label: 'CV', formula: 'EV − AC', value: fmt(EV - AC), bad: EV - AC < 0, note: 'neutral at 0, not 1' },
  { label: 'SV', formula: 'EV − PV', value: fmt(EV - PV), bad: EV - PV < 0, note: 'neutral at 0, not 1' },
  { label: 'EAC', formula: 'BAC ÷ CPI', value: fmt(EAC), bad: EAC > BAC, note: `vs. BAC ${fmt(BAC)}` },
];

export function EvmAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of an EVM status report
      </p>
      <p className="-mt-2 mb-3 text-xs text-fd-muted-foreground">
        The{' '}
        <Link href="/tutorials/build-an-evm-dashboard" className="underline">
          EVM dashboard tutorial
        </Link>
        &apos;s task list,
        status as of May 15, 2026. Plan % is how far each task is through its baseline dates by then.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="text-xs uppercase text-fd-muted-foreground">
              <th className="px-1.5 py-2 sm:px-3 text-left">Task</th>
              <th className="px-1.5 py-2 sm:px-3 text-right">BAC</th>
              <th className="hidden px-1.5 py-2 text-right sm:table-cell sm:px-3">Plan %</th>
              <th className="hidden px-1.5 py-2 text-right sm:table-cell sm:px-3">Done %</th>
              <th className="px-1.5 py-2 text-right sm:hidden">Plan / Done %</th>
              <th className="px-1.5 py-2 sm:px-3 text-right text-sky-600 dark:text-sky-400">PV</th>
              <th className="px-1.5 py-2 sm:px-3 text-right text-emerald-600 dark:text-emerald-400">EV</th>
              <th className="px-1.5 py-2 sm:px-3 text-right text-amber-600 dark:text-amber-400">AC</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {TASKS.map((t) => (
              <tr key={t.name} className="border-t border-fd-border">
                <td className="px-1.5 py-2 font-sans sm:px-3">
                  <span className="sm:hidden">{t.short}</span>
                  <span className="hidden sm:inline">{t.name}</span>
                </td>
                <td className="px-1.5 py-2 sm:px-3 text-right">{fmtK(t.bac)}</td>
                <td className="hidden px-1.5 py-2 text-right text-fd-muted-foreground sm:table-cell sm:px-3">{pct(t.planned)}</td>
                <td className="hidden px-1.5 py-2 text-right text-fd-muted-foreground sm:table-cell sm:px-3">{pct(t.complete)}</td>
                <td className="px-1.5 py-2 text-right text-fd-muted-foreground sm:hidden">
                  {Math.round(t.planned * 100)}/{Math.round(t.complete * 100)}
                </td>
                <td className="border-l border-sky-500/40 bg-sky-500/10 px-1.5 py-2 sm:px-3 text-right">{fmtK(t.bac * t.planned)}</td>
                <td className="bg-emerald-500/10 px-1.5 py-2 sm:px-3 text-right">{fmtK(t.bac * t.complete)}</td>
                <td className="border-r border-amber-500/40 bg-amber-500/10 px-1.5 py-2 sm:px-3 text-right">{fmtK(t.actual)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-fd-border font-semibold">
              <td className="px-1.5 py-2 sm:px-3 font-sans">Program total</td>
              <td className="px-1.5 py-2 sm:px-3 text-right">{fmtK(BAC)}</td>
              <td className="hidden px-1.5 py-2 sm:table-cell sm:px-3" />
              <td className="hidden px-1.5 py-2 sm:table-cell sm:px-3" />
              <td className="px-1.5 py-2 sm:hidden" />
              <td className="px-1.5 py-2 sm:px-3 text-right text-sky-600 dark:text-sky-400">{fmtK(PV)}</td>
              <td className="px-1.5 py-2 sm:px-3 text-right text-emerald-600 dark:text-emerald-400">{fmtK(EV)}</td>
              <td className="px-1.5 py-2 sm:px-3 text-right text-amber-600 dark:text-amber-400">{fmtK(AC)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="1" className="bg-sky-500" />
            Planned Value
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-sky-600 dark:text-sky-400">{fmt(PV)}</p>
          <p className="mt-1 font-mono text-xs text-fd-muted-foreground">Σ BAC × Planned %</p>
        </div>
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="2" className="bg-emerald-500" />
            Earned Value
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-emerald-600 dark:text-emerald-400">{fmt(EV)}</p>
          <p className="mt-1 font-mono text-xs text-fd-muted-foreground">Σ BAC × Complete %</p>
        </div>
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="3" className="bg-amber-500" />
            Actual Cost
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-amber-600 dark:text-amber-400">{fmt(AC)}</p>
          <p className="mt-1 font-mono text-xs text-fd-muted-foreground">Σ ActualCost</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
          <Badge n="✓" className="bg-fd-primary" />
          Everything else is derived from those three
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {DERIVED.map((d) => (
            <div key={d.label} className="rounded-md border border-fd-border p-2">
              <p className="text-xs text-fd-muted-foreground">
                {d.label} <span className="font-mono">= {d.formula}</span>
              </p>
              <p
                className={cn(
                  'mt-0.5 font-mono text-base font-semibold',
                  d.bad ? 'text-red-600 dark:text-red-400' : 'text-fd-primary',
                )}
              >
                {d.value}
              </p>
              <p className="text-[11px] text-fd-muted-foreground">{d.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">PV</span> — what the plan said each task should
            be worth by now. Prototype Build is only {pct(prototype.planned)} of the way through its planned dates, so
            it contributes {fmt(prototype.bac * prototype.planned)}, not its full {fmt(prototype.bac)}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">EV</span> — earned{' '}
            <strong>per task</strong>, then summed with <span className="font-mono">SUMX</span>. Multiplying the total
            BAC by the average percent complete instead gives {fmt(blendedEV)}, {fmt(blendedEV - EV)} too optimistic,
            because the two big late-stage tasks, Prototype Build and Verification &amp; Test, are the least complete.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">AC</span> — the only one of the three that
            comes straight from the ledger, with no percentages involved.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Derived metrics</span> — every ratio and variance compares two
            of the colored totals above. CPI {CPI.toFixed(2)} means each dollar spent has earned about{' '}
            {Math.round(CPI * 100)}¢ of planned work; carried forward, that turns a {fmt(BAC)} budget into a{' '}
            {fmt(EAC)} forecast.
          </p>
        </div>
      </div>
    </div>
  );
}
