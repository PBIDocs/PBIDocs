import { cn } from '@/lib/cn';
import { ParetoChart } from '@/components/pareto-chart';
import { compute, parseItems, TUTORIAL_ITEMS, type ParetoRow } from '@/lib/pareto';

// The Pareto tutorial's October defect log, run through the Pareto Chart
// Builder's own engine, so every number here matches the tool and the text.
const THRESHOLD = 80;
const { items } = parseItems(TUTORIAL_ITEMS);
const COUNT = compute(items, { metric: 'count', threshold: THRESHOLD, otherLast: true });
const COST = compute(items, { metric: 'cost', threshold: THRESHOLD, otherLast: true });
const FOCUS = COST.rows[0].cause;
const find = (rows: ParetoRow[], cause: string) => rows.find((r) => r.cause === cause)!;
const focusCount = find(COUNT.rows, FOCUS);
const focusCost = find(COST.rows, FOCUS);
const lastVital = COUNT.rows[COUNT.vitalCount - 1];
const beforeLast = COUNT.rows[COUNT.vitalCount - 2];
const other = COUNT.rows.find((r) => r.isOther)!;
const ties = COUNT.rows.filter((r) => r.tied);
const dropped = COUNT.rows.filter((r) => r.vital && !find(COST.rows, r.cause).vital);

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const usd = (v: number) => `$${v.toLocaleString('en-US')}`;

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

export function ParetoAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">Anatomy of a Pareto chart</p>
      <p className="mb-4 text-xs text-fd-muted-foreground">
        The tutorial&apos;s {COUNT.total} October defects across {COUNT.rows.length} causes, ranked by count.
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background/40 p-3">
        <ParetoChart rows={COUNT.rows} threshold={THRESHOLD} annotate className="hidden sm:block" label="Pareto chart of defects by count" />
        <ParetoChart rows={COUNT.rows} threshold={THRESHOLD} annotate compact className="sm:hidden" label="Pareto chart of defects by count" />
        <p className="mt-1 text-[11px] leading-snug text-fd-muted-foreground sm:hidden">
          Bars are numbered by rank: {COUNT.rows.map((r) => `${r.rank} ${r.cause}`).join(', ')}.
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Pareto Rank</span> — bars sorted largest first by
            a rank measure, not by the count itself. {COUNT.rows[0].cause} leads with {COUNT.rows[0].value} defects,{' '}
            {pct(COUNT.rows[0].share)} of the total.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Cumulative %</span> — each point is its bar plus
            every bar to its left, over the total, on a right axis fixed at 0–100%. It rises fast, then flattens: the
            shape that makes a Pareto chart worth drawing.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">Vital Few</span> — {beforeLast.cause} leaves the
            line at {pct(beforeLast.cumShare)}, short of {THRESHOLD}%, so the next cause, {lastVital.cause}, is in:
            the top {COUNT.vitalCount} of {COUNT.rows.length} causes cover {pct(COUNT.vitalShare)}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-slate-500" />
          <p>
            <span className="font-mono text-slate-600 dark:text-slate-400">Other last</span> — {other.value} defects is
            more than {COUNT.rows[other.rank - 2].cause}&apos;s {COUNT.rows[other.rank - 2].value}, but a bucket of small
            causes isn&apos;t something you can fix, so it ranks last and the line ends on it at 100%.
          </p>
        </div>
        {ties.length > 1 && (
          <div className="flex items-start gap-2">
            <Badge n="5" className="mt-0.5 bg-violet-500" />
            <p>
              <span className="font-mono text-violet-600 dark:text-violet-400">Tie-break</span> — {ties[0].cause} and{' '}
              {ties[1].cause} both have {ties[0].value}. Ranked A to Z, they get{' '}
              {pct(ties[0].cumShare)} and {pct(ties[1].cumShare)}; without a tie-break both would show{' '}
              {pct(ties[1].cumShare)}, and the line would go flat.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-lg border border-violet-500/40 bg-violet-500/5 p-3">
        <p className="text-xs text-fd-muted-foreground">
          <span className="font-semibold text-violet-700 dark:text-violet-300">Same defects, ranked by cost.</span>{' '}
          {FOCUS} is outlined in both.
        </p>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { title: `By count: ${COUNT.total} defects`, r: COUNT, fmt: (v: number) => String(v) },
            { title: `By rework cost: ${usd(COST.total)}`, r: COST, fmt: usd },
          ].map((c) => (
            <div key={c.title}>
              <p className="text-[11px] font-semibold text-fd-muted-foreground">{c.title}</p>
              <ParetoChart rows={c.r.rows} threshold={THRESHOLD} format={c.fmt} compact highlight={FOCUS} className="mt-1" label={c.title} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-fd-muted-foreground">
          {FOCUS} ranks #{focusCount.rank} by count with {pct(focusCount.share)} of the defects, and #{focusCost.rank}{' '}
          by cost with {pct(focusCost.share)} of the rework spend. {dropped.map((r) => r.cause).join(' and ')}{' '}
          {dropped.length === 1 ? 'drops' : 'drop'} out of the vital few: common, but cheap to fix.
        </p>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs">
        <Badge n="✓" className="mt-0.5 bg-fd-primary" />
        <p>
          <span className="font-mono text-fd-primary">Result</span> — the count chart says fix {COUNT.rows[0].cause}{' '}
          first; the cost chart says {FOCUS}. Same data, same measures, one base measure swapped.
        </p>
      </div>
    </div>
  );
}
