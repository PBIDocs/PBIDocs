import { cn } from '@/lib/cn';

const CUSTOMERS = ['Alice', 'Bob', 'Chen'];

const SALES = [
  { id: 1, customer: 'Alice', amount: 300 },
  { id: 2, customer: 'Bob', amount: 500 },
  { id: 3, customer: 'Alice', amount: 200 },
  { id: 4, customer: 'Chen', amount: 400 },
  { id: 5, customer: 'Bob', amount: 100 },
];

// The row the diagram zooms in on.
const FOCUS = 'Bob';

const grandTotal = SALES.reduce((sum, r) => sum + r.amount, 0);
const customerTotal = (c: string) => SALES.filter((r) => r.customer === c).reduce((sum, r) => sum + r.amount, 0);

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

export function ContextTransitionAnatomyDiagram() {
  return (
    <div id="context-transition-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of context transition
      </p>

      <div className="space-y-1 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        <p>
          <span className="text-fd-muted-foreground">DimCustomer[No Transition] = </span>
          SUM(FactSales[SalesAmount])
        </p>
        <p>
          <span className="text-fd-muted-foreground">DimCustomer[With Transition] = </span>
          <span className="text-sky-600 dark:text-sky-400">CALCULATE(</span>SUM(FactSales[SalesAmount])
          <span className="text-sky-600 dark:text-sky-400">)</span>
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs uppercase text-fd-muted-foreground">
              <th className="px-2 py-2 text-left sm:px-3">Customer</th>
              <th className="px-2 py-2 text-right sm:px-3">No Transition</th>
              <th className="border-x border-sky-500/40 px-2 py-2 text-right text-sky-600 sm:px-3 dark:text-sky-400">
                With Transition
              </th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {CUSTOMERS.map((c) => {
              const isFocus = c === FOCUS;
              return (
                <tr key={c} className={cn('border-t border-fd-border', isFocus && 'bg-violet-500/10')}>
                  <td className="px-2 py-2 sm:px-3">
                    <span className="inline-flex items-center gap-1.5">
                      {c}
                      {isFocus && <Badge n="1" className="bg-violet-500" />}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right text-red-600 sm:px-3 dark:text-red-400">{fmt(grandTotal)}</td>
                  <td className="border-x border-sky-500/40 px-2 py-2 text-right sm:px-3">{fmt(customerTotal(c))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">Inside CALCULATE, on {FOCUS}&apos;s row</p>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1.5 rounded-md border border-violet-500/40 bg-violet-500/10 px-2.5 py-1.5 font-mono text-sm">
            <Badge n="1" className="bg-violet-500" />
            row context: {FOCUS}&apos;s row
          </div>
          <span className="text-center text-fd-muted-foreground sm:text-left">
            <span className="sm:hidden">↓</span>
            <span className="hidden sm:inline">→</span>
          </span>
          <div className="flex items-center gap-1.5 rounded-md border border-sky-500/40 bg-sky-500/10 px-2.5 py-1.5 font-mono text-sm">
            <Badge n="2" className="bg-sky-500" />
            filter: DimCustomer[Customer] = &quot;{FOCUS}&quot;
          </div>
        </div>

        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs uppercase text-fd-muted-foreground">
              <th className="px-2 py-1.5 text-left">FactSales row</th>
              <th className="px-2 py-1.5 text-left">Customer</th>
              <th className="px-2 py-1.5 text-right">SalesAmount</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {SALES.map((r) => {
              const inFilter = r.customer === FOCUS;
              return (
                <tr key={r.id} className={cn('border-t border-fd-border', inFilter ? 'bg-amber-500/10' : 'opacity-40')}>
                  <td className="px-2 py-1.5">{r.id}</td>
                  <td className="px-2 py-1.5">{r.customer}</td>
                  <td className="px-2 py-1.5 text-right">
                    <span className="inline-flex items-center gap-1.5">
                      {inFilter && <Badge n="3" className="bg-amber-500" />}
                      {fmt(r.amount)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="mt-3 flex items-center gap-1.5 font-mono text-lg font-semibold text-fd-primary">
          <Badge n="✓" className="bg-fd-primary" />
          {fmt(customerTotal(FOCUS))}
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">Row context</span> — a calculated column
            is evaluated once per row, so DAX knows it&apos;s on {FOCUS}&apos;s row. But row context{' '}
            <strong>doesn&apos;t filter anything</strong>: <span className="font-mono">SUM()</span> alone still sees
            all of FactSales and returns {fmt(grandTotal)} on every row.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Transition</span> —{' '}
            <span className="font-mono">CALCULATE()</span> turns the current row into a real filter: every column of
            that row becomes an equality filter on DimCustomer.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Propagation</span> — that filter flows
            across the DimCustomer → FactSales relationship like any slicer would, leaving only {FOCUS}&apos;s{' '}
            {SALES.filter((r) => r.customer === FOCUS).length} sales rows.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Result</span> — {fmt(customerTotal(FOCUS))}, {FOCUS}&apos;s own
            total. Referencing a measure such as <span className="font-mono">[Total Sales]</span> gives the same result
            without writing CALCULATE, because every measure reference is implicitly wrapped in one.
          </p>
        </div>
      </div>
    </div>
  );
}
