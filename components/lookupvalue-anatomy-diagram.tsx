import { cn } from '@/lib/cn';

const PRODUCTS = [
  { key: 1001, name: 'Trail Runner Tire', category: 'Bikes' },
  { key: 1002, name: 'Commuter Helmet', category: 'Accessories' },
  { key: 1003, name: 'All-Terrain Tire', category: 'Bikes' },
  { key: 1004, name: 'Bike Lock', category: 'Accessories' },
];

const MATCH_KEY = 1001;
const matchRow = PRODUCTS.find((p) => p.key === MATCH_KEY)!;

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

export function LookupValueAnatomyDiagram() {
  return (
    <div className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of LOOKUPVALUE()
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        <span className="text-fd-muted-foreground">Product Category = </span>
        LOOKUPVALUE(
        <span className="text-emerald-600 dark:text-emerald-400">DimProduct[Category]</span>,{' '}
        <span className="text-sky-600 dark:text-sky-400">DimProduct[ProductKey]</span>,{' '}
        <span className="text-amber-600 dark:text-amber-400">1001</span>)
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">ProductKey</th>
              <th className="px-3 py-2 text-left">ProductName</th>
              <th className="px-3 py-2 text-left">Category</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {PRODUCTS.map((p) => {
              const isMatch = p.key === MATCH_KEY;
              return (
                <tr
                  key={p.key}
                  className={cn('border-t border-fd-border', isMatch && 'bg-amber-500/10')}
                >
                  <td className="border-x border-sky-500/40 px-3 py-2">
                    <span className="inline-flex items-center gap-1.5">
                      {p.key}
                      {isMatch && <Badge n="2" className="bg-sky-500" />}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-fd-muted-foreground">{p.name}</td>
                  <td className="border-x border-emerald-500/40 px-3 py-2">
                    <span className="inline-flex items-center gap-1.5">
                      {p.category}
                      {isMatch && <Badge n="3" className="bg-emerald-500" />}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
          <p className="text-xs text-fd-muted-foreground">Search Value</p>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-lg font-semibold text-amber-600 dark:text-amber-400">
            <Badge n="1" className="bg-amber-500" />
            {MATCH_KEY}
          </p>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">Result</p>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-lg font-semibold text-fd-primary">
            <Badge n="✓" className="bg-fd-primary" />
            {matchRow.category}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Search Value</span> — the value to find:{' '}
            <span className="font-mono">{MATCH_KEY}</span>.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Search Column</span> —{' '}
            <span className="font-mono">LOOKUPVALUE()</span> scans <span className="font-mono">ProductKey</span> and
            finds the match in row 1.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Result Column</span> — it takes the
            value from <span className="font-mono">Category</span> in that same row.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Result</span> — the measure returns{' '}
            <span className="font-mono">&quot;{matchRow.category}&quot;</span>. With no match, it would return{' '}
            <span className="font-mono">BLANK()</span> instead (or the optional default value, if one is supplied).
          </p>
        </div>
      </div>
    </div>
  );
}
