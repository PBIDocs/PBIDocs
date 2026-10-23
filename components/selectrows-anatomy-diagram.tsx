import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const ROWS = [
  { order: 1001, status: 'Active', amount: 150 },
  { order: 1002, status: 'Inactive', amount: 200 },
  { order: 1003, status: 'Active', amount: 80 },
  { order: 1004, status: 'Pending', amount: 300 },
  { order: 1005, status: 'Active', amount: 120 },
];

const firstKeptIndex = ROWS.findIndex((r) => r.status === 'Active');
const firstDroppedIndex = ROWS.findIndex((r) => r.status !== 'Active');

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

export function SelectRowsAnatomyDiagram() {
  const kept = ROWS.filter((r) => r.status === 'Active');

  return (
    <div className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of Table.SelectRows()
      </p>

      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 font-mono text-sm">
        <span className="text-fd-muted-foreground">Table.SelectRows(Source, </span>
        <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
          each [Status] = &quot;Active&quot;
          <Badge n="1" className="bg-amber-500" />
        </span>
        <span className="text-fd-muted-foreground">)</span>
      </div>

      <p className="mt-4 text-xs text-fd-muted-foreground">Source — condition checked once per row</p>
      <div className="mt-1 overflow-hidden rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">OrderID</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">each [Status] = &quot;Active&quot;</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {ROWS.map((r, i) => {
              const matches = r.status === 'Active';
              return (
                <tr
                  key={r.order}
                  className={cn('border-t border-fd-border', matches ? 'bg-emerald-500/10' : 'opacity-60')}
                >
                  <td className="px-3 py-2 text-fd-muted-foreground">{r.order}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{r.amount}</td>
                  <td className="px-3 py-2">
                    {matches ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3.5" /> true — kept
                        {i === firstKeptIndex && <Badge n="2" className="bg-emerald-500" />}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-fd-muted-foreground">
                        <X className="size-3.5" /> false — dropped
                        {i === firstDroppedIndex && <Badge n="3" className="bg-red-500" />}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        Result — <span className="font-mono">{kept.length}</span> of <span className="font-mono">{ROWS.length}</span>{' '}
        rows kept, same column order, nothing recomputed
      </p>
      <div className="mt-1 overflow-hidden rounded-lg border border-emerald-500/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">OrderID</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {kept.map((r) => (
              <tr key={r.order} className="border-t border-fd-border">
                <td className="px-3 py-2 text-fd-muted-foreground">{r.order}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Condition</span> — a function evaluated{' '}
            <strong>once per row</strong>, independently. It never sees other rows, only the current one via{' '}
            <span className="font-mono">[Status]</span>.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">true</span> — the row is kept,
            unchanged, in the result.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">false</span> — the row is dropped entirely,
            not just hidden. <span className="font-mono">Table.SelectRows()</span> never modifies a value, only
            decides whether each row survives.
          </p>
        </div>
      </div>
    </div>
  );
}
