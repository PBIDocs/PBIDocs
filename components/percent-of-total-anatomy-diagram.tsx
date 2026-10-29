import { cn } from '@/lib/cn';

// Sales in $K. Bikes and Gear products match the page's % of Category example; their category totals
// (and Apparel's $10K) match the intro table. Apparel gets one product so every category has a row.
const PRODUCTS = [
  { cat: 'Bikes', name: 'Tire A', sales: 30 },
  { cat: 'Bikes', name: 'Tire B', sales: 15 },
  { cat: 'Gear', name: 'Helmet A', sales: 12 },
  { cat: 'Gear', name: 'Helmet B', sales: 8 },
  { cat: 'Apparel', name: 'Jersey A', sales: 10 },
];
const CATEGORIES = [...new Set(PRODUCTS.map((p) => p.cat))];

// The visual row the zoom panel follows.
const CURRENT = 'Tire B';

type Ctx = { cat?: string; name?: string };
const sumWhere = (keep: (p: (typeof PRODUCTS)[number]) => boolean) =>
  PRODUCTS.filter(keep).reduce((s, p) => s + p.sales, 0);
const inCtx = (ctx: Ctx) => (p: (typeof PRODUCTS)[number]) =>
  (!ctx.cat || p.cat === ctx.cat) && (!ctx.name || p.name === ctx.name);

// Each denominator: which products it keeps for a given visual context.
const DENOMINATORS = [
  {
    badge: '2',
    label: '% of Total',
    expr: 'ALL(DimProduct)',
    keep: () => () => true,
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/40',
    fill: 'bg-sky-500/80',
    badgeColor: 'bg-sky-500',
  },
  {
    badge: '3',
    label: '% of Category',
    expr: 'ALLEXCEPT(DimProduct, DimProduct[Category])',
    keep: (ctx: Ctx) => inCtx({ cat: ctx.cat }),
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/40',
    fill: 'bg-emerald-500/80',
    badgeColor: 'bg-emerald-500',
  },
  {
    badge: '4',
    label: 'No filter removed',
    expr: 'CALCULATE([Total Sales])',
    keep: (ctx: Ctx) => inCtx(ctx),
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/40 bg-red-500/5',
    fill: 'bg-red-500/80',
    badgeColor: 'bg-red-500',
  },
];

const pct = (num: number, den: number) => `${Math.round((num / den) * 100)}%`;
const fmtK = (n: number) => `$${n}K`;

const current = PRODUCTS.find((p) => p.name === CURRENT)!;
const currentCtx: Ctx = { cat: current.cat, name: current.name };

// Rows of the matrix visual: each product, a subtotal per category, and the grand total.
const MATRIX: { label: string; ctx: Ctx; kind: 'product' | 'subtotal' | 'total' }[] = [
  ...CATEGORIES.flatMap((cat) => [
    ...PRODUCTS.filter((p) => p.cat === cat).map((p) => ({
      label: p.name,
      ctx: { cat, name: p.name },
      kind: 'product' as const,
    })),
    { label: `${cat} total`, ctx: { cat }, kind: 'subtotal' as const },
  ]),
  { label: 'Grand total', ctx: {}, kind: 'total' },
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

export function PercentOfTotalAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a percent of total
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        <span className="text-fd-muted-foreground">% = </span>
        DIVIDE(<span className="text-amber-600 dark:text-amber-400">[Total Sales]</span>,{' '}
        <span className="text-sky-600 dark:text-sky-400">CALCULATE([Total Sales], …)</span>)
      </div>

      {/* Zoom: one visual row, one numerator, three denominators */}
      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">Evaluating the {CURRENT} row of the visual</p>

        <div className="mt-2 flex items-center gap-2 rounded-md border border-amber-500/40 p-2 text-xs">
          <Badge n="1" className="bg-amber-500" />
          <p>
            <span className="font-semibold">Numerator</span>{' '}
            <span className="text-fd-muted-foreground">
              — the visual&apos;s filter, Product = {CURRENT}, is left alone:
            </span>{' '}
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {fmtK(current.sales)}
            </span>
          </p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DENOMINATORS.map((d) => {
            const keep = d.keep(currentCtx);
            const den = sumWhere(keep);
            return (
              <div key={d.badge} className={cn('rounded-md border p-2', d.border)}>
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <Badge n={d.badge} className={d.badgeColor} />
                  {d.label}
                </p>
                <p className={cn('mt-1 font-mono text-[11px] break-words', d.text)}>{d.expr}</p>
                <div className="mt-2 space-y-1">
                  {PRODUCTS.map((p) => {
                    const kept = keep(p);
                    return (
                      <div
                        key={p.name}
                        className={cn(
                          'flex items-center justify-between rounded px-1.5 py-0.5 text-[11px]',
                          kept ? cn(d.fill, 'text-white') : 'bg-fd-foreground/10 text-fd-muted-foreground/60',
                          p.name === CURRENT && 'ring-2 ring-amber-500 ring-inset',
                        )}
                      >
                        <span>
                          {p.name} <span className="opacity-70">· {p.cat}</span>
                        </span>
                        <span className="font-mono">{p.sales}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 font-mono text-xs text-fd-muted-foreground">
                  {fmtK(current.sales)} ÷ {fmtK(den)} =
                </p>
                <p className={cn('font-mono text-lg font-semibold', d.badge === '4' ? d.text : 'text-fd-primary')}>
                  {pct(current.sales, den)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Every row of the matrix visual */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">What the matrix visual shows</p>
        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="text-[10px] uppercase text-fd-muted-foreground">
              <th className="px-1.5 py-1.5 text-left font-normal">Product</th>
              <th className="px-1.5 py-1.5 text-right font-normal text-amber-600 dark:text-amber-400">Sales</th>
              {DENOMINATORS.map((d) => (
                <th key={d.badge} className={cn('px-1.5 py-1.5 text-right font-normal', d.text)}>
                  <span className="inline-flex items-center gap-1">
                    <Badge n={d.badge} className={cn('size-4 text-[9px]', d.badgeColor)} />
                    <span className="hidden sm:inline">{d.label}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {MATRIX.map((row) => {
              const num = sumWhere(inCtx(row.ctx));
              return (
                <tr
                  key={row.label}
                  className={cn(
                    'border-t border-fd-border',
                    row.kind !== 'product' && 'font-semibold',
                    row.kind === 'total' && 'border-t-2',
                    row.ctx.name === CURRENT && 'bg-amber-500/10',
                  )}
                >
                  <td
                    className={cn(
                      'px-1.5 py-1 font-sans text-xs whitespace-nowrap',
                      row.kind === 'product' && 'pl-4',
                    )}
                  >
                    {row.label}
                  </td>
                  <td className="px-1.5 py-1 text-right">{fmtK(num)}</td>
                  {DENOMINATORS.map((d) => (
                    <td
                      key={d.badge}
                      className={cn('px-1.5 py-1 text-right', d.badge === '4' && 'text-red-600 dark:text-red-400')}
                    >
                      {pct(num, sumWhere(d.keep(row.ctx)))}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Numerator</span> — plain{' '}
            <span className="font-mono">[Total Sales]</span>, evaluated in whatever context the visual row sets. Every
            variant shares it; only the denominator changes.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">ALL(DimProduct)</span> — removes every filter on
            the product table, so the denominator is the full {fmtK(sumWhere(() => true))} on every row. Category
            subtotals come out at the intro table&apos;s{' '}
            {CATEGORIES.map((c) => pct(sumWhere(inCtx({ cat: c })), sumWhere(() => true))).join(' / ')}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">ALLEXCEPT(…, Category)</span> — removes
            the Product filter but keeps Category, so {CURRENT} is divided by the {current.cat} total (
            {fmtK(sumWhere(inCtx({ cat: current.cat })))}), not the grand total. Each category&apos;s products add up
            to 100%, and so does every subtotal row.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">No filter removed</span> — the page&apos;s
            &quot;Dividing by a Filtered Denominator&quot; mistake. The denominator sees the same filters as the
            numerator, so it&apos;s the same number, and every row shows 100%.
          </p>
        </div>
      </div>
    </div>
  );
}
