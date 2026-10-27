import { cn } from '@/lib/cn';

const PRODUCTS = {
  'Road Bike': { category: 'Bikes', color: 'Red' },
  'Mountain Bike': { category: 'Bikes', color: 'Blue' },
  'Kids Bike': { category: 'Bikes', color: 'Red' },
  Helmet: { category: 'Accessories', color: 'Red' },
  Jersey: { category: 'Clothing', color: 'Blue' },
} as const;

type ProductName = keyof typeof PRODUCTS;

const SALES: { product: ProductName; region: string; amount: number }[] = [
  { product: 'Road Bike', region: 'West', amount: 1200 },
  { product: 'Road Bike', region: 'East', amount: 800 },
  { product: 'Mountain Bike', region: 'West', amount: 900 },
  { product: 'Kids Bike', region: 'West', amount: 300 },
  { product: 'Kids Bike', region: 'East', amount: 250 },
  { product: 'Helmet', region: 'West', amount: 100 },
  { product: 'Helmet', region: 'East', amount: 50 },
  { product: 'Jersey', region: 'West', amount: 150 },
];

type FilterKey = 'product' | 'category' | 'color' | 'region';

// The report cell: a matrix row for Road Bike, slicers on Category, Color, and Region.
const CONTEXT: Record<FilterKey, string> = { product: 'Road Bike', category: 'Bikes', color: 'Red', region: 'West' };

const FILTERS: { key: FilterKey; column: string; source: string; className: string }[] = [
  { key: 'product', column: 'DimProduct[Product]', source: 'matrix row', className: 'border-sky-500/40 bg-sky-500/10' },
  { key: 'category', column: 'DimProduct[Category]', source: 'slicer', className: 'border-emerald-500/40 bg-emerald-500/10' },
  { key: 'color', column: 'DimProduct[Color]', source: 'slicer', className: 'border-rose-500/40 bg-rose-500/10' },
  { key: 'region', column: 'DimCustomer[Region]', source: 'slicer', className: 'border-amber-500/40 bg-amber-500/10' },
];

const VARIANTS: { badge: string; modifier: string; removes: FilterKey[] }[] = [
  { badge: '1', modifier: '(no modifier)', removes: [] },
  { badge: '2', modifier: 'ALL(DimProduct[Product])', removes: ['product'] },
  { badge: '3', modifier: 'ALLEXCEPT(DimProduct, DimProduct[Category])', removes: ['product', 'color'] },
  { badge: '4', modifier: 'REMOVEFILTERS(DimProduct)', removes: ['product', 'category', 'color'] },
];

function evaluate(removes: FilterKey[]) {
  const active = (k: FilterKey) => !removes.includes(k);
  return SALES.filter((s) => {
    const p = PRODUCTS[s.product];
    return (
      (!active('product') || s.product === CONTEXT.product) &&
      (!active('category') || p.category === CONTEXT.category) &&
      (!active('color') || p.color === CONTEXT.color) &&
      (!active('region') || s.region === CONTEXT.region)
    );
  }).reduce((sum, s) => sum + s.amount, 0);
}

const results = VARIANTS.map((v) => evaluate(v.removes));

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

function FilterPill({ filter, removed }: { filter: (typeof FILTERS)[number]; removed: boolean }) {
  return (
    <span
      className={cn(
        'rounded-md border px-2 py-0.5 font-mono text-xs',
        removed ? 'border-dashed border-fd-border text-fd-muted-foreground line-through opacity-60' : filter.className,
      )}
    >
      {filter.key === 'region' ? 'Region' : filter.key[0].toUpperCase() + filter.key.slice(1)} = {CONTEXT[filter.key]}
    </span>
  );
}

export function AllFunctionsAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of ALL(), ALLEXCEPT() &amp; REMOVEFILTERS()
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">Incoming filter context for one report cell</p>
        <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {FILTERS.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-2">
              <FilterPill filter={f} removed={false} />
              <span className="text-[11px] text-fd-muted-foreground">
                {f.source} · <span className="font-mono">{f.column.split('[')[0]}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {VARIANTS.map((v, i) => (
          <div key={v.modifier} className="rounded-lg border border-fd-border bg-fd-background p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="flex items-start gap-1.5 font-mono text-xs sm:text-sm">
                <Badge n={v.badge} className="bg-fd-primary" />
                <span>
                  CALCULATE([Total Sales]
                  {v.removes.length > 0 && (
                    <>
                      , <span className="font-semibold">{v.modifier}</span>
                    </>
                  )}
                  )
                </span>
              </p>
              <span className="font-mono text-base font-semibold whitespace-nowrap text-fd-primary">{fmt(results[i])}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <FilterPill key={f.key} filter={f} removed={v.removes.includes(f.key)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono">No modifier</span> — all four filters apply: West sales of the Road Bike only.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono">ALL(column)</span> — removes exactly one column&apos;s filter. Category and Color
            still apply, so this is every red bike sold in the West.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono">ALLEXCEPT(table, column)</span> — removes every DimProduct filter{' '}
            <strong>except</strong> Category, so the Color slicer is ignored too: all bikes in the West.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono">REMOVEFILTERS(table)</span> — the same as{' '}
            <span className="font-mono">ALL(DimProduct)</span> inside CALCULATE: every DimProduct filter is gone. Region
            still survives, because it lives on <strong>DimCustomer</strong> and none of these functions touch a table
            they weren&apos;t given. That&apos;s what makes {fmt(results[0])} ÷ {fmt(results[3])} ={' '}
            {Math.round((results[0] / results[3]) * 100)}% a percent of <em>West</em> sales, not of all sales.
          </p>
        </div>
      </div>
    </div>
  );
}
