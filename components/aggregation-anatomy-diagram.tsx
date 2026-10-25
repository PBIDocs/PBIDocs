import { cn } from '@/lib/cn';

const MAPPING = [
  { col: 'Month', summarization: 'GroupBy', detail: 'FactSales[DateKey]' },
  { col: 'ProductKey', summarization: 'GroupBy', detail: 'FactSales[ProductKey]' },
  { col: 'Total Sales', summarization: 'Sum', detail: 'FactSales[SalesAmount]' },
  { col: 'Transaction Count', summarization: 'Count', detail: 'FactSales[TransactionID]' },
];

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

export function AggregationAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of an Aggregation: Where a Query Gets Routed
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-sky-500/40 p-2.5 font-mono text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Badge n="1" className="bg-sky-500" />
            AggSalesByMonth
          </span>
          <span className="text-right text-fd-muted-foreground">
            Import
            <br />
            5,000 rows
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-fd-border p-2.5 font-mono text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Badge n="1" className="bg-fd-muted-foreground" />
            FactSales
          </span>
          <span className="text-right text-fd-muted-foreground">
            DirectQuery
            <br />
            500,000,000 rows
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-xs">
          <p className="flex items-center gap-1.5 font-mono font-semibold">
            <Badge n="2" className="bg-emerald-500" />
            Visual needs: Sales by Month
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-fd-muted-foreground">
            <span>matches the aggregation&apos;s grain</span>
            <span>&rarr;</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              answered by AggSalesByMonth, almost instantly
            </span>
          </p>
        </div>
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
          <p className="flex items-center gap-1.5 font-mono font-semibold">
            <Badge n="3" className="bg-amber-500" />
            Visual needs: Sales by Transaction ID
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-fd-muted-foreground">
            <span>too detailed for the aggregation&apos;s grain</span>
            <span>&rarr;</span>
            <span className="font-mono text-amber-600 dark:text-amber-400">
              falls back to FactSales, the full DirectQuery scan
            </span>
          </p>
        </div>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
        <Badge n="4" className="bg-fd-primary" />
        How each aggregation column maps back to the detail table
      </p>
      <div className="mt-1 overflow-hidden rounded-lg border border-fd-primary/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Aggregation Column</th>
              <th className="px-3 py-2 text-left">Summarization</th>
              <th className="px-3 py-2 text-left">Detail Column</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {MAPPING.map((m) => (
              <tr key={m.col} className="border-t border-fd-border">
                <td className="px-3 py-2">{m.col}</td>
                <td className="px-3 py-2 text-fd-primary">{m.summarization}</td>
                <td className="px-3 py-2 text-fd-muted-foreground">{m.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="text-sky-600 dark:text-sky-400">The two tables</span> — the same fact data exists at
            two grains: a tiny Import summary and the full DirectQuery detail behind it.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="text-emerald-600 dark:text-emerald-400">Grain match</span> — when a query&apos;s grain
            is coarser than or equal to the aggregation&apos;s, Power BI answers it from the small Import table.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="text-amber-600 dark:text-amber-400">Grain miss</span> — when a query needs finer
            detail than the aggregation stores, it falls back to the full DirectQuery scan automatically.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">The mapping</span> — report authors never pick a table
            manually. This mapping is what lets Power BI route each query to the right one on its own.
          </p>
        </div>
      </div>
    </div>
  );
}
