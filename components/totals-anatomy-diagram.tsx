import { cn } from '@/lib/cn';

// Sales in $K by product and region. The visual: a table with Category and Product columns,
// and a slicer set to Region = West.
const PRODUCTS = [
  { name: 'Road Bike', cat: 'Bikes', West: 30, East: 20 },
  { name: 'Mountain Bike', cat: 'Bikes', West: 15, East: 25 },
  { name: 'Helmet', cat: 'Gear', West: 8, East: 6 },
  { name: 'Lock', cat: 'Gear', West: 4, East: 2 },
  { name: 'Jersey', cat: 'Apparel', West: 10, East: 5 },
] as const;

type Product = (typeof PRODUCTS)[number];
const SLICER = 'West' as const;
const CURRENT = 'Mountain Bike';

// A row's filter context: one product, or none (the total row). The slicer is always West.
type Row = Product | null;

const sum = (keep: (p: Product) => boolean, regions: ('West' | 'East')[]) =>
  PRODUCTS.filter(keep).reduce((a, p) => a + regions.reduce((b, r) => b + p[r], 0), 0);

const MEASURES = [
  {
    key: 'basic',
    name: 'Total Sales',
    short: 'Sales',
    expr: 'SUM(FactSales[SalesAmount])',
    color: 'text-fd-primary',
    dot: 'bg-fd-primary',
    value: (row: Row) => sum((p) => !row || p.name === row.name, [SLICER]),
    keeps: { region: true, product: true, category: true },
  },
  {
    key: 'grand',
    name: 'Grand Total Sales',
    short: 'Grand',
    expr: 'ALL(FactSales)',
    color: 'text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
    value: () => sum(() => true, ['West', 'East']),
    keeps: { region: false, product: false, category: false },
  },
  {
    key: 'region',
    name: 'Sales Ignoring Region',
    short: 'No region',
    expr: 'ALL(DimStore[Region])',
    color: 'text-sky-600 dark:text-sky-400',
    dot: 'bg-sky-500',
    value: (row: Row) => sum((p) => !row || p.name === row.name, ['West', 'East']),
    keeps: { region: false, product: true, category: true },
  },
  {
    key: 'category',
    name: 'Sales Within Category',
    short: 'Category',
    expr: 'ALLEXCEPT(DimProduct, DimProduct[Category])',
    color: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    value: (row: Row) => sum((p) => !row || p.cat === row.cat, [SLICER]),
    keeps: { region: true, product: false, category: true },
  },
] as const;

const current = PRODUCTS.find((p) => p.name === CURRENT)!;
const k = (n: number) => `$${n}K`;

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

const FILTERS = [
  { key: 'region', short: 'Region', label: `Region = ${SLICER}`, source: 'slicer' },
  { key: 'product', short: 'Product', label: `Product = ${CURRENT}`, source: 'row' },
  { key: 'category', short: 'Category', label: `Category = ${current.cat}`, source: 'row' },
] as const;

export function TotalsAnatomyDiagram() {
  const values = Object.fromEntries(MEASURES.map((m) => [m.key, m.value(current)])) as Record<string, number>;

  return (
    <div id="totals-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of four totals
      </p>
      <p className="mb-3 text-xs text-fd-muted-foreground">
        One table visual with Category and Product columns, and a slicer set to{' '}
        <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1 font-mono">Region = {SLICER}</span>.
        Sales in $K; the East numbers exist but the slicer hides them.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="text-xs text-fd-muted-foreground">
              <th className="hidden px-1.5 py-2 text-left sm:table-cell sm:px-3">Category</th>
              <th className="px-1.5 py-2 text-left sm:px-3">Product</th>
              {MEASURES.map((m, i) => (
                <th key={m.key} className={cn('px-1.5 py-2 text-right sm:px-3', m.color)}>
                  <span className="inline-flex items-center justify-end gap-1">
                    <Badge n={String(i + 1)} className={cn('hidden sm:inline-flex', m.dot)} />
                    <span className="sm:hidden">{m.short}</span>
                    <span className="hidden sm:inline">{m.short === 'Sales' ? 'Total Sales' : m.short}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {PRODUCTS.map((p) => (
              <tr
                key={p.name}
                className={cn('border-t border-fd-border', p.name === CURRENT && 'bg-fd-primary/10 font-semibold')}
              >
                <td className="hidden px-1.5 py-2 font-sans sm:table-cell sm:px-3">{p.cat}</td>
                <td className="px-1.5 py-2 font-sans sm:px-3">
                  {p.name}
                  <span className="text-fd-muted-foreground sm:hidden"> · {p.cat}</span>
                </td>
                {MEASURES.map((m) => (
                  <td key={m.key} className="px-1.5 py-2 text-right sm:px-3">
                    {k(m.value(p))}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-fd-border font-semibold">
              <td className="hidden px-1.5 py-2 sm:table-cell sm:px-3" />
              <td className="px-1.5 py-2 font-sans sm:px-3">Total</td>
              {MEASURES.map((m) => (
                <td key={m.key} className={cn('px-1.5 py-2 text-right sm:px-3', m.color)}>
                  {k(m.value(null))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="mb-2 text-xs text-fd-muted-foreground">
          On the highlighted <span className="font-semibold text-fd-foreground">{CURRENT}</span> row, which filters
          survive each measure?
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="text-fd-muted-foreground">
                <th className="py-1.5 pr-2 text-left font-normal">Measure</th>
                {FILTERS.map((f) => (
                  <th key={f.key} className="px-1.5 py-1.5 text-center font-normal">
                    <span className="block font-mono text-fd-foreground sm:hidden">{f.short}</span>
                    <span className="hidden font-mono text-fd-foreground sm:block">{f.label}</span>
                    <span className="hidden text-[10px] sm:block">from the {f.source}</span>
                  </th>
                ))}
                <th className="py-1.5 pl-2 text-right font-normal">Result</th>
              </tr>
            </thead>
            <tbody>
              {MEASURES.map((m, i) => (
                <tr key={m.key} className="border-t border-fd-border">
                  <td className="py-1.5 pr-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Badge n={String(i + 1)} className={m.dot} />
                      <span className="font-mono sm:hidden">{m.short}</span>
                      <span className="hidden font-mono sm:inline">
                        {m.expr === 'SUM(FactSales[SalesAmount])' ? 'SUM only' : m.expr}
                      </span>
                    </span>
                  </td>
                  {FILTERS.map((f) => {
                    const kept = m.keeps[f.key];
                    return (
                      <td key={f.key} className="px-1.5 py-1.5 text-center">
                        <span
                          className={cn(
                            'inline-block rounded px-1.5 font-semibold',
                            kept
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : 'bg-red-500/15 text-red-700 sm:line-through dark:text-red-300',
                          )}
                        >
                          <span className="sm:hidden">{kept ? '✓' : '✗'}</span>
                          <span className="hidden sm:inline">{kept ? 'kept' : 'removed'}</span>
                        </span>
                      </td>
                    );
                  })}
                  <td className={cn('py-1.5 pl-2 text-right font-mono font-semibold', m.color)}>{k(values[m.key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Total Sales</span> — every filter applies: {CURRENT} in the
            West, {k(values.basic)}. The total row drops the product filter but keeps the slicer: {k(MEASURES[0].value(null))}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">ALL(FactSales)</span> — removing filters from the
            fact table removes them from the dimensions it&apos;s related to as well, so the{' '}
            <strong>slicer is ignored too</strong>: {k(values.grand)} on every row, East included. Fine for a true grand
            total; wrong if &quot;% of West&quot; was the goal.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">ALL(DimStore[Region])</span> — only the slicer
            goes: {CURRENT} across both regions, {k(current.West)} + {k(current.East)} = {k(values.region)}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">ALLEXCEPT(DimProduct, Category)</span> —
            the product filter goes, the Category filter from the row stays, and the slicer is on another table, so it
            stays too: all {current.cat} in the West, {k(values.category)}. ALLEXCEPT only <em>keeps</em> a filter that
            already exists. Take Category out of the visual and there&apos;s nothing to keep: every row would show the
            West total, {k(MEASURES[3].value(null))}, the same as the total row.
          </p>
        </div>
      </div>
    </div>
  );
}
