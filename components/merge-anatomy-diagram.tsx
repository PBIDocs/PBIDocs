import { cn } from '@/lib/cn';

const SALES = [
  { id: 'S1', customerId: 1, amount: 100 },
  { id: 'S2', customerId: 2, amount: 200 },
  { id: 'S3', customerId: 3, amount: 150 },
];

// CustomerID 2 appears twice (a duplicate key), and CustomerID 3 has no row at all.
const CUSTOMERS = [
  { customerId: 1, name: 'Alice', segment: 'Retail' },
  { customerId: 2, name: 'Bob', segment: 'Retail' },
  { customerId: 2, name: 'Bob', segment: 'Wholesale' },
  { customerId: 4, name: 'Dana', segment: 'Retail' },
];

const matchesFor = (customerId: number) => CUSTOMERS.filter((c) => c.customerId === customerId);

type ExpandedRow = (typeof SALES)[number] & {
  name: string | null;
  segment: string | null;
  kind: 'match' | 'fanout' | 'unmatched';
};

// Left Outer: every Sales row survives. Expanding a 0-row nested table gives nulls; an n-row one gives n rows.
const EXPANDED: ExpandedRow[] = SALES.flatMap((s): ExpandedRow[] => {
  const m = matchesFor(s.customerId);
  if (m.length === 0) return [{ ...s, name: null, segment: null, kind: 'unmatched' }];
  return m.map((c, i) => ({ ...s, name: c.name, segment: c.segment, kind: i > 0 ? 'fanout' : 'match' }));
});

const totalBefore = SALES.reduce((sum, s) => sum + s.amount, 0);
const totalAfter = EXPANDED.reduce((sum, r) => sum + r.amount, 0);
const dropped = CUSTOMERS.filter((c) => !SALES.some((s) => s.customerId === c.customerId));

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

function Arrow({ label }: { label: string }) {
  return (
    <p className="my-2 text-center text-xs text-fd-muted-foreground">
      ↓ <span className="font-mono">{label}</span>
    </p>
  );
}

const th = 'px-2 py-1.5 text-left text-xs font-normal uppercase text-fd-muted-foreground';
const td = 'px-2 py-1.5';

export function MergeAnatomyDiagram() {
  const fanout = EXPANDED.find((r) => r.kind === 'fanout')!;
  const unmatched = EXPANDED.find((r) => r.kind === 'unmatched')!;

  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a merge (Left Outer)
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">Sales (base table)</p>
          <table className="mt-1 w-full border-collapse font-mono text-sm">
            <thead>
              <tr>
                <th className={cn(th, 'bg-sky-500/10')}>
                  <span className="inline-flex items-center gap-1.5">
                    <Badge n="1" className="size-4 bg-sky-500 text-[9px]" />
                    CustomerID
                  </span>
                </th>
                <th className={cn(th, 'text-right')}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {SALES.map((s) => (
                <tr key={s.id} className="border-t border-fd-border">
                  <td className={cn(td, 'bg-sky-500/10')}>{s.customerId}</td>
                  <td className={cn(td, 'text-right')}>{fmt(s.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">Customers (merge with)</p>
          <table className="mt-1 w-full border-collapse font-mono text-sm">
            <thead>
              <tr>
                <th className={cn(th, 'bg-sky-500/10')}>CustomerID</th>
                <th className={th}>Name</th>
                <th className={th}>Segment</th>
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.map((c, i) => (
                <tr key={i} className="border-t border-fd-border">
                  <td className={cn(td, 'bg-sky-500/10', CUSTOMERS.filter((x) => x.customerId === c.customerId).length > 1 && 'text-red-600 dark:text-red-400')}>
                    {c.customerId}
                  </td>
                  <td className={td}>{c.name}</td>
                  <td className={td}>{c.segment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Arrow label="merge on CustomerID" />

      <div className="rounded-lg border border-violet-500/40 bg-fd-background p-3">
        <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
          <Badge n="2" className="bg-violet-500" />
          One new column, holding a nested table per row
        </p>
        <table className="mt-1 w-full border-collapse font-mono text-sm">
          <thead>
            <tr>
              <th className={th}>CustomerID</th>
              <th className={cn(th, 'text-right')}>Amount</th>
              <th className={cn(th, 'text-violet-600 dark:text-violet-400')}>Customers</th>
            </tr>
          </thead>
          <tbody>
            {SALES.map((s) => {
              const n = matchesFor(s.customerId).length;
              return (
                <tr key={s.id} className="border-t border-fd-border">
                  <td className={td}>{s.customerId}</td>
                  <td className={cn(td, 'text-right')}>{fmt(s.amount)}</td>
                  <td className={td}>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-xs',
                        n === 1 && 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
                        n > 1 && 'bg-red-500/10 text-red-700 dark:text-red-300',
                        n === 0 && 'bg-fd-muted text-fd-muted-foreground',
                      )}
                    >
                      Table ({n} {n === 1 ? 'row' : 'rows'})
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Arrow label="expand → Name, Segment" />

      <div className="overflow-x-auto rounded-lg border border-amber-500/40 bg-fd-background p-3">
        <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
          <Badge n="3" className="bg-amber-500" />
          Expanded: {SALES.length} Sales rows in, {EXPANDED.length} rows out
        </p>
        <table className="mt-1 w-full border-collapse font-mono text-sm">
          <thead>
            <tr>
              <th className={th}>CustomerID</th>
              <th className={cn(th, 'text-right')}>Amount</th>
              <th className={th}>Name</th>
              <th className={th}>Segment</th>
              <th className={cn(th, 'hidden sm:table-cell')} />
            </tr>
          </thead>
          <tbody>
            {EXPANDED.map((r, i) => (
              <tr
                key={i}
                className={cn(
                  'border-t border-fd-border',
                  r.kind === 'fanout' && 'bg-red-500/10',
                  r.kind === 'unmatched' && 'bg-fd-muted/50',
                )}
              >
                <td className={td}>
                  <span className="inline-flex items-center gap-1">
                    {r.customerId}
                    {r.kind === 'fanout' && <Badge n="4" className="size-4 bg-red-500 text-[9px] sm:hidden" />}
                  </span>
                </td>
                <td className={cn(td, 'text-right')}>{fmt(r.amount)}</td>
                <td className={cn(td, r.name === null && 'text-fd-muted-foreground italic')}>{r.name ?? 'null'}</td>
                <td className={cn(td, r.segment === null && 'text-fd-muted-foreground italic')}>{r.segment ?? 'null'}</td>
                <td className={cn(td, 'hidden font-sans text-xs whitespace-nowrap text-fd-muted-foreground sm:table-cell')}>
                  {r.kind === 'fanout' && (
                    <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-300">
                      <Badge n="4" className="size-4 bg-red-500 text-[9px]" />
                      duplicate
                    </span>
                  )}
                  {r.kind === 'unmatched' && 'no match, kept'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">Sum of Amount</p>
        <p className="mt-1 flex items-center gap-1.5 font-mono text-lg font-semibold">
          <Badge n="✓" className="bg-fd-primary" />
          <span>{fmt(totalBefore)}</span>
          <span className="text-fd-muted-foreground">→</span>
          <span className="text-red-600 dark:text-red-400">{fmt(totalAfter)}</span>
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Key columns</span> — each Sales row looks up
            every Customers row with the same CustomerID. The merge-with key isn&apos;t required to be unique, and here
            it isn&apos;t: CustomerID {fanout.customerId} appears twice.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">Nested table column</span> — the merge
            itself doesn&apos;t add rows. Each Sales row gets one cell holding <strong>all</strong> its matches as a
            table: 1 row, 2 rows, or an empty table when nothing matched.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Expand</span> — this is where row counts
            change. The empty table becomes one row of nulls (CustomerID {unmatched.customerId}, kept because this is
            Left Outer). Customer {dropped.map((c) => c.customerId).join(', ')} ({dropped.map((c) => c.name).join(', ')})
            never appears, because no Sales row pointed at it.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">Fan-out</span> — the 2-row table expands into 2
            rows, so the {fmt(fanout.amount)} sale now appears twice and the total grows from {fmt(totalBefore)} to{' '}
            {fmt(totalAfter)} with no error anywhere. Check that the merge-with key is unique first.
          </p>
        </div>
      </div>
    </div>
  );
}
