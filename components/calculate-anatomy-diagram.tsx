import { cn } from '@/lib/cn';

// Incoming filter context: a matrix cell on the Accessories row, with a Region slicer set to West.
const REPORT_CONTEXT = { Category: 'Accessories', Region: 'West' };

// CALCULATE's filter argument replaces the existing filter on the same column.
const NEW_CONTEXT = { ...REPORT_CONTEXT, Category: 'Bikes' };

const SALES = [
  { id: 1, category: 'Bikes', region: 'West', amount: 1200 },
  { id: 2, category: 'Accessories', region: 'West', amount: 300 },
  { id: 3, category: 'Bikes', region: 'East', amount: 900 },
  { id: 4, category: 'Bikes', region: 'West', amount: 800 },
  { id: 5, category: 'Clothing', region: 'West', amount: 150 },
];

const inNewContext = (r: (typeof SALES)[number]) =>
  r.category === NEW_CONTEXT.Category && r.region === NEW_CONTEXT.Region;

const total = SALES.filter(inNewContext).reduce((sum, r) => sum + r.amount, 0);
const withoutCalculate = SALES.filter(
  (r) => r.category === REPORT_CONTEXT.Category && r.region === REPORT_CONTEXT.Region,
).reduce((sum, r) => sum + r.amount, 0);

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

function exclusionReason(r: (typeof SALES)[number]) {
  if (r.region !== NEW_CONTEXT.Region) return `Region ≠ ${NEW_CONTEXT.Region} (kept filter)`;
  if (r.category !== NEW_CONTEXT.Category) return `Category ≠ ${NEW_CONTEXT.Category}`;
  return null;
}

export function CalculateAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of CALCULATE()
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        <span className="text-fd-muted-foreground">Bike Sales = </span>
        CALCULATE(<span className="text-amber-600 dark:text-amber-400">[Total Sales]</span>,{' '}
        <span className="text-sky-600 dark:text-sky-400">DimProduct[Category] = &quot;Bikes&quot;</span>)
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-violet-500/40 bg-violet-500/10 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="1" className="bg-violet-500" />
            Incoming filter context
          </p>
          <div className="mt-2 space-y-1 font-mono text-sm">
            <p>Category = &quot;{REPORT_CONTEXT.Category}&quot;</p>
            <p>Region = &quot;{REPORT_CONTEXT.Region}&quot;</p>
          </div>
        </div>
        <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="2" className="bg-sky-500" />
            New filter context
          </p>
          <div className="mt-2 space-y-1 font-mono text-sm">
            <p>
              Category = <span className="text-fd-muted-foreground line-through">&quot;{REPORT_CONTEXT.Category}&quot;</span>{' '}
              <span className="font-semibold text-sky-600 dark:text-sky-400">&quot;{NEW_CONTEXT.Category}&quot;</span>
              <span className="ml-2 font-sans text-xs text-fd-muted-foreground">replaced</span>
            </p>
            <p>
              Region = &quot;{NEW_CONTEXT.Region}&quot;
              <span className="ml-2 font-sans text-xs text-fd-muted-foreground">kept</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Region</th>
              <th className="px-3 py-2 text-right">SalesAmount</th>
              <th className="px-3 py-2 text-left" />
            </tr>
          </thead>
          <tbody className="font-mono">
            {SALES.map((r) => {
              const included = inNewContext(r);
              return (
                <tr
                  key={r.id}
                  className={cn('border-t border-fd-border', included ? 'bg-amber-500/10' : 'opacity-40')}
                >
                  <td className="px-3 py-2">{r.category}</td>
                  <td className="px-3 py-2">{r.region}</td>
                  <td className="border-x border-amber-500/40 px-3 py-2 text-right">
                    <span className="inline-flex items-center gap-1.5">
                      {included && <Badge n="3" className="bg-amber-500" />}
                      {fmt(r.amount)}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-sans text-xs whitespace-nowrap text-fd-muted-foreground">
                    {included ? 'summed' : exclusionReason(r)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">Result</p>
        <p className="mt-1 flex items-center gap-1.5 font-mono text-lg font-semibold text-fd-primary">
          <Badge n="✓" className="bg-fd-primary" />
          {fmt(total)}
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">Incoming filter context</span> — what
            the report already applies to this cell: the matrix row is{' '}
            <span className="font-mono">{REPORT_CONTEXT.Category}</span> and a slicer is set to{' '}
            <span className="font-mono">{REPORT_CONTEXT.Region}</span>. A plain{' '}
            <span className="font-mono">[Total Sales]</span> here would return {fmt(withoutCalculate)}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Filter argument</span> — applied{' '}
            <strong>before</strong> the expression runs. It targets <span className="font-mono">Category</span>,
            which is already filtered, so it <strong>replaces</strong> that filter.{' '}
            <span className="font-mono">Region</span> isn&apos;t mentioned, so it survives untouched. (Wrap the
            argument in <span className="font-mono">KEEPFILTERS()</span> to intersect instead of replace.)
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Expression</span> — evaluated{' '}
            <strong>last</strong>, against only the rows the new context allows. The East bike sale is still
            excluded: the Region filter from step 1 never went away.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Result</span> — {fmt(total)}: West bike sales, shown on the
            Accessories row. That mismatch is exactly what &quot;CALCULATE overrides filters&quot; looks like in a
            real visual.
          </p>
        </div>
      </div>
    </div>
  );
}
