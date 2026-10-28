import { cn } from '@/lib/cn';

// Monthly [Total Sales] in $K. Jan–Mar 2026 match the page's YTD example ($50K, $60K, $45K).
const MONTHS = [
  { y: 2025, m: 1, sales: 38 },
  { y: 2025, m: 2, sales: 40 },
  { y: 2025, m: 3, sales: 41 },
  { y: 2025, m: 4, sales: 44 },
  { y: 2025, m: 5, sales: 48 },
  { y: 2025, m: 6, sales: 50 },
  { y: 2025, m: 7, sales: 47 },
  { y: 2025, m: 8, sales: 52 },
  { y: 2025, m: 9, sales: 55 },
  { y: 2025, m: 10, sales: 53 },
  { y: 2025, m: 11, sales: 58 },
  { y: 2025, m: 12, sales: 62 },
  { y: 2026, m: 1, sales: 50 },
  { y: 2026, m: 2, sales: 60 },
  { y: 2026, m: 3, sales: 45 },
];

// The report cell being evaluated: March 2026.
const CURRENT = { y: 2026, m: 3 };

const idx = (y: number, m: number) => (y - 2025) * 12 + (m - 1);
const cur = idx(CURRENT.y, CURRENT.m);
const LETTERS = 'JFMAMJJASOND';
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Each row: the set of month indexes the function hands to CALCULATE in place of the current context.
const ROWS: { badge: string; label: string; expr: string; picks: (i: number) => boolean; color: string; badgeColor: string }[] = [
  {
    badge: '1',
    label: 'Current filter context',
    expr: '[Total Sales]',
    picks: (i) => i === cur,
    color: 'bg-fd-primary/70',
    badgeColor: 'bg-fd-primary',
  },
  {
    badge: '2',
    label: 'Year to date',
    expr: 'DATESYTD(DimDate[Date])',
    picks: (i) => i <= cur && Math.floor(i / 12) === Math.floor(cur / 12),
    color: 'bg-sky-500/70',
    badgeColor: 'bg-sky-500',
  },
  {
    badge: '3',
    label: 'Same period last year',
    expr: 'SAMEPERIODLASTYEAR(DimDate[Date])',
    picks: (i) => i === cur - 12,
    color: 'bg-amber-500/70',
    badgeColor: 'bg-amber-500',
  },
  {
    badge: '4',
    label: 'Previous month',
    expr: 'DATEADD(DimDate[Date], -1, MONTH)',
    picks: (i) => i === cur - 1,
    color: 'bg-violet-500/70',
    badgeColor: 'bg-violet-500',
  },
  {
    badge: '5',
    label: 'Rolling 12 months',
    expr: 'DATESINPERIOD(DimDate[Date], MAX(DimDate[Date]), -12, MONTH)',
    picks: (i) => i > cur - 12 && i <= cur,
    color: 'bg-emerald-500/70',
    badgeColor: 'bg-emerald-500',
  },
];

const totalFor = (picks: (i: number) => boolean) => MONTHS.reduce((s, mo, i) => s + (picks(i) ? mo.sales : 0), 0);
const results = ROWS.map((r) => totalFor(r.picks));
const yoy = results[0] / results[2] - 1;

const fmtK = (n: number) => `$${n}K`;

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

function Strip({ picks, color }: { picks: (i: number) => boolean; color: string }) {
  return (
    <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-0.5">
      {MONTHS.map((mo, i) => (
        <div
          key={i}
          title={`${MONTH_NAMES[mo.m - 1]} ${mo.y}: $${mo.sales}K`}
          className={cn(
            'h-5 rounded-sm',
            picks(i) ? color : 'bg-fd-foreground/10',
            i === cur && 'ring-1 ring-fd-foreground/40',
            mo.m === 1 && i > 0 && 'ml-1',
          )}
        />
      ))}
    </div>
  );
}

export function TimeIntelligenceAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of time intelligence
      </p>
      <p className="mb-4 text-xs text-fd-muted-foreground">
        One report cell, March 2026. Each function hands CALCULATE a different set of dates.
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3">
        <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-0.5 font-mono text-[10px] text-fd-muted-foreground">
          {MONTHS.map((mo, i) => (
            <div key={i} className={cn('text-center', mo.m === 1 && i > 0 && 'ml-1')}>
              {mo.m === 1 ? <span className="font-semibold text-fd-foreground">{String(mo.y).slice(2)}</span> : LETTERS[mo.m - 1]}
            </div>
          ))}
        </div>
        <div className="mt-0.5 grid grid-cols-[repeat(15,minmax(0,1fr))] gap-0.5 font-mono text-[9px] text-fd-muted-foreground/70">
          {MONTHS.map((mo, i) => (
            <div key={i} className={cn('text-center', mo.m === 1 && i > 0 && 'ml-1')}>
              {mo.sales}
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-3">
          {ROWS.map((r, i) => (
            <div key={r.badge}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="flex min-w-0 items-center gap-1.5 text-xs">
                  <Badge n={r.badge} className={cn('size-4 text-[9px]', r.badgeColor)} />
                  <span className="font-semibold">{r.label}</span>
                </p>
                <span className="font-mono text-sm font-semibold">{fmtK(results[i])}</span>
              </div>
              <Strip picks={r.picks} color={r.color} />
              <p className="mt-1 truncate font-mono text-[10px] text-fd-muted-foreground">{r.expr}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-fd-muted-foreground">
          Top rows: year (26 = 2026), month initial, and monthly sales in $K. Outlined month = the report cell.
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Current context</span> — on its own,{' '}
            <span className="font-mono">[Total Sales]</span> sees only the month the visual puts it in: March 2026,{' '}
            {fmtK(results[0])}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">DATESYTD</span> — every date from January 1 of
            the same year through the current one: $50K + $60K + $45K = {fmtK(results[1])}, the same YTD figure as the
            table above.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">SAMEPERIODLASTYEAR</span> — the same dates
            shifted back one year. March 2025 is {fmtK(results[2])}, so year-over-year growth is{' '}
            {(yoy * 100).toFixed(1)}%.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">DATEADD</span> — the same shift, by any
            interval. −1 MONTH lands on February 2026, {fmtK(results[3])}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="5" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">DATESINPERIOD</span> — a fixed-length
            window ending at the current date, crossing the year boundary: April 2025 through March 2026,{' '}
            {fmtK(results[4])}. Every one of these needs a complete, contiguous date table to shift or extend into.
          </p>
        </div>
      </div>
    </div>
  );
}
