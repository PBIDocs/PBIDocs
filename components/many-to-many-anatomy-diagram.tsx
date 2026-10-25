import { cn } from '@/lib/cn';

const BRIDGE = [
  { product: 1001, category: 10 },
  { product: 1001, category: 11 },
  { product: 1002, category: 10 },
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

export function ManyToManyAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of Many-to-Many: Two Ways to Model the Same Case
      </p>

      <div className="flex items-start gap-2 rounded-lg border border-fd-border bg-fd-background p-3 text-xs">
        <Badge n="1" className="mt-0.5 bg-fd-primary" />
        <p>
          <span className="font-mono">ProductKey 1001</span> belongs to two categories —{' '}
          <span className="font-mono">10</span> and <span className="font-mono">11</span>. Neither side has a
          single unique key the other can filter through cleanly, which is what makes this many-to-many instead of
          one-to-many.
        </p>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
        <Badge n="2" className="bg-amber-500" />
        Option A — Native Many-to-Many
      </p>
      <div className="mt-1 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
          <span className="rounded-md border border-amber-500/40 px-2 py-1">
            DimProduct[CategoryKey]
            <span className="ml-1 text-amber-600 dark:text-amber-400">(not unique)</span>
          </span>
          <span className="text-amber-600 dark:text-amber-400">&harr; many : many &harr;</span>
          <span className="rounded-md border border-amber-500/40 px-2 py-1">
            DimCategory[CategoryKey]
            <span className="ml-1 text-amber-600 dark:text-amber-400">(not unique)</span>
          </span>
        </div>
        <p className="mt-2 text-xs text-fd-muted-foreground">
          Works for exactly these two tables. Add a third table that needs to filter through this same relationship,
          and Power BI has no single unambiguous path to resolve — and there&apos;s nowhere on either table to store
          an attribute of the pairing itself, like a percentage split.
        </p>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
        <Badge n="3" className="bg-sky-500" />
        Option B — Bridge Table
      </p>
      <div className="mt-1 overflow-hidden rounded-lg border border-sky-500/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">ProductKey</th>
              <th className="px-3 py-2 text-left">CategoryKey</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {BRIDGE.map((b, i) => (
              <tr key={i} className="border-t border-fd-border">
                <td className="px-3 py-2">{b.product}</td>
                <td className="px-3 py-2">{b.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-fd-muted-foreground">
        <span className="font-mono">DimProduct</span> and <span className="font-mono">DimCategory</span> both stay
        unique on their own key — the duplication lives only in this narrow junction table, which is what keeps
        every individual relationship one-to-many. A third table joins to either dimension exactly like it would in
        any ordinary star schema.
      </p>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="flex items-center gap-1.5 font-mono text-sm font-semibold text-fd-primary">
          <Badge n="4" className="bg-fd-primary" />
          Same relationship, two structures — the bridge table is the one that scales
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">The shared case</span> — both options model the exact same
            real-world fact: a product can belong to more than one category.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="text-amber-600 dark:text-amber-400">Native many-to-many</span> — set directly in the
            relationship editor, no extra table needed. Fine for a quick, isolated, two-table case.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="text-sky-600 dark:text-sky-400">Bridge table</span> — an explicit junction table turns
            one ambiguous many-to-many join into two clean one-to-many joins. See{' '}
            <span className="font-mono">Bridge Tables</span> for the full pattern.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">When to choose which</span> — reach for the bridge table
            once a third table needs to filter through the relationship, or the pairing itself carries an attribute
            worth storing.
          </p>
        </div>
      </div>
    </div>
  );
}
