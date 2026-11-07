// Pure logic for the Schedule Risk Monte Carlo tool. Each task has a
// three-point duration estimate (optimistic, most likely, pessimistic) and
// finish-to-start predecessors. Every iteration samples a duration per task,
// runs a forward and backward pass through the network, and records the
// project finish and which tasks had zero float (were on the critical path).
//
// Percentiles are taken over finish dates as day serials with linear
// interpolation and rounded up, the same as ROUNDUP(PERCENTILEX.INC(...), 0) in
// DAX, so the exported CSV gives identical P-values in Power BI.

export type Distribution = 'pert' | 'triangular';
export type DayMode = 'calendar' | 'working';

export interface Task {
  id: string;
  name: string;
  o: number;
  m: number;
  p: number;
  preds: string[];
}

export interface TaskStats extends Task {
  mean: number;
  // Share of iterations in which the task had zero total float.
  criticality: number;
  // Whether the task is on the critical path of the most-likely plan.
  planCritical: boolean;
}

export interface SimulationResult {
  iterations: number;
  // Project duration of each iteration in days (fractional).
  durations: Float64Array;
  // Finish date of each iteration as a UTC day serial (days since 1970-01-01).
  finishSerials: Int32Array;
  // Finish serials sorted ascending, for percentiles and the S-curve.
  sorted: Int32Array;
  planDays: number;
  planSerial: number;
  meanDays: number;
  tasks: TaskStats[];
}

export const TUTORIAL_TASKS = `TaskID, TaskName, Optimistic, MostLikely, Pessimistic, Predecessors
1, Requirements Analysis, 30, 40, 60,
2, System Architecture, 35, 45, 70, 1
3, Subsystem A Design, 50, 60, 90, 2
4, Subsystem B Design, 45, 60, 100, 2
5, Integration Planning, 20, 25, 35, 2
6, Prototype Build, 50, 60, 95, 3;4;5
7, Verification & Test, 40, 50, 80, 6
8, Documentation, 20, 30, 45, 6`;

export const DEFAULT_START = '2026-01-05';

// ---------- parsing ----------

function splitCells(line: string) {
  return (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.trim());
}

function num(cell: string | undefined) {
  if (cell === undefined || cell === '') return NaN;
  return Number(cell.replace(/[\s,d]/gi, ''));
}

// One task per line: ID, name, O, M, P, predecessors (separated by ; or spaces,
// or spread over the remaining cells). A first line with no numbers is a header.
export function parseTasks(text: string): { tasks: Task[]; errors: string[] } {
  const tasks: Task[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  let first = true;

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const n = i + 1;
    const cells = splitCells(line);
    const isFirst = first;
    first = false;
    if (isFirst && !/\d/.test(cells.slice(2, 5).join(''))) return;

    const [id, name, oc, mc, pc, ...rest] = cells;
    if (!id) {
      errors.push(`Line ${n}: starts with an empty task ID.`);
      return;
    }
    const o = num(oc);
    const m = num(mc);
    const p = num(pc);
    if (![o, m, p].every(Number.isFinite)) {
      errors.push(`Line ${n} (${id}): needs three numeric durations, optimistic, most likely, pessimistic.`);
      return;
    }
    if (o < 0 || !(o <= m && m <= p)) {
      errors.push(`Line ${n} (${id}): durations must satisfy 0 ≤ optimistic ≤ most likely ≤ pessimistic.`);
      return;
    }
    if (seen.has(id)) {
      errors.push(`Line ${n}: task ID ${id} is listed twice; the second is ignored.`);
      return;
    }
    seen.add(id);
    const preds = rest
      .join(';')
      .split(/[;\s|]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    tasks.push({ id, name: name || id, o, m, p, preds: [...new Set(preds)] });
  });

  for (const t of tasks) {
    const unknown = t.preds.filter((pid) => !seen.has(pid));
    if (unknown.length) errors.push(`Task ${t.id}: predecessor ${unknown.join(', ')} isn't in the list and is ignored.`);
    if (t.preds.includes(t.id)) errors.push(`Task ${t.id}: lists itself as a predecessor; ignored.`);
    t.preds = t.preds.filter((pid) => seen.has(pid) && pid !== t.id);
  }

  return { tasks, errors };
}

// Topological order (Kahn). Returns null and the tasks involved if there's a loop.
export function orderTasks(tasks: Task[]): { order: number[] } | { cycle: string[] } {
  const index = new Map(tasks.map((t, i) => [t.id, i]));
  const indeg = tasks.map((t) => t.preds.length);
  const succ: number[][] = tasks.map(() => []);
  tasks.forEach((t, i) => t.preds.forEach((p) => succ[index.get(p)!].push(i)));
  const queue = indeg.flatMap((d, i) => (d === 0 ? [i] : []));
  const order: number[] = [];
  while (queue.length) {
    const i = queue.shift()!;
    order.push(i);
    for (const s of succ[i]) if (--indeg[s] === 0) queue.push(s);
  }
  if (order.length < tasks.length) return { cycle: tasks.filter((_, i) => indeg[i] > 0).map((t) => t.id) };
  return { order };
}

// ---------- random numbers ----------

// mulberry32: small, fast, seedable, so the same inputs give the same result.
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(rand: () => number) {
  let u = 0;
  while (u === 0) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

// Marsaglia–Tsang; PERT shape parameters are always ≥ 1, which it needs.
function gamma(shape: number, rand: () => number) {
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      x = normal(rand);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rand();
    if (u < 1 - 0.0331 * x ** 4) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

export function pertMean(t: Pick<Task, 'o' | 'm' | 'p'>) {
  return (t.o + 4 * t.m + t.p) / 6;
}

function sampler(t: Task, dist: Distribution, rand: () => number): () => number {
  const { o, m, p } = t;
  const range = p - o;
  if (range === 0) return () => m;
  if (dist === 'triangular') {
    const f = (m - o) / range;
    return () => {
      const u = rand();
      return u < f ? o + Math.sqrt(u * range * (m - o)) : p - Math.sqrt((1 - u) * range * (p - m));
    };
  }
  const alpha = 1 + (4 * (m - o)) / range;
  const beta = 1 + (4 * (p - m)) / range;
  return () => {
    const x = gamma(alpha, rand);
    const y = gamma(beta, rand);
    return o + (x / (x + y)) * range;
  };
}

// ---------- dates ----------

const DAY_MS = 86_400_000;

export function toSerial(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(ms) ? Math.round(ms / DAY_MS) : null;
}

export function fromSerial(serial: number): string {
  return new Date(serial * DAY_MS).toISOString().slice(0, 10);
}

export function formatDate(serial: number): string {
  return new Date(serial * DAY_MS).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isWeekend(serial: number) {
  const dow = new Date(serial * DAY_MS).getUTCDay();
  return dow === 0 || dow === 6;
}

// Work starts at the beginning of the start date and a duration of d days ends
// at the close of day ceil(d), so a 1-day task finishes on its start date.
// In working-day mode the start rolls forward to a weekday and weekends are skipped.
export function finishSerial(startSerial: number, days: number, mode: DayMode): number {
  const n = Math.max(1, Math.ceil(days - 1e-9));
  if (mode === 'calendar') return startSerial + n - 1;
  let s = startSerial;
  while (isWeekend(s)) s++;
  let left = n - 1;
  // Jump whole weeks, then walk the remainder.
  s += Math.floor(left / 5) * 7;
  left %= 5;
  while (left > 0) {
    s++;
    if (!isWeekend(s)) left--;
  }
  return s;
}

// ---------- simulation ----------

const EPS = 1e-9;

interface Pass {
  finish: number;
  critical: boolean[];
}

function cpm(tasks: Task[], order: number[], dur: number[], index: Map<string, number>): Pass {
  const n = tasks.length;
  const ef = new Array<number>(n);
  for (const i of order) {
    let es = 0;
    for (const p of tasks[i].preds) es = Math.max(es, ef[index.get(p)!]);
    ef[i] = es + dur[i];
  }
  let finish = 0;
  for (let i = 0; i < n; i++) finish = Math.max(finish, ef[i]);
  const lf = new Array<number>(n).fill(finish);
  for (let k = order.length - 1; k >= 0; k--) {
    const i = order[k];
    const ls = lf[i] - dur[i];
    for (const p of tasks[i].preds) {
      const j = index.get(p)!;
      if (ls < lf[j]) lf[j] = ls;
    }
  }
  return { finish, critical: ef.map((e, i) => lf[i] - e < EPS * Math.max(1, finish)) };
}

export function simulate(
  tasks: Task[],
  order: number[],
  opts: { iterations: number; dist: Distribution; seed: number; startSerial: number; dayMode: DayMode },
): SimulationResult {
  const { iterations, dist, seed, startSerial, dayMode } = opts;
  const index = new Map(tasks.map((t, i) => [t.id, i]));
  const rand = rng(seed);
  const samplers = tasks.map((t) => sampler(t, dist, rand));
  const n = tasks.length;

  const durations = new Float64Array(iterations);
  const finishSerials = new Int32Array(iterations);
  const critCount = new Array<number>(n).fill(0);
  const durSum = new Array<number>(n).fill(0);
  const dur = new Array<number>(n);
  let total = 0;

  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < n; i++) {
      dur[i] = samplers[i]();
      durSum[i] += dur[i];
    }
    const { finish, critical } = cpm(tasks, order, dur, index);
    durations[it] = finish;
    finishSerials[it] = finishSerial(startSerial, finish, dayMode);
    total += finish;
    for (let i = 0; i < n; i++) if (critical[i]) critCount[i]++;
  }

  const plan = cpm(
    tasks,
    order,
    tasks.map((t) => t.m),
    index,
  );
  const sorted = Int32Array.from(finishSerials).sort();

  return {
    iterations,
    durations,
    finishSerials,
    sorted,
    planDays: plan.finish,
    planSerial: finishSerial(startSerial, plan.finish, dayMode),
    meanDays: iterations ? total / iterations : 0,
    tasks: tasks.map((t, i) => ({
      ...t,
      mean: iterations ? durSum[i] / iterations : t.m,
      criticality: iterations ? critCount[i] / iterations : 0,
      planCritical: plan.critical[i],
    })),
  };
}

// Excel/DAX PERCENTILE.INC over sorted values, rounded up to a whole day.
export function percentileSerial(sorted: Int32Array, k: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  const pos = (n - 1) * k;
  const lo = Math.floor(pos);
  const hi = Math.min(n - 1, lo + 1);
  const v = sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  return Math.ceil(v - 1e-9);
}

// Share of iterations finishing on or before the given date.
export function probabilityBy(sorted: Int32Array, serial: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] <= serial) lo = mid + 1;
    else hi = mid;
  }
  return sorted.length ? lo / sorted.length : 0;
}

// ---------- exports ----------

export function simulationsCsv(r: SimulationResult): string {
  const rows = ['Iteration,DurationDays,FinishDate'];
  for (let i = 0; i < r.iterations; i++) {
    rows.push(`${i + 1},${r.durations[i].toFixed(2)},${fromSerial(r.finishSerials[i])}`);
  }
  return rows.join('\n');
}

function csvCell(s: string) {
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function tasksCsv(r: SimulationResult): string {
  const rows = ['TaskID,TaskName,Optimistic,MostLikely,Pessimistic,Predecessors,MeanDuration,CriticalityIndex'];
  for (const t of r.tasks) {
    rows.push(
      [
        csvCell(t.id),
        csvCell(t.name),
        t.o,
        t.m,
        t.p,
        csvCell(t.preds.join(';')),
        t.mean.toFixed(2),
        t.criticality.toFixed(4),
      ].join(','),
    );
  }
  return rows.join('\n');
}

export function generateDax(opts: { planIso: string; targetIso: string | null }): string {
  const ymd = (iso: string) => iso.split('-').map(Number).join(', ');
  const target = opts.targetIso ?? opts.planIso;
  return `-- Load schedule_simulations.csv as a table named Simulations
-- (FinishDate as Date) and schedule_tasks.csv as Tasks.

-- Disconnected calendar for the S-curve and the target-date slicer.
-- New table; don't relate it to Simulations.
FinishCalendar =
CALENDAR (
    MIN ( Simulations[FinishDate] ) - 14,
    MAX ( Simulations[FinishDate] ) + 14
)

Simulated Runs = COUNTROWS ( Simulations )

-- Share of runs finished on or before the date in context: the S-curve on a
-- line chart with FinishCalendar[Date] on the axis, or the on-time
-- probability on a card when a slicer picks one date.
Probability Finished By =
VAR StatusDate = MAX ( FinishCalendar[Date] )
RETURN
    DIVIDE (
        COUNTROWS ( FILTER ( Simulations, Simulations[FinishDate] <= StatusDate ) ),
        [Simulated Runs]
    )

-- Fixed-date version for a KPI card, no slicer needed.
Probability On Target =
VAR TargetDate = DATE ( ${ymd(target)} )
RETURN
    DIVIDE (
        COUNTROWS ( FILTER ( Simulations, Simulations[FinishDate] <= TargetDate ) ),
        [Simulated Runs]
    )

P50 Finish = CONVERT ( ROUNDUP ( PERCENTILEX.INC ( Simulations, Simulations[FinishDate] * 1, 0.5 ), 0 ), DATETIME )

P80 Finish = CONVERT ( ROUNDUP ( PERCENTILEX.INC ( Simulations, Simulations[FinishDate] * 1, 0.8 ), 0 ), DATETIME )

P90 Finish = CONVERT ( ROUNDUP ( PERCENTILEX.INC ( Simulations, Simulations[FinishDate] * 1, 0.9 ), 0 ), DATETIME )

-- Schedule reserve needed to reach 80% confidence over the plan date.
P80 Buffer Days = DATEDIFF ( DATE ( ${ymd(opts.planIso)} ), [P80 Finish], DAY )

-- For a bar chart of Tasks[TaskName]: how often each task drove the finish.
Criticality Index = AVERAGE ( Tasks[CriticalityIndex] )`;
}
