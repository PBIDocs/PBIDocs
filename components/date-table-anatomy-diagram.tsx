import { cn } from '@/lib/cn';

// A July-start fiscal year named by the year it ends in, matching the page's example (2026-07-01 → FY2027, Period 1).
const FY_START_MONTH = 7;

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const day = (m: number, d: number) => new Date(Date.UTC(2026, m - 1, d));
const addDays = (dt: Date, n: number) => new Date(dt.getTime() + n * 86400000);

function row(dt: Date) {
  const y = dt.getUTCFullYear();
  const m = dt.getUTCMonth() + 1;
  const d = dt.getUTCDate();
  const fy = m >= FY_START_MONTH ? y + 1 : y;
  return {
    iso: dt.toISOString().slice(0, 10),
    key: y * 10000 + m * 100 + d,
    year: y,
    month: MONTH_NAMES[m - 1],
    monthNo: m,
    fy: `FY${fy}`,
    period: ((m - FY_START_MONTH + 12) % 12) + 1,
    short: `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`,
    dow: DOW[dt.getUTCDay()],
  };
}

// The DimDate excerpt: either side of the fiscal year boundary.
const EXCERPT = [day(6, 29), day(6, 30), day(7, 1), day(7, 2)].map(row);

// The continuity strip: eight consecutive days.
const STRIP = Array.from({ length: 8 }, (_, i) => row(addDays(day(6, 27), i)));

const SALES = [
  { order: day(6, 29), ship: day(6, 30), amount: 200 },
  { order: day(6, 30), ship: day(7, 2), amount: 500 },
  { order: day(7, 1), ship: day(7, 3), amount: 300 },
].map((s) => ({ order: row(s.order), ship: row(s.ship), amount: s.amount }));

const orderDates = new Set(SALES.map((s) => s.order.iso));
const FISCAL_YEARS = [...new Set(EXCERPT.map((r) => r.fy))];
const byFy = (pick: 'order' | 'ship', fy: string) =>
  SALES.filter((s) => s[pick].fy === fy).reduce((t, s) => t + s.amount, 0);

const fmt = (n: number) => `$${n}`;

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

export function DateTableAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a date table
      </p>

      {/* Part 1: the columns */}
      <div className="overflow-x-auto rounded-lg border border-fd-border bg-fd-background p-2 sm:p-3">
        <p className="text-xs text-fd-muted-foreground">DimDate, four days around the fiscal year boundary</p>
        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="text-[10px] uppercase text-fd-muted-foreground">
              <th className="border-x border-sky-500/40 px-1 py-1.5 sm:px-1.5 text-left font-normal text-sky-600 dark:text-sky-400">
                <span className="inline-flex items-center gap-1">
                  <Badge n="1" className="size-4 bg-sky-500 text-[9px]" />
                  Date
                </span>
              </th>
              <th className="px-1 py-1.5 sm:px-1.5 text-left font-normal text-violet-600 dark:text-violet-400">
                <span className="inline-flex items-center gap-1">
                  <Badge n="2" className="size-4 bg-violet-500 text-[9px]" />
                  Key
                </span>
              </th>
              <th className="px-1 py-1.5 sm:px-1.5 text-left font-normal">Year</th>
              <th className="px-1 py-1.5 sm:px-1.5 text-left font-normal text-amber-600 dark:text-amber-400">
                <span className="inline-flex items-center gap-1">
                  <Badge n="3" className="size-4 bg-amber-500 text-[9px]" />
                  Month
                </span>
              </th>
              <th className="px-1 py-1.5 sm:px-1.5 text-right font-normal text-amber-600 dark:text-amber-400">#</th>
              <th className="border-l border-emerald-500/40 px-1 py-1.5 sm:px-1.5 text-left font-normal text-emerald-600 dark:text-emerald-400">
                <span className="inline-flex items-center gap-1">
                  <Badge n="4" className="size-4 bg-emerald-500 text-[9px]" />
                  FY
                </span>
              </th>
              <th className="px-1 py-1.5 sm:px-1.5 text-right font-normal text-emerald-600 dark:text-emerald-400">P</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[11px] sm:text-xs">
            {EXCERPT.map((r, i) => {
              const fyFlips = i > 0 && EXCERPT[i - 1].fy !== r.fy;
              return (
                <tr key={r.iso} className={cn('border-t border-fd-border', fyFlips && 'border-t-2 border-t-emerald-500')}>
                  <td className="border-x border-sky-500/40 px-1 py-1 sm:px-1.5 whitespace-nowrap">{r.iso}</td>
                  <td className="px-1 py-1 sm:px-1.5 text-fd-muted-foreground">{r.key}</td>
                  <td className="px-1 py-1 sm:px-1.5">{r.year}</td>
                  <td className="px-1 py-1 sm:px-1.5 font-sans">
                    <span className="sm:hidden">{r.month.slice(0, 3)}</span>
                    <span className="hidden sm:inline">{r.month}</span>
                  </td>
                  <td className="px-1 py-1 sm:px-1.5 text-right">{r.monthNo}</td>
                  <td
                    className={cn(
                      'border-l border-emerald-500/40 px-1 py-1 sm:px-1.5',
                      r.fy === FISCAL_YEARS[1] && 'bg-emerald-500/15 font-semibold',
                    )}
                  >
                    {r.fy}
                  </td>
                  <td className="px-1 py-1 sm:px-1.5 text-right">{r.period}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Part 2: continuity */}
      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
          <Badge n="5" className="bg-red-500" />
          Same eight days, two ways to build the table
        </p>
        {[
          { label: 'CALENDAR(start, end)', has: () => true, ok: true },
          { label: 'Dates taken from FactSales', has: (iso: string) => orderDates.has(iso), ok: false },
        ].map((v) => (
          <div key={v.label} className="mt-2">
            <p className={cn('font-mono text-[11px]', v.ok ? 'text-sky-600 dark:text-sky-400' : 'text-red-600 dark:text-red-400')}>
              {v.label}
            </p>
            <div className="mt-1 grid grid-cols-8 gap-1">
              {STRIP.map((r) => {
                const has = v.has(r.iso);
                return (
                  <div
                    key={r.iso}
                    className={cn(
                      'rounded px-0.5 py-1 text-center text-[10px] leading-tight',
                      has
                        ? v.ok
                          ? 'bg-sky-500/80 text-white'
                          : 'bg-fd-foreground/20'
                        : 'border border-dashed border-red-500 text-red-600 dark:text-red-400',
                    )}
                  >
                    {r.dow}
                    <span className="block font-mono">{r.short.split(' ')[1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Part 3: two date relationships */}
      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
          <Badge n="6" className="bg-fd-primary" />
          One DimDate, two relationships to FactSales
        </p>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-[10px] uppercase text-fd-muted-foreground">
                <th className="px-1.5 py-1 text-left font-normal">
                  Order <span className="normal-case">(active)</span>
                </th>
                <th className="px-1.5 py-1 text-left font-normal">
                  Ship <span className="normal-case">(inactive)</span>
                </th>
                <th className="px-1.5 py-1 text-right font-normal">Amount</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {SALES.map((s) => (
                <tr
                  key={s.order.iso}
                  className={cn('border-t border-fd-border', s.order.fy !== s.ship.fy && 'bg-fd-primary/10')}
                >
                  <td className="px-1.5 py-1 whitespace-nowrap">
                    {s.order.short} <span className="text-fd-muted-foreground">{s.order.fy}</span>
                  </td>
                  <td className="px-1.5 py-1 whitespace-nowrap">
                    {s.ship.short} <span className="text-fd-muted-foreground">{s.ship.fy}</span>
                  </td>
                  <td className="px-1.5 py-1 text-right">{fmt(s.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="grid grid-cols-2 gap-2 text-xs sm:w-56">
            <div className="rounded-md border-2 border-fd-primary/60 p-2">
              <p className="text-[10px] text-fd-muted-foreground">By order date</p>
              {FISCAL_YEARS.map((fy) => (
                <p key={fy} className="mt-0.5 flex justify-between font-mono">
                  <span>{fy}</span>
                  <span className="font-semibold">{fmt(byFy('order', fy))}</span>
                </p>
              ))}
            </div>
            <div className="rounded-md border-2 border-dashed border-fd-primary/60 p-2">
              <p className="text-[10px] text-fd-muted-foreground">By ship date</p>
              {FISCAL_YEARS.map((fy) => (
                <p key={fy} className="mt-0.5 flex justify-between font-mono">
                  <span>{fy}</span>
                  <span className="font-semibold">{fmt(byFy('ship', fy))}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Date</span> — one row per day, unique, no blanks.
            This is the column you pick in <strong>Mark as date table</strong>, and the one time intelligence functions
            like <span className="font-mono">TOTALYTD(…, DimDate[Date])</span> take.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">DateKey</span> — the same day as a yyyymmdd
            integer, for fact tables that store <span className="font-mono">DateKey</span> instead of a date. It&apos;s
            the relationship column, not a replacement for Date.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Month</span> — text, so on its own it sorts
            alphabetically (April, August, December…). Set <strong>Sort by column</strong> to Month # once and every
            visual sorts January to December.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Fiscal columns</span> — computed from
            Date, side by side with the calendar ones. On Jul 1 the fiscal year turns over to {FISCAL_YEARS[1]} and the
            period resets to 1, while Year stays {EXCERPT[0].year}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="5" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">Continuous</span> — a table built from the dates
            that happen to have sales has holes on every day with none ({STRIP.length - orderDates.size} of{' '}
            {STRIP.length} here). Mark as date table rejects a Date column with gaps, and DATEADD or
            SAMEPERIODLASTYEAR have no row to land on. CALENDAR() over a fixed range has every day.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="6" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Active vs inactive</span> — only one relationship between two
            tables can be active. The ${SALES[1].amount} order placed {SALES[1].order.short} and shipped{' '}
            {SALES[1].ship.short} counts in {SALES[1].order.fy} by order date, and moves to {SALES[1].ship.fy} when a
            measure switches to the ship date with{' '}
            <span className="font-mono">CALCULATE([Total Sales], USERELATIONSHIP(FactSales[ShipDateKey], DimDate[DateKey]))</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
