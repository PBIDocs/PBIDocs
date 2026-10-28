import { cn } from '@/lib/cn';

const MONTHS = ['Jan', 'Feb', 'Mar'] as const;
type Month = (typeof MONTHS)[number];

// East has no March figure yet: a null cell, which unpivot drops instead of turning into a row.
const WIDE: { region: string; values: Record<Month, number | null> }[] = [
  { region: 'West', values: { Jan: 100, Feb: 120, Mar: 130 } },
  { region: 'East', values: { Jan: 90, Feb: 95, Mar: null } },
];

const COLOR: Record<Month, { cell: string; text: string }> = {
  Jan: { cell: 'bg-sky-500/15', text: 'text-sky-700 dark:text-sky-300' },
  Feb: { cell: 'bg-amber-500/15', text: 'text-amber-700 dark:text-amber-300' },
  Mar: { cell: 'bg-violet-500/15', text: 'text-violet-700 dark:text-violet-300' },
};

// Table.UnpivotOtherColumns(Source, {"Region"}, "Month", "Sales"): one row per non-null cell.
const LONG = WIDE.flatMap((r) =>
  MONTHS.filter((m) => r.values[m] !== null).map((m) => ({ region: r.region, month: m, sales: r.values[m] as number })),
);

const cellCount = WIDE.length * MONTHS.length;
const nullCount = cellCount - LONG.length;

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

const th = 'px-2 py-1.5 text-left text-xs font-normal uppercase text-fd-muted-foreground';
const td = 'px-2 py-1.5';

export function UnpivotAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of an unpivot
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        Table.UnpivotOtherColumns(Source, {'{'}
        <span className="font-semibold">&quot;Region&quot;</span>
        {'}'}, &quot;Month&quot;, &quot;Sales&quot;)
      </div>

      <div className="mt-4 grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">Wide: one column per month</p>
          <table className="mt-1 w-full border-collapse font-mono text-sm">
            <thead>
              <tr>
                <th className={cn(th, 'bg-fd-muted/60')}>
                  <span className="inline-flex items-center gap-1.5">
                    <Badge n="1" className="size-4 bg-fd-muted-foreground text-[9px]" />
                    Region
                  </span>
                </th>
                {MONTHS.map((m) => (
                  <th key={m} className={cn(th, 'text-right', COLOR[m].cell, COLOR[m].text)}>
                    <span className="inline-flex items-center gap-1">
                      {m === 'Jan' && <Badge n="2" className="size-4 bg-sky-500 text-[9px]" />}
                      {m}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WIDE.map((r) => (
                <tr key={r.region} className="border-t border-fd-border">
                  <td className={cn(td, 'bg-fd-muted/60')}>{r.region}</td>
                  {MONTHS.map((m) => {
                    const v = r.values[m];
                    return (
                      <td key={m} className={cn(td, 'text-right', v === null ? 'text-fd-muted-foreground italic' : COLOR[m].cell)}>
                        {v === null ? (
                          <span className="inline-flex items-center gap-1">
                            <Badge n="4" className="size-4 bg-red-500 text-[9px] not-italic" />
                            null
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            {r.region === 'West' && m === 'Jan' && <Badge n="3" className="size-4 bg-emerald-500 text-[9px]" />}
                            {v}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-fd-muted-foreground">
            {WIDE.length} rows × {MONTHS.length} month columns = {cellCount} cells
          </p>
        </div>

        <div className="text-center text-xl text-fd-muted-foreground">
          <span className="sm:hidden">↓</span>
          <span className="hidden sm:inline">→</span>
        </div>

        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">Long: one row per month</p>
          <table className="mt-1 w-full border-collapse font-mono text-sm">
            <thead>
              <tr>
                <th className={cn(th, 'bg-fd-muted/60')}>Region</th>
                <th className={th}>Month</th>
                <th className={cn(th, 'text-right')}>Sales</th>
              </tr>
            </thead>
            <tbody>
              {LONG.map((r) => (
                <tr key={r.region + r.month} className="border-t border-fd-border">
                  <td className={cn(td, 'bg-fd-muted/60')}>{r.region}</td>
                  <td className={cn(td, COLOR[r.month].cell, COLOR[r.month].text)}>{r.month}</td>
                  <td className={cn(td, 'text-right', COLOR[r.month].cell)}>{r.sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-fd-muted-foreground">
            {LONG.length} rows: {cellCount} cells minus {nullCount} null
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-fd-muted-foreground" />
          <p>
            <span className="font-mono">Kept column</span> — Region is the one column named in the formula. It&apos;s
            copied onto every row its cells produce, so West now appears {LONG.filter((r) => r.region === 'West').length}{' '}
            times. Every column <strong>not</strong> named gets unpivoted, including any added next month.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Header → attribute</span> — each column{' '}
            <strong>name</strong> becomes a value in the new Month column. The colors carry over: every sky-blue row came
            from the Jan column.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Cell → value</span> — each cell&apos;s
            number lands in the Sales column, on the row for its own Region and Month: West&apos;s Jan cell becomes West
            · Jan · {WIDE[0].values.Jan}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">Nulls are dropped</span> — East&apos;s empty March
            cell produces no row at all, not a row with a blank. A month with no data simply vanishes from the long
            table, so count rows with that in mind.
          </p>
        </div>
      </div>
    </div>
  );
}
