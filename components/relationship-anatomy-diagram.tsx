import { cn } from '@/lib/cn';

const DIM_PRODUCT = [
  { key: 1001, name: 'Tire A' },
  { key: 1002, name: 'Tire B' },
];

const FACT_SALES = [
  { order: 5001, key: 1001, amount: 250 },
  { order: 5002, key: 1001, amount: 400 },
  { order: 5003, key: 1002, amount: 180 },
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

export function RelationshipAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a Relationship
      </p>

      <p className="text-xs text-fd-muted-foreground">
        DimProduct <span className="font-mono">(one side)</span>
      </p>
      <div className="mt-1 overflow-hidden rounded-lg border border-amber-500/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">ProductKey</th>
              <th className="px-3 py-2 text-left">ProductName</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {DIM_PRODUCT.map((p) => (
              <tr key={p.key} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    {p.key}
                    {p.key === 1001 && <Badge n="1" className="bg-amber-500" />}
                  </span>
                </td>
                <td className="px-3 py-2">{p.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="my-3 flex flex-col items-center gap-1 text-xs text-fd-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Badge n="2" className="bg-sky-500" />1
        </span>
        <span className="h-6 w-px bg-fd-border" />
        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <Badge n="3" className="bg-emerald-500" />
          filters flow dimension &rarr; fact
        </span>
        <span className="h-6 w-px bg-fd-border" />
        <span className="inline-flex items-center gap-1.5">
          <Badge n="2" className="bg-sky-500" />*
        </span>
      </div>

      <p className="text-xs text-fd-muted-foreground">
        FactSales <span className="font-mono">(many side)</span>
      </p>
      <div className="mt-1 overflow-hidden rounded-lg border border-amber-500/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">OrderID</th>
              <th className="px-3 py-2 text-left">ProductKey</th>
              <th className="px-3 py-2 text-left">SalesAmount</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {FACT_SALES.map((f, i) => (
              <tr key={f.order} className="border-t border-fd-border">
                <td className="px-3 py-2 text-fd-muted-foreground">{f.order}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    {f.key}
                    {i === 0 && <Badge n="1" className="bg-amber-500" />}
                  </span>
                </td>
                <td className="px-3 py-2">{f.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-fd-muted-foreground">
          <Badge n="4" className="bg-fd-primary" />
          Active vs. inactive: FactSales can have more than one relationship to DimDate
        </p>
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-40 shrink-0 truncate">FactSales[OrderDateKey]</span>
            <span className="h-px flex-1 bg-fd-primary" />
            <span className="rounded bg-fd-primary/10 px-1.5 py-0.5 text-fd-primary">Active</span>
          </div>
          <div className="flex items-center gap-2 opacity-50">
            <span className="w-40 shrink-0 truncate">FactSales[ShipDateKey]</span>
            <span
              className="h-px flex-1 bg-fd-muted-foreground"
              style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0 4px, transparent 4px 8px)' }}
            />
            <span className="rounded bg-fd-muted px-1.5 py-0.5">Inactive</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-fd-muted-foreground">
          Reaching the inactive one takes an explicit{' '}
          <span className="font-mono">USERELATIONSHIP(FactSales[ShipDateKey], DimDate[DateKey])</span> inside{' '}
          <span className="font-mono">CALCULATE()</span>.
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">ProductKey</span> — the shared key column.
            It&apos;s unique in <span className="font-mono">DimProduct</span> but repeats in{' '}
            <span className="font-mono">FactSales</span>; that difference is what defines which side is &quot;one&quot;
            and which is &quot;many.&quot;
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="text-sky-600 dark:text-sky-400">Cardinality (1 : *)</span> — one row in{' '}
            <span className="font-mono">DimProduct</span> can match many rows in{' '}
            <span className="font-mono">FactSales</span>, never the other way around.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="text-emerald-600 dark:text-emerald-400">Filter direction</span> — by default, selections
            on the dimension side filter the fact side, not the reverse. Bidirectional filtering flips this arrow
            into a two-way street, which is why it&apos;s used sparingly.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Active vs. inactive</span> — a table can have more than one
            relationship to the same other table, but only one is used automatically. The rest sit dormant until a
            measure calls them by name.
          </p>
        </div>
      </div>
    </div>
  );
}
