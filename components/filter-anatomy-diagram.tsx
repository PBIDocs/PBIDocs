import { cn } from '@/lib/cn';

const THRESHOLD = 1000;

// Same four orders as the "How FILTER Works" table on the page.
const SALES = [
  { order: 1001, amount: 500 },
  { order: 1002, amount: 1500 },
  { order: 1003, amount: 2000 },
  { order: 1004, amount: 750 },
];

const kept = SALES.filter((r) => r.amount > THRESHOLD);
const total = kept.reduce((sum, r) => sum + r.amount, 0);

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;

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

export function FilterAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of FILTER()
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        <span className="text-fd-muted-foreground">Large Sales = </span>
        CALCULATE([Total Sales], FILTER(<span className="text-sky-600 dark:text-sky-400">FactSales</span>,{' '}
        <span className="text-amber-600 dark:text-amber-400">FactSales[SalesAmount] &gt; {THRESHOLD}</span>))
      </div>

      <div className="mt-4 grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-lg border border-sky-500/40 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="1" className="bg-sky-500" />
            Table — FactSales, every row
          </p>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="text-xs uppercase text-fd-muted-foreground">
                <th className="px-2 py-1.5 text-left">Order</th>
                <th className="px-2 py-1.5 text-right">SalesAmount</th>
                <th className="border-x border-amber-500/40 px-2 py-1.5 text-center text-amber-600 dark:text-amber-400">
                  &gt; {THRESHOLD}?
                </th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {SALES.map((r) => {
                const pass = r.amount > THRESHOLD;
                return (
                  <tr key={r.order} className={cn('border-t border-fd-border', !pass && 'opacity-40')}>
                    <td className="px-2 py-1.5">{r.order}</td>
                    <td className="px-2 py-1.5 text-right">{fmt(r.amount)}</td>
                    <td className="border-x border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-center">
                      <span className="inline-flex items-center gap-1.5">
                        {pass ? 'TRUE' : 'FALSE'}
                        {pass && <Badge n="2" className="bg-amber-500" />}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-center text-xl text-fd-muted-foreground">
          <span className="sm:hidden">↓</span>
          <span className="hidden sm:inline">→</span>
        </div>

        <div className="rounded-lg border border-violet-500/40 bg-violet-500/10 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="3" className="bg-violet-500" />
            Returned — a {kept.length}-row table, not a number
          </p>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="text-xs uppercase text-fd-muted-foreground">
                <th className="px-2 py-1.5 text-left">Order</th>
                <th className="px-2 py-1.5 text-right">SalesAmount</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {kept.map((r) => (
                <tr key={r.order} className="border-t border-fd-border">
                  <td className="px-2 py-1.5">{r.order}</td>
                  <td className="px-2 py-1.5 text-right">{fmt(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">CALCULATE applies that table as a filter, then evaluates [Total Sales]</p>
        <p className="mt-1 flex items-center gap-1.5 font-mono text-lg font-semibold text-fd-primary">
          <Badge n="✓" className="bg-fd-primary" />
          {fmt(total)}
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Table</span> — the rows FILTER walks through,
            one at a time. On a fact table that&apos;s every transaction, which is why the page recommends filtering
            the smallest table that works.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Condition</span> — evaluated{' '}
            <strong>once per row</strong>, in that row&apos;s row context. Rows where it&apos;s TRUE are kept; the{' '}
            {fmt(SALES[0].amount)} and {fmt(SALES[3].amount)} orders are dropped.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">Return value</span> — a{' '}
            <strong>table</strong>. FILTER alone can&apos;t be a measure; it has to be handed to something that takes
            a table, like CALCULATE, SUMX, or COUNTROWS.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Result</span> — CALCULATE uses those {kept.length} rows as its
            filter, so <span className="font-mono">[Total Sales]</span> returns {fmt(total)}.
          </p>
        </div>
      </div>
    </div>
  );
}
