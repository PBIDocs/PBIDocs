import { cn } from '@/lib/cn';

// fmea_assessments.csv from the FMEA dashboard tutorial: one row per failure mode, per assessment date.
const ASSESSMENTS = [
  { fm: 'FM-01', date: '2026-05-01', s: 7, o: 6, d: 5 },
  { fm: 'FM-01', date: '2026-07-01', s: 7, o: 2, d: 5 },
  { fm: 'FM-02', date: '2026-05-01', s: 6, o: 3, d: 7 },
  { fm: 'FM-03', date: '2026-05-01', s: 9, o: 1, d: 3 },
  { fm: 'FM-04', date: '2026-05-01', s: 8, o: 4, d: 4 },
  { fm: 'FM-05', date: '2026-05-01', s: 5, o: 4, d: 3 },
  { fm: 'FM-06', date: '2026-05-01', s: 4, o: 2, d: 5 },
  { fm: 'FM-06', date: '2026-07-01', s: 4, o: 5, d: 5 },
  { fm: 'FM-07', date: '2026-05-01', s: 6, o: 3, d: 4 },
  { fm: 'FM-08', date: '2026-05-01', s: 7, o: 2, d: 2 },
];

type Assessment = (typeof ASSESSMENTS)[number];
type Priority = 'High' | 'Medium' | 'Low';

const IDS = [...new Set(ASSESSMENTS.map((a) => a.fm))];
const rowsFor = (id: string) => ASSESSMENTS.filter((a) => a.fm === id);
const latest = (id: string) => rowsFor(id).reduce((a, b) => (b.date > a.date ? b : a));
const first = (id: string) => rowsFor(id).reduce((a, b) => (b.date < a.date ? b : a));
const rpn = (a: Assessment) => a.s * a.o * a.d;

// Same order as the page's Action Priority SWITCH(TRUE(), ...): the severity override is checked first.
const priorityOf = (a: Assessment): { priority: Priority; bySeverity: boolean } => {
  if (a.s >= 9) return { priority: 'High', bySeverity: true };
  const r = rpn(a);
  return { priority: r >= 100 ? 'High' : r >= 50 ? 'Medium' : 'Low', bySeverity: false };
};

const CURRENT = IDS.map((id) => {
  const a = latest(id);
  return { id, a, rpn: rpn(a), ...priorityOf(a) };
}).sort((x, y) => y.rpn - x.rpn);

const REASSESSED = IDS.filter((id) => rowsFor(id).length > 1).map((id) => {
  const before = first(id);
  const after = latest(id);
  const reduction = (rpn(before) - rpn(after)) / rpn(before);
  return { id, before, after, reduction };
});

const SCALE_MAX = 140;
const THRESHOLDS = [50, 100];

const PRIORITY_STYLE: Record<Priority, { bar: string; pill: string }> = {
  High: { bar: 'bg-red-500/70', pill: 'bg-red-500/15 text-red-700 dark:text-red-300' },
  Medium: { bar: 'bg-amber-500/70', pill: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  Low: { bar: 'bg-emerald-500/70', pill: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
};

const pct = (n: number) => `${n > 0 ? '−' : '+'}${Math.round(Math.abs(n) * 100)}%`;

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

function Sod({ a, compare }: { a: Assessment; compare?: Assessment }) {
  const part = (label: string, v: number, was?: number) => (
    <span className={cn(was !== undefined && was !== v && 'rounded bg-violet-500/20 px-0.5 font-semibold')}>
      {label}
      {v}
    </span>
  );
  return (
    <span className="font-mono">
      {part('S', a.s, compare?.s)} × {part('O', a.o, compare?.o)} × {part('D', a.d, compare?.d)}
    </span>
  );
}

export function FmeaAnatomyDiagram() {
  const high = CURRENT.filter((c) => c.priority === 'High');
  const overridden = CURRENT.find((c) => c.bySeverity)!;
  const lowest = CURRENT[CURRENT.length - 1];

  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of FMEA action priority
      </p>
      <p className="mb-4 text-xs text-fd-muted-foreground">
        The FMEA dashboard tutorial&apos;s dataset, all {IDS.length} failure modes, rated 1–10.
      </p>

      <div className="rounded-lg border border-sky-500/40 p-3">
        <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
          <Badge n="1" className="bg-sky-500" />
          Current RPN = S × O × D, sorted highest first
        </p>

        <div className="relative mt-3">
          {THRESHOLDS.map((t) => (
            <div
              key={t}
              className="pointer-events-none absolute top-0 bottom-0 border-l border-dashed border-fd-muted-foreground/50"
              style={{ left: `calc(3.5rem + (100% - 3.5rem - 5.5rem) * ${t / SCALE_MAX})` }}
            >
              <span className="absolute -top-3.5 -translate-x-1/2 font-mono text-[10px] text-fd-muted-foreground">{t}</span>
            </div>
          ))}
          <div className="space-y-1.5 pt-1">
            {CURRENT.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="w-12 shrink-0 font-mono text-xs">{c.id}</span>
                <div className="relative h-5 flex-1">
                  <div
                    className={cn('h-full rounded-sm', PRIORITY_STYLE[c.priority].bar)}
                    style={{ width: `${(c.rpn / SCALE_MAX) * 100}%` }}
                  />
                </div>
                <span className="flex w-20 shrink-0 items-center justify-end gap-1">
                  <span className="font-mono text-xs font-semibold">{c.rpn}</span>
                  {c.bySeverity ? (
                    <Badge n="2" className="bg-red-500" />
                  ) : (
                    <span className={cn('rounded px-1 text-[10px] font-semibold', PRIORITY_STYLE[c.priority].pill)}>
                      {c.priority[0]}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-fd-muted-foreground">
          Bar color = Action Priority: <span className="text-red-600 dark:text-red-400">High</span>,{' '}
          <span className="text-amber-600 dark:text-amber-400">Medium</span>,{' '}
          <span className="text-emerald-600 dark:text-emerald-400">Low</span>. Dashed lines are the RPN thresholds.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="2" className="bg-red-500" />
            Severity override on {overridden.id}
          </p>
          <div className="mt-2 space-y-1 font-mono text-xs">
            <p className="flex items-center justify-between gap-2 rounded bg-red-500/10 px-1.5 py-1">
              <span>Severity {overridden.a.s} ≥ 9</span>
              <span className="font-sans font-semibold text-red-700 dark:text-red-300">High — stops here</span>
            </p>
            {[100, 50].map((t) => (
              <p key={t} className="flex items-center justify-between gap-2 px-1.5 py-1 opacity-40">
                <span>RPN {overridden.rpn} ≥ {t}</span>
                <span className="font-sans">never checked</span>
              </p>
            ))}
            <p className="flex items-center justify-between gap-2 px-1.5 py-1 opacity-40">
              <span>RPN {overridden.rpn} &gt; 0</span>
              <span className="font-sans">would say Low</span>
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-violet-500/40 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="3" className="bg-violet-500" />
            Initial vs. current RPN
          </p>
          <div className="mt-2 space-y-2">
            {REASSESSED.map((r) => (
              <div key={r.id} className="rounded-md border border-fd-border bg-fd-background p-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold">{r.id}</span>
                  <span
                    className={cn(
                      'font-mono font-semibold',
                      r.reduction > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                    )}
                  >
                    {rpn(r.before)} → {rpn(r.after)} ({pct(r.reduction)})
                  </span>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-fd-muted-foreground">
                  <Sod a={r.before} /> → <Sod a={r.after} compare={r.before} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Current RPN</span> — Severity × Occurrence ×
            Detection from each failure mode&apos;s <strong>latest</strong> assessment. A reviewer reading this chart
            top-down would stop well before {lowest.id}, the shortest bar.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">Severity override</span> — {overridden.id} is{' '}
            <Sod a={overridden.a} /> = {overridden.rpn}, an RPN the thresholds alone would call Low. Because{' '}
            <span className="font-mono">SWITCH(TRUE(), …)</span> checks Severity ≥ 9 first and stops at the first match,
            it&apos;s flagged High anyway.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">Initial vs. current</span> — the first and
            latest rows, compared. {REASSESSED[0].id}&apos;s corrective action cut Occurrence and the RPN fell{' '}
            {Math.round(REASSESSED[0].reduction * 100)}%; {REASSESSED[1].id} got <strong>worse</strong>, so its RPN
            Reduction % is negative, which the register should surface rather than hide.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Result</span> — {high.length} High-priority failure modes (
            {high.map((c) => c.id).join(', ')}), including {lowest.id}, the lowest RPN on the whole register. Sorting by
            RPN alone would have put it dead last.
          </p>
        </div>
      </div>
    </div>
  );
}
