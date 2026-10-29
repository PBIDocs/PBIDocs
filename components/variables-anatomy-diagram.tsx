import { cn } from '@/lib/cn';

// [Total Sales] by region in $K, for the visual cell being evaluated (all regions, no slicer).
const REGIONS = [
  { region: 'West', sales: 40 },
  { region: 'East', sales: 35 },
  { region: 'Central', sales: 25 },
];
const GROSS_PROFIT = 30;

const total = REGIONS.reduce((s, r) => s + r.sales, 0);
const west = REGIONS.find((r) => r.region === 'West')!.sales;
const margin = GROSS_PROFIT / total;

const fmtK = (n: number) => `$${n}K`;

// Measure references in the page's "Profit Ratio" example, in the order they're evaluated.
const WITHOUT = ['[Gross Profit]', '[Total Sales]', '[Gross Profit]', '[Total Sales]'];

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

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('rounded px-1.5 py-0.5 font-mono text-[11px]', className)}>{children}</span>;
}

// Which regions a step read from: all three, or West only.
function RegionStrip({ only }: { only?: string }) {
  return (
    <div className="mt-1.5 flex gap-1">
      {REGIONS.map((r) => {
        const read = !only || r.region === only;
        return (
          <div
            key={r.region}
            className={cn(
              'flex-1 rounded px-1 py-0.5 text-center text-[10px]',
              read ? 'bg-sky-500/80 text-white' : 'bg-fd-foreground/10 text-fd-muted-foreground/60',
            )}
          >
            {r.region} <span className="font-mono">{r.sales}</span>
          </div>
        );
      })}
    </div>
  );
}

function Step({
  badge,
  badgeColor,
  code,
  note,
  value,
  valueClass,
  children,
}: {
  badge: string;
  badgeColor: string;
  code: React.ReactNode;
  note: React.ReactNode;
  value: string;
  valueClass?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-fd-border p-2">
      <div className="flex items-start gap-1.5">
        <Badge n={badge} className={cn('mt-0.5', badgeColor)} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] break-words">{code}</p>
          <p className="mt-0.5 text-[11px] text-fd-muted-foreground">{note}</p>
          {children}
        </div>
        <span className={cn('shrink-0 font-mono text-sm font-semibold', valueClass)}>{value}</span>
      </div>
    </div>
  );
}

export function VariablesAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a variable
      </p>

      {/* Part 1: computed once, reused */}
      <div className="rounded-lg border border-fd-border bg-fd-background p-3 leading-snug">
        <p className="text-xs text-fd-muted-foreground">
          Computed once: the page&apos;s <span className="font-mono">Profit Ratio</span> example
        </p>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-fd-border p-2">
            <p className="text-xs font-semibold">Without variables</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {WITHOUT.map((m, i) => (
                <Chip key={i} className="bg-fd-foreground/10">
                  {i + 1}. {m}
                </Chip>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-fd-muted-foreground">
              {WITHOUT.length} measure references, each evaluated where it appears
            </p>
          </div>
          <div className="rounded-md border border-emerald-500/40 p-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold">
              <Badge n="1" className="bg-violet-500" />
              With variables
            </p>
            <div className="mt-2 space-y-1 text-[11px]">
              <p>
                <Chip className="bg-violet-500/15 text-violet-700 dark:text-violet-300">Profit</Chip> ={' '}
                <span className="font-mono">{fmtK(GROSS_PROFIT)}</span>{' '}
                <span className="text-fd-muted-foreground">· 1×</span>
              </p>
              <p>
                <Chip className="bg-violet-500/15 text-violet-700 dark:text-violet-300">Sales</Chip> ={' '}
                <span className="font-mono">{fmtK(total)}</span>{' '}
                <span className="text-fd-muted-foreground">· 1×</span>
              </p>
              <p>
                <Chip className="bg-violet-500/15 text-violet-700 dark:text-violet-300">Margin</Chip> ={' '}
                <span className="font-mono">{margin.toFixed(2)}</span>{' '}
                <span className="text-fd-muted-foreground">· 1×</span>
              </p>
              <p className="flex flex-wrap items-center gap-1 pt-1">
                <Badge n="3" className="size-4 bg-emerald-500 text-[9px]" />
                <span className="font-mono">RETURN</span>
                <Chip className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Margin</Chip>+
                <Chip className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Margin</Chip>
                <span className="font-mono font-semibold text-fd-primary">= {(margin * 2).toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: fixed where it's defined */}
      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 leading-snug">
        <p className="text-xs text-fd-muted-foreground">
          Fixed where it&apos;s defined: two ways to write the page&apos;s{' '}
          <span className="font-mono">West Sales</span>
        </p>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-md border border-red-500/40 bg-red-500/5 p-2">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">VAR first, CALCULATE after</p>
            <Step
              badge="2"
              badgeColor="bg-sky-500"
              code={
                <>
                  VAR Sales = <span className="text-violet-600 dark:text-violet-400">[Total Sales]</span>
                </>
              }
              note="Evaluated in the visual's context: every region"
              value={fmtK(total)}
            >
              <RegionStrip />
            </Step>
            <Step
              badge="4"
              badgeColor="bg-red-500"
              code={
                <>
                  CALCULATE(<span className="text-violet-600 dark:text-violet-400">Sales</span>, DimCustomer[Region] = &quot;West&quot;)
                </>
              }
              note="The new filter has nothing to re-evaluate: Sales is already a number"
              value={fmtK(total)}
              valueClass="text-red-600 dark:text-red-400"
            />
          </div>
          <div className="space-y-2 rounded-md border border-emerald-500/40 p-2">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">CALCULATE inside the VAR</p>
            <Step
              badge="2"
              badgeColor="bg-sky-500"
              code={
                <>
                  VAR WestSales = CALCULATE(<span className="text-violet-600 dark:text-violet-400">[Total Sales]</span>,
                  DimCustomer[Region] = &quot;West&quot;)
                </>
              }
              note="The filter is in place while the measure is evaluated"
              value={fmtK(west)}
            >
              <RegionStrip only="West" />
            </Step>
            <Step
              badge="3"
              badgeColor="bg-emerald-500"
              code="RETURN WestSales"
              note="Reuses the stored value"
              value={fmtK(west)}
              valueClass="text-fd-primary"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">VAR</span> — names an expression and stores
            its <strong>result</strong>, not the expression. Profit, Sales and Margin are each computed at most once,
            however many times they&apos;re used.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Where it&apos;s defined</span> — a variable is
            evaluated in the filter context at the point it&apos;s declared. For a plain{' '}
            <span className="font-mono">VAR Sales = [Total Sales]</span> that&apos;s the visual&apos;s context, so it
            reads all three regions: {fmtK(total)}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Reuse</span> — every later reference
            gets the same stored value. That&apos;s the performance win, and it&apos;s also why the next point happens.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">CALCULATE can&apos;t reach in</span> — CALCULATE
            changes the filter context and then evaluates its first argument. A measure would be re-evaluated under
            the new filter; a variable is already a constant, so West Sales comes back as {fmtK(total)} instead of{' '}
            {fmtK(west)}, with no error. Put the CALCULATE <em>inside</em> the variable&apos;s definition.
          </p>
        </div>
      </div>
    </div>
  );
}
