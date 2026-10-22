import { cn } from '@/lib/cn';

const DIM_PRODUCT = [
  { key: 1001, category: 'Bikes' },
  { key: 1002, category: 'Accessories' },
];

const FACT_SALES = [
  { order: 5001, key: 1001 },
  { order: 5002, key: 1002 },
  { order: 5003, key: 1001 },
  { order: 5004, key: 1001 },
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

function categoryFor(key: number): string {
  return DIM_PRODUCT.find((p) => p.key === key)!.category;
}

export function RelatedAnatomyDiagram() {
  return (
    <div className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of RELATED()
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        <span className="text-fd-muted-foreground">Category = </span>
        RELATED(<span className="text-emerald-600 dark:text-emerald-400">DimProduct[Category]</span>)
      </div>

      <p className="mt-4 text-xs text-fd-muted-foreground">
        DimProduct <span className="font-mono">(one side)</span>
      </p>
      <div className="mt-1 overflow-hidden rounded-lg border border-sky-500/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">ProductKey</th>
              <th className="px-3 py-2 text-left">Category</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {DIM_PRODUCT.map((p) => (
              <tr key={p.key} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    {p.key}
                    <Badge n="1" className="bg-sky-500" />
                  </span>
                </td>
                <td className="px-3 py-2">{p.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="my-2 flex items-center justify-center gap-2 text-xs text-fd-muted-foreground">
        <span className="h-px w-16 bg-fd-border" />
        relationship: one ProductKey &rarr; many ProductKey
        <span className="h-px w-16 bg-fd-border" />
      </div>

      <p className="text-xs text-fd-muted-foreground">
        FactSales <span className="font-mono">(many side)</span>
      </p>
      <div className="mt-1 overflow-hidden rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">OrderID</th>
              <th className="px-3 py-2 text-left">ProductKey</th>
              <th className="px-3 py-2 text-left">Category (RELATED)</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {FACT_SALES.map((f, i) => (
              <tr key={f.order} className="border-t border-fd-border">
                <td className="px-3 py-2 text-fd-muted-foreground">{f.order}</td>
                <td className="border-x border-sky-500/40 px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    {f.key}
                    {i === 0 && <Badge n="2" className="bg-sky-500" />}
                  </span>
                </td>
                <td className="border-x border-emerald-500/40 px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    {categoryFor(f.key)}
                    {i === 0 && <Badge n="✓" className="bg-fd-primary" />}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">ProductKey</span> on the{' '}
            <strong>one</strong> side — each value appears at most once in{' '}
            <span className="font-mono">DimProduct</span>.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">ProductKey</span> on the{' '}
            <strong>many</strong> side — the same value can repeat across several{' '}
            <span className="font-mono">FactSales</span> rows. <span className="font-mono">RELATED()</span> finds
            the one matching row on the other side of the relationship, for every row here independently.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Category</span> — pulled across for{' '}
            <strong>every</strong> row on the many side, not just the first. Three different{' '}
            <span className="font-mono">FactSales</span> rows share ProductKey 1001, and all three independently
            resolve to <span className="font-mono">&quot;Bikes&quot;</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
