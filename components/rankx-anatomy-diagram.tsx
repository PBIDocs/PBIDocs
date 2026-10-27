import { cn } from '@/lib/cn';

// Tire A, Tire B, and Helmet A match the page's Basic Example; two more products round out the comparison set.
const PRODUCTS = [
  { name: 'Tire A', sales: 50000 },
  { name: 'Tire B', sales: 42000 },
  { name: 'Helmet A', sales: 18000 },
  { name: 'Chain C', sales: 12000 },
  { name: 'Lock D', sales: 9000 },
];

// The visual row the diagram zooms in on.
const CURRENT = 'Tire B';

// Default RANKX behavior (DESC, Skip): 1 + the number of values strictly greater.
const rankOf = (value: number) => 1 + PRODUCTS.filter((p) => p.sales > value).length;

const current = PRODUCTS.find((p) => p.name === CURRENT)!;
const higher = PRODUCTS.filter((p) => p.sales > current.sales);

const fmt = (n: number) => n.toLocaleString('en-US');

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

export function RankxAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of RANKX()
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        <span className="text-fd-muted-foreground">Product Rank = </span>
        RANKX(<span className="text-sky-600 dark:text-sky-400">ALL(DimProduct)</span>,{' '}
        <span className="text-amber-600 dark:text-amber-400">[Total Sales]</span>)
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-sky-500/40 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="1" className="bg-sky-500" />
            Comparison set for the {CURRENT} row
          </p>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="text-xs uppercase text-fd-muted-foreground">
                <th className="px-2 py-1.5 text-left">Product</th>
                <th className="border-x border-amber-500/40 px-2 py-1.5 text-right text-amber-600 dark:text-amber-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Badge n="2" className="bg-amber-500" />
                    [Total Sales]
                  </span>
                </th>
                <th className="px-2 py-1.5 text-left" />
              </tr>
            </thead>
            <tbody className="font-mono">
              {PRODUCTS.map((p) => {
                const isCurrent = p.name === CURRENT;
                const isHigher = p.sales > current.sales;
                return (
                  <tr
                    key={p.name}
                    className={cn(
                      'border-t border-fd-border',
                      isCurrent && 'bg-violet-500/10',
                      !isCurrent && !isHigher && 'opacity-50',
                    )}
                  >
                    <td className="px-2 py-1.5 font-sans">{p.name}</td>
                    <td className="border-x border-amber-500/40 px-2 py-1.5 text-right">
                      <span className="inline-flex items-center gap-1.5">
                        {isCurrent && <Badge n="3" className="bg-violet-500" />}
                        {fmt(p.sales)}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 font-sans text-xs whitespace-nowrap text-fd-muted-foreground">
                      {isCurrent ? 'this row' : isHigher ? 'higher' : 'lower'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 flex items-center gap-1.5 font-mono text-lg font-semibold text-fd-primary">
            <Badge n="✓" className="bg-fd-primary" />
            Rank = 1 + {higher.length} = {rankOf(current.sales)}
          </p>
        </div>

        <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-3">
          <p className="text-xs text-fd-muted-foreground">
            Without ALL(): <span className="font-mono">RANKX(DimProduct, [Total Sales])</span>
          </p>
          <p className="mt-2 text-xs text-fd-muted-foreground">Comparison set for the {CURRENT} row</p>
          <table className="mt-1 w-full border-collapse text-sm">
            <tbody className="font-mono">
              <tr className="border-t border-fd-border bg-violet-500/10">
                <td className="px-2 py-1.5 font-sans">{current.name}</td>
                <td className="px-2 py-1.5 text-right">{fmt(current.sales)}</td>
                <td className="px-2 py-1.5 font-sans text-xs text-fd-muted-foreground">only row</td>
              </tr>
            </tbody>
          </table>

          <p className="mt-4 text-xs text-fd-muted-foreground">What the table visual shows</p>
          <table className="mt-1 w-full border-collapse text-sm">
            <thead>
              <tr className="text-xs uppercase text-fd-muted-foreground">
                <th className="px-2 py-1.5 text-left">Product</th>
                <th className="px-2 py-1.5 text-right">With ALL</th>
                <th className="px-2 py-1.5 text-right">Without</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {PRODUCTS.map((p) => (
                <tr key={p.name} className="border-t border-fd-border">
                  <td className="px-2 py-1.5 font-sans">{p.name}</td>
                  <td className="px-2 py-1.5 text-right">{rankOf(p.sales)}</td>
                  <td className="px-2 py-1.5 text-right text-red-600 dark:text-red-400">1</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Table</span> — the set of rows to compare
            against. The visual has already filtered DimProduct down to {CURRENT};{' '}
            <span className="font-mono">ALL()</span> removes that filter so all {PRODUCTS.length} products are back in
            the set.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Expression</span> — evaluated{' '}
            <strong>once per row</strong> of that set. <span className="font-mono">[Total Sales]</span> is a measure,
            so context transition gives each product its own total rather than the grand total.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">Value</span> — the optional third
            argument. Left blank, RANKX evaluates the same expression in the current context: {fmt(current.sales)} for{' '}
            {CURRENT}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Rank</span> — 1 plus the number of values in the set that
            beat it. Only {higher.map((p) => p.name).join(', ')} is higher, so {CURRENT} ranks{' '}
            {rankOf(current.sales)}. Without <span className="font-mono">ALL()</span> the set holds only the current
            row, nothing can beat it, and every product ranks 1.
          </p>
        </div>
      </div>
    </div>
  );
}
