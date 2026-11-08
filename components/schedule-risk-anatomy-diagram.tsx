import { cn } from '@/lib/cn';
import {
  DEFAULT_START,
  TUTORIAL_TASKS,
  orderTasks,
  parseTasks,
  percentileSerial,
  pertMean,
  probabilityBy,
  simulate,
  toSerial,
} from '@/lib/schedule-risk';

// The schedule risk tutorial's eight tasks, run through the Schedule Risk Simulator's own engine with
// its default seed, so every number here matches the tool and the tutorial text.
const SEED = 20260105;
const { tasks } = parseTasks(TUTORIAL_TASKS);
const ordered = orderTasks(tasks);
if (!('order' in ordered)) throw new Error('Tutorial task network has a cycle');
const START = toSerial(DEFAULT_START)!;
const R = simulate(tasks, ordered.order, {
  iterations: 10000,
  dist: 'pert',
  seed: SEED,
  startSerial: START,
  dayMode: 'calendar',
});

const P50 = percentileSerial(R.sorted, 0.5);
const P80 = percentileSerial(R.sorted, 0.8);
const PLAN = R.planSerial;
const ON_PLAN = probabilityBy(R.sorted, PLAN);
const MIN = R.sorted[0];
const MAX = R.sorted[R.sorted.length - 1];

// Longest most-likely path through the merge, as PERT means: what a no-simulation estimate would say.
const byId = new Map(R.tasks.map((t) => [t.id, t]));
const PERT_PATH = ['1', '2', '4', '6', '7'];
const PERT_PATH_DAYS = PERT_PATH.reduce((s, id) => s + pertMean(byId.get(id)!), 0);
const MERGE = ['3', '4', '5'].map((id) => byId.get(id)!);

const DAY_MS = 86_400_000;
const short = (serial: number) =>
  new Date(serial * DAY_MS).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });
const pc = (n: number) => `${Math.round(n * 100)}%`;

const SCALE_MAX = 100;

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

function SCurve() {
  const W = 300;
  const H = 150;
  const PAD = { l: 26, r: 8, t: 8, b: 20 };
  const x = (s: number) => PAD.l + ((s - MIN) / (MAX - MIN)) * (W - PAD.l - PAD.r);
  const y = (p: number) => PAD.t + (1 - p) * (H - PAD.t - PAD.b);
  const pts: string[] = [];
  for (let s = MIN; s <= MAX; s++) pts.push(`${x(s).toFixed(1)},${y(probabilityBy(R.sorted, s)).toFixed(1)}`);

  const markers = [
    { s: PLAN, p: ON_PLAN, label: 'Plan', cls: 'text-red-500' },
    { s: P50, p: probabilityBy(R.sorted, P50), label: 'P50', cls: 'text-amber-500' },
    { s: P80, p: probabilityBy(R.sorted, P80), label: 'P80', cls: 'text-violet-500' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label="S-curve of simulated finish dates">
      {[0, 0.5, 0.8, 1].map((p) => (
        <g key={p}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={y(p)}
            y2={y(p)}
            className="stroke-fd-border"
            strokeDasharray={p === 0 || p === 1 ? undefined : '3 3'}
          />
          <text x={PAD.l - 4} y={y(p) + 3} textAnchor="end" className="fill-fd-muted-foreground text-[9px]">
            {pc(p)}
          </text>
        </g>
      ))}
      <polyline points={pts.join(' ')} fill="none" strokeWidth={2} className="stroke-fd-primary" />
      {markers.map((m) => (
        <g key={m.label} className={m.cls}>
          <line x1={x(m.s)} x2={x(m.s)} y1={y(m.p)} y2={H - PAD.b} stroke="currentColor" strokeDasharray="2 2" />
          <circle cx={x(m.s)} cy={y(m.p)} r={3} fill="currentColor" />
          <text x={x(m.s)} y={H - PAD.b + 11} textAnchor="middle" fill="currentColor" className="text-[9px] font-semibold">
            {m.label}
          </text>
        </g>
      ))}
      <text x={PAD.l} y={H - 1} className="fill-fd-muted-foreground text-[8px]">
        {short(MIN)}
      </text>
      <text x={W - PAD.r} y={H - 1} textAnchor="end" className="fill-fd-muted-foreground text-[8px]">
        {short(MAX)}
      </text>
    </svg>
  );
}

export function ScheduleRiskAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a Monte Carlo schedule
      </p>
      <p className="mb-4 text-xs text-fd-muted-foreground">
        The tutorial&apos;s {tasks.length} tasks, {R.iterations.toLocaleString('en-US')} Beta-PERT runs, starting{' '}
        {short(START)}, 2026.
      </p>

      <div className="rounded-lg border border-sky-500/40 p-3">
        <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
          <Badge n="1" className="bg-sky-500" />
          Three-point estimates, in days: optimistic to pessimistic, most likely, PERT mean
        </p>
        <div className="mt-3 space-y-1.5">
          {R.tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-xs sm:w-40">{t.name}</span>
              <div className="relative h-4 flex-1">
                <div className="absolute inset-y-1.5 inset-x-0 rounded-full bg-fd-border/60" />
                <div
                  className="absolute inset-y-0.5 rounded-sm bg-sky-500/30"
                  style={{ left: `${(t.o / SCALE_MAX) * 100}%`, width: `${((t.p - t.o) / SCALE_MAX) * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 w-0.5 bg-sky-600 dark:bg-sky-400"
                  style={{ left: `${(t.m / SCALE_MAX) * 100}%` }}
                />
                <div
                  className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500"
                  style={{ left: `${(pertMean(t) / SCALE_MAX) * 100}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-right font-mono text-[11px] text-fd-muted-foreground">
                {t.o}·{t.m}·{t.p}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-fd-muted-foreground">
          Bar = optimistic to pessimistic, <span className="text-sky-600 dark:text-sky-400">line</span> = most likely,{' '}
          <span className="text-amber-600 dark:text-amber-400">dot</span> = PERT mean (O + 4M + P) / 6. Every dot sits
          right of its line: the estimates skew late. Scale 0–{SCALE_MAX} days.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="2" className="bg-amber-500" />
            The merge at Prototype Build
          </p>
          <div className="mt-2 space-y-1.5 text-xs">
            {MERGE.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="w-32 shrink-0 truncate">{t.name}</span>
                <div className="relative h-3 flex-1 rounded-sm bg-fd-border/40">
                  <div className="h-full rounded-sm bg-amber-500/70" style={{ width: `${t.criticality * 100}%` }} />
                </div>
                <span className="w-9 shrink-0 text-right font-mono font-semibold">{pc(t.criticality)}</span>
              </div>
            ))}
            <p className="pt-1 text-[11px] text-fd-muted-foreground">Share of runs on the longest path (criticality)</p>
          </div>
          <div className="mt-3 space-y-1 font-mono text-xs">
            <p className="flex justify-between gap-2 rounded px-1.5 py-1">
              <span>PERT means, one path</span>
              <span>{PERT_PATH_DAYS.toFixed(1)} d</span>
            </p>
            <p className="flex justify-between gap-2 rounded bg-amber-500/15 px-1.5 py-1 font-semibold">
              <span>Simulated mean</span>
              <span>{R.meanDays.toFixed(1)} d</span>
            </p>
            <p className="flex justify-between gap-2 px-1.5 py-1 text-amber-700 dark:text-amber-300">
              <span>Merge bias</span>
              <span>+{(R.meanDays - PERT_PATH_DAYS).toFixed(1)} d</span>
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-violet-500/40 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="3" className="bg-violet-500" />
            Probability Finished By, the S-curve
          </p>
          <SCurve />
          <div className="mt-1 grid grid-cols-3 gap-1 text-center text-[11px]">
            <div className="rounded bg-red-500/10 px-1 py-1">
              <p className="font-semibold text-red-700 dark:text-red-300">{short(PLAN)}</p>
              <p className="text-fd-muted-foreground">Plan, {pc(ON_PLAN)}</p>
            </div>
            <div className="rounded bg-amber-500/10 px-1 py-1">
              <p className="font-semibold text-amber-700 dark:text-amber-300">{short(P50)}</p>
              <p className="text-fd-muted-foreground">P50</p>
            </div>
            <div className="rounded bg-violet-500/10 px-1 py-1">
              <p className="font-semibold text-violet-700 dark:text-violet-300">{short(P80)}</p>
              <p className="text-fd-muted-foreground">P80</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Samples</span> — each run draws one duration per
            task with <span className="font-mono">BETA.INV(RAND(), …)</span> between its optimistic and pessimistic
            values. Because the tails are longer on the late side, the average draw lands later than the most-likely
            value for every task.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Longest path</span> — Prototype Build waits
            for the later of the three tasks before it. Subsystems A and B tie in the plan, but B&apos;s longer tail
            makes it the driver in {pc(MERGE[1].criticality)} of runs, and the race between them adds{' '}
            {(R.meanDays - PERT_PATH_DAYS).toFixed(1)} days that adding up PERT means along one path never shows.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">Percentiles</span> — sorting the{' '}
            {R.iterations.toLocaleString('en-US')} finish dates gives the curve. The plan date ({short(PLAN)}, the sum
            of most-likely durations) sits low on it, at {pc(ON_PLAN)}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Result</span> — committing to P80 ({short(P80)}) means asking
            for {P80 - PLAN} days of schedule reserve over the plan, and it&apos;s a date the program beats four times
            in five.
          </p>
        </div>
      </div>
    </div>
  );
}
