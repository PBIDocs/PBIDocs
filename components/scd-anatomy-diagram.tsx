import { cn } from '@/lib/cn';

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

export function ScdAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of Type 1 vs. Type 2: The Same Change, Two Outcomes
      </p>

      <div className="flex items-start gap-2 rounded-lg border border-fd-border bg-fd-background p-3 text-xs">
        <Badge n="1" className="mt-0.5 bg-fd-primary" />
        <p>
          Alice Smith moves from <span className="font-mono">West</span> to{' '}
          <span className="font-mono">East</span> on <span className="font-mono">2024-06-01</span>.{' '}
          <span className="font-mono">FactSales</span> has sales from both before and after that date, all
          originally referencing <span className="font-mono">CustomerKey 1001</span>.
        </p>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
        <Badge n="2" className="bg-amber-500" />
        Type 1 — Overwrite
      </p>
      <div className="mt-1 overflow-hidden rounded-lg border border-amber-500/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">CustomerKey</th>
              <th className="px-3 py-2 text-left">CustomerName</th>
              <th className="px-3 py-2 text-left">Region</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-t border-fd-border opacity-40">
              <td className="px-3 py-2">1001</td>
              <td className="px-3 py-2">Alice Smith</td>
              <td className="px-3 py-2 line-through">West</td>
            </tr>
            <tr className="border-t border-amber-500/40 bg-amber-500/10">
              <td className="px-3 py-2">1001</td>
              <td className="px-3 py-2">Alice Smith</td>
              <td className="px-3 py-2 text-amber-600 dark:text-amber-400">East</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-fd-muted-foreground">
        The same row, same key — the old value is gone. Every <span className="font-mono">FactSales</span> row that
        joins to <span className="font-mono">CustomerKey 1001</span> now shows East, including sales made in 2022
        while Alice was still in the West. History gets silently rewritten.
      </p>

      <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
        <Badge n="3" className="bg-sky-500" />
        Type 2 — New Row
      </p>
      <div className="mt-1 overflow-hidden rounded-lg border border-sky-500/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">CustomerKey</th>
              <th className="px-3 py-2 text-left">Region</th>
              <th className="px-3 py-2 text-left">EffectiveDate</th>
              <th className="px-3 py-2 text-left">ExpiryDate</th>
              <th className="px-3 py-2 text-left">IsCurrent</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-t border-fd-border">
              <td className="px-3 py-2">1001</td>
              <td className="px-3 py-2">West</td>
              <td className="px-3 py-2">2020-01-01</td>
              <td className="px-3 py-2">2024-06-01</td>
              <td className="px-3 py-2 text-fd-muted-foreground">No</td>
            </tr>
            <tr className="border-t border-sky-500/40 bg-sky-500/10">
              <td className="px-3 py-2">
                1002 <Badge n="✓" className="ml-1 inline-flex bg-sky-500" />
              </td>
              <td className="px-3 py-2 text-sky-600 dark:text-sky-400">East</td>
              <td className="px-3 py-2">2024-06-01</td>
              <td className="px-3 py-2">&mdash;</td>
              <td className="px-3 py-2 text-sky-600 dark:text-sky-400">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-fd-muted-foreground">
        A new surrogate key (<span className="font-mono">1002</span>) for the same person. A 2022 sale still
        references <span className="font-mono">CustomerKey 1001</span> (West), exactly as it did at the time; a
        2025 sale references <span className="font-mono">1002</span> (East). History stays accurate to when things
        actually happened.
      </p>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="flex items-center gap-1.5 font-mono text-sm font-semibold text-fd-primary">
          <Badge n="4" className="bg-fd-primary" />
          Same real-world event, two different histories left behind
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">The change</span> — one real-world event (Alice&apos;s
            region change) is the input to both strategies below.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="text-amber-600 dark:text-amber-400">Type 1</span> — simplest to implement, but every
            past fact row inherits the new value. Appropriate when historical accuracy for that attribute
            doesn&apos;t matter, like fixing a misspelled name.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="text-sky-600 dark:text-sky-400">Type 2</span> — requires a surrogate key and
            effective/expiry dates, but each fact row keeps pointing at the dimension row that was actually current
            when it happened.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">The tradeoff</span> — Type 1 costs nothing extra but loses
            history; Type 2 preserves history but grows the dimension table and needs the fact table to reference
            the right surrogate key at load time.
          </p>
        </div>
      </div>
    </div>
  );
}
