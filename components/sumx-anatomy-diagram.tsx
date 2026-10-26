import { cn } from '@/lib/cn';

const FILTER_CATEGORY = 'Bikes';

// Category is shown as RELATED(DimProduct[Category]): it lives on the product dimension, not on FactSales.
const SALES = [
  { id: 1, product: 'Mountain Bike', category: 'Bikes', quantity: 2, unitPrice: 450 },
  { id: 2, product: 'Helmet', category: 'Accessories', quantity: 1, unitPrice: 68 },
  { id: 3, product: 'Road Bike', category: 'Bikes', quantity: 1, unitPrice: 1200 },
  { id: 4, product: 'Jersey', category: 'Clothing', quantity: 3, unitPrice: 45 },
  { id: 5, product: 'Kids Bike', category: 'Bikes', quantity: 3, unitPrice: 180 },
];

const kept = SALES.filter((r) => r.category === FILTER_CATEGORY);
const total = kept.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0);

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

export function SumXAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of SUMX()
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        <span className="text-fd-muted-foreground">Revenue from Bikes = </span>
        SUMX(
        <span className="text-sky-600 dark:text-sky-400">
          FILTER(FactSales, RELATED(DimProduct[Category]) = &quot;{FILTER_CATEGORY}&quot;)
        </span>
        , <span className="text-amber-600 dark:text-amber-400">FactSales[Quantity] * FactSales[UnitPrice]</span>)
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="text-xs uppercase text-fd-muted-foreground">
              <th className="px-1.5 py-2 text-left sm:px-3">Product</th>
              <th className="border-x border-sky-500/40 px-1.5 py-2 text-left text-sky-600 sm:px-3 dark:text-sky-400">
                Category
              </th>
              <th className="px-1.5 py-2 text-right sm:px-3">Qty</th>
              <th className="px-1.5 py-2 text-right sm:px-3">Price</th>
              <th className="border-x border-amber-500/40 px-1.5 py-2 text-right text-amber-600 sm:px-3 dark:text-amber-400">
                Qty × Price
              </th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {SALES.map((r) => {
              const isKept = r.category === FILTER_CATEGORY;
              return (
                <tr key={r.id} className={cn('border-t border-fd-border', isKept ? 'bg-amber-500/10' : 'opacity-40')}>
                  <td className="px-1.5 py-2 font-sans sm:px-3">{r.product}</td>
                  <td className="border-x border-sky-500/40 px-1.5 py-2 sm:px-3">
                    <span className="inline-flex items-center gap-1.5">
                      {r.category}
                      {isKept && <Badge n="1" className="bg-sky-500" />}
                    </span>
                  </td>
                  <td className="px-1.5 py-2 text-right sm:px-3">{r.quantity}</td>
                  <td className="px-1.5 py-2 text-right sm:px-3">{fmt(r.unitPrice)}</td>
                  <td className="border-x border-amber-500/40 px-1.5 py-2 text-right sm:px-3">
                    {isKept ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Badge n="2" className="bg-amber-500" />
                        {fmt(r.quantity * r.unitPrice)}
                      </span>
                    ) : (
                      <span className="font-sans text-xs">skipped</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">Result</p>
        <p className="mt-1 flex items-start gap-1.5 font-mono text-base font-semibold text-fd-primary sm:text-lg">
          <Badge n="✓" className="mt-0.5 bg-fd-primary sm:mt-1" />
          <span>
            {kept.map((r) => fmt(r.quantity * r.unitPrice)).join(' + ')} = {fmt(total)}
          </span>
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Table</span> — evaluated <strong>first</strong>.{' '}
            <span className="font-mono">FILTER()</span> keeps only the {kept.length} rows whose related product category
            is {FILTER_CATEGORY}. <span className="font-mono">RELATED()</span> follows the relationship from each
            FactSales row to DimProduct, since Category isn&apos;t a FactSales column.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Expression</span> — evaluated{' '}
            <strong>once per surviving row</strong>, in that row&apos;s own row context. The Helmet and Jersey rows are
            never multiplied at all, and no Qty × Price column is ever stored in the model.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Result</span> — the per-row results are added up:{' '}
            {fmt(total)}. A plain <span className="font-mono">SUM()</span> can&apos;t do this, because there&apos;s no
            single column holding those per-row values to sum.
          </p>
        </div>
      </div>
    </div>
  );
}
