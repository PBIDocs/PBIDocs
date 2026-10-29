import { cn } from '@/lib/cn';

// Monthly [Total Sales] in $K, from the page's two examples: Nov–Feb (within-year table) and Jan–Mar (intro table).
const MONTHS = [
  { y: 2025, label: 'Nov', sales: 40 },
  { y: 2025, label: 'Dec', sales: 35 },
  { y: 2026, label: 'Jan', sales: 50 },
  { y: 2026, label: 'Feb', sales: 60 },
  { y: 2026, label: 'Mar', sales: 45 },
];

// The visual row the zoom panel follows.
const CURRENT = 3;

// FILTER(ALL(DimDate[Date]), ...) for visual row r: which of ALL()'s dates survive.
const keepPlain = (r: number, i: number) => i <= r;
const keepWithinYear = (r: number, i: number) => i <= r && MONTHS[i].y === MONTHS[r].y;

const totalFor = (r: number, keep: (r: number, i: number) => boolean) =>
  MONTHS.reduce((s, mo, i) => s + (keep(r, i) ? mo.sales : 0), 0);

const fmtK = (n: number) => `$${n}K`;
const name = (i: number) => `${MONTHS[i].label} '${String(MONTHS[i].y).slice(2)}`;

const current = MONTHS[CURRENT];
const plainKept = MONTHS.map((_, i) => i).filter((i) => keepPlain(CURRENT, i));
const yearKept = MONTHS.map((_, i) => i).filter((i) => keepWithinYear(CURRENT, i));

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

function Staircase({
  title,
  badge,
  keep,
  fill,
  border,
}: {
  title: React.ReactNode;
  badge?: React.ReactNode;
  keep: (r: number, i: number) => boolean;
  fill: string;
  border: string;
}) {
  return (
    <div className={cn('rounded-lg border p-3', border)}>
      <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
        {badge}
        {title}
      </p>
      <table className="mt-2 w-full border-collapse text-sm">
        <thead>
          <tr className="text-[10px] uppercase text-fd-muted-foreground">
            <th className="px-1 py-1 text-left font-normal">Row</th>
            {MONTHS.map((mo, i) => (
              <th key={i} className="px-0.5 py-1 text-center font-normal">
                {mo.label}
                <span className="block text-[9px] opacity-70">{String(mo.y).slice(2)}</span>
              </th>
            ))}
            <th className="px-1 py-1 text-right font-normal">Total</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {MONTHS.map((_, r) => (
            <tr key={r} className={cn('border-t border-fd-border', r === CURRENT && 'bg-violet-500/10')}>
              <td className="px-1 py-1 font-sans text-xs whitespace-nowrap">{name(r)}</td>
              {MONTHS.map((mo, i) => {
                const kept = keep(r, i);
                return (
                  <td key={i} className="px-0.5 py-1">
                    <div
                      className={cn(
                        'flex h-6 items-center justify-center rounded text-[10px]',
                        kept ? cn(fill, 'text-white') : 'bg-fd-foreground/10 text-fd-muted-foreground/50',
                        i === r && 'ring-2 ring-violet-500 ring-inset',
                      )}
                    >
                      {kept ? mo.sales : '·'}
                    </div>
                  </td>
                );
              })}
              <td className="px-1 py-1 text-right font-semibold text-fd-primary">{fmtK(totalFor(r, keep))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RunningTotalAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a running total
      </p>

      <div className="overflow-x-auto rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm whitespace-pre">
        <span className="text-fd-muted-foreground">Running Total =</span>
        {'\nCALCULATE([Total Sales],\n  FILTER('}
        <span className="text-sky-600 dark:text-sky-400">ALL(DimDate[Date])</span>
        {',\n    '}
        <span className="text-amber-600 dark:text-amber-400">
          DimDate[Date] {'<='} <span className="text-violet-600 dark:text-violet-400">MAX(DimDate[Date])</span>
        </span>
        {'\n  ))'}
      </div>

      {/* Zoom: one visual row, step by step */}
      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">Evaluating the {name(CURRENT)} row of the visual</p>
        <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
          <div className="rounded-md border border-sky-500/40 p-2">
            <p className="flex items-center gap-1.5 font-semibold">
              <Badge n="1" className="bg-sky-500" />
              ALL() reopens the dates
            </p>
            <p className="mt-1 text-fd-muted-foreground">
              Visual context: <span className="font-mono whitespace-nowrap">{name(CURRENT)}</span> only → ALL(): all {MONTHS.length}{' '}
              months
            </p>
          </div>
          <div className="rounded-md border border-violet-500/40 p-2">
            <p className="flex items-center gap-1.5 font-semibold">
              <Badge n="2" className="bg-violet-500" />
              MAX() reads the row
            </p>
            <p className="mt-1 text-fd-muted-foreground">
              Evaluated in the visual&apos;s context, not ALL()&apos;s: <span className="font-mono whitespace-nowrap">{name(CURRENT)}</span>
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 p-2">
            <p className="flex items-center gap-1.5 font-semibold">
              <Badge n="3" className="bg-amber-500" />
              {'<='} keeps the past
            </p>
            <p className="mt-1 text-fd-muted-foreground">
              {plainKept.length} of {MONTHS.length} dates survive:{' '}
              <span className="font-mono">{plainKept.map((i) => MONTHS[i].sales).join(' + ')}</span>
            </p>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 font-mono text-lg font-semibold text-fd-primary">
          <Badge n="✓" className="bg-fd-primary" />
          {fmtK(totalFor(CURRENT, keepPlain))}
        </p>
      </div>

      {/* Every row: the window grows, and with the year condition it restarts */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Staircase
          title="Running Total — every visual row"
          keep={keepPlain}
          fill="bg-amber-500/80"
          border="border-amber-500/40"
        />
        <Staircase
          title={
            <>
              Within Year — adds <span className="font-mono">Year = MAX(Year)</span>
            </>
          }
          badge={<Badge n="4" className="bg-emerald-500" />}
          keep={keepWithinYear}
          fill="bg-emerald-500/80"
          border="border-emerald-500/40"
        />
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">ALL(DimDate[Date])</span> — the visual row has
            already filtered the dates down to one month. ALL() hands FILTER() every date instead. Without it, FILTER()
            only sees {name(CURRENT)}, and the &quot;running total&quot; is just that month&apos;s{' '}
            {fmtK(current.sales)}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">MAX(DimDate[Date])</span> — the outlined
            cell in each row. It runs inside FILTER()&apos;s row loop, but row context doesn&apos;t filter anything, and
            ALL() only shaped FILTER()&apos;s input table, not the filter context. So MAX() still sees the visual&apos;s
            filter and returns the current row&apos;s date, not the last date in the table.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">{'<='}</span> — tested against every date
            ALL() returned, so each row keeps one more month than the row above it. The grey cells were scanned and
            rejected: {MONTHS.length} rows × {MONTHS.length} dates = {MONTHS.length ** 2} comparisons here, which is why
            this pattern slows down on long date columns.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {'&& DimDate[Year] = MAX(DimDate[Year])'}
            </span>{' '}
            — a second condition that rejects earlier years too. The staircase restarts in January, so {name(CURRENT)}{' '}
            keeps only {yearKept.map((i) => MONTHS[i].label).join(' + ')} = {fmtK(totalFor(CURRENT, keepWithinYear))}{' '}
            instead of {fmtK(totalFor(CURRENT, keepPlain))}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Result</span> — CALCULATE() replaces the visual&apos;s date
            filter with the surviving dates and evaluates <span className="font-mono">[Total Sales]</span> over them.
          </p>
        </div>
      </div>
    </div>
  );
}
