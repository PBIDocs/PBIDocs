import type { ReactNode } from 'react';
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

function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold', className)}>{children}</span>
  );
}

function TableBox({
  name,
  mode,
  pillClass,
  boxClass,
  badge,
}: {
  name: string;
  mode: string;
  pillClass: string;
  boxClass: string;
  badge: ReactNode;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-2 rounded-lg border p-2.5', boxClass)}>
      <span className="flex items-center gap-1.5 font-mono text-xs">
        {badge}
        {name}
      </span>
      <Pill className={pillClass}>{mode}</Pill>
    </div>
  );
}

export function CompositeModelAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a Composite Model
      </p>

      <div className="mx-auto flex max-w-xs flex-col items-center gap-0">
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <TableBox
              name="DimDate"
              mode="Dual"
              pillClass="bg-sky-500/15 text-sky-600 dark:text-sky-400"
              boxClass="border-sky-500/40"
              badge={<Badge n="2" className="bg-sky-500" />}
            />
          </div>
          <div className="flex-1">
            <TableBox
              name="DimProduct"
              mode="Dual"
              pillClass="bg-sky-500/15 text-sky-600 dark:text-sky-400"
              boxClass="border-sky-500/40"
              badge={<Badge n="2" className="bg-sky-500" />}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <span className="h-5 w-px bg-fd-border" />
          <Badge n="3" className="bg-emerald-500" />
          filters
          <span className="h-5 w-px bg-fd-border" />
        </div>

        <div className="w-full">
          <TableBox
            name="FactSales"
            mode="DirectQuery"
            pillClass="bg-amber-500/15 text-amber-600 dark:text-amber-400"
            boxClass="border-amber-500/40"
            badge={<Badge n="1" className="bg-amber-500" />}
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="flex items-center gap-1.5 font-mono text-sm font-semibold text-fd-primary">
          <Badge n="4" className="bg-fd-primary" />
          Fast slicers, live fact data, no multi-GB import
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="text-amber-600 dark:text-amber-400">FactSales — DirectQuery</span> — too large to
            import comfortably. Every query against it is sent live to the source, every time.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="text-sky-600 dark:text-sky-400">DimDate &amp; DimProduct — Dual</span> — act like
            Import when a slicer or visual filters by them alone (fast, in-memory), but switch to DirectQuery
            behavior the moment a query needs to join against the DirectQuery fact table.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="text-emerald-600 dark:text-emerald-400">Filter direction</span> — filtering from a
            Dual or Import dimension into a DirectQuery fact table is the most common, best-supported direction. The
            reverse (fact filtering a dimension) is far more restricted.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">The payoff</span> — slicers and filters stay fast because
            the dimensions are effectively in-memory, while the huge fact table never needs a refresh and always
            reflects the live source.
          </p>
        </div>
      </div>
    </div>
  );
}
