import { cn } from '@/lib/cn';

// The page's "Metric" parameter, with the page's display-name renames, as the table Desktop generates.
const METRIC = [
  { label: 'Revenue', field: "'FactSales'[Total Sales]", order: 0 },
  { label: 'Profit', field: "'FactSales'[Total Profit]", order: 1 },
  { label: 'Units', field: "'FactSales'[Total Units]", order: 2 },
];
const BREAKDOWN = [
  { label: 'Category', field: "'DimProduct'[Category]", order: 0 },
  { label: 'Region', field: "'DimStore'[Region]", order: 1 },
  { label: 'Year', field: "'DimDate'[Year]", order: 2 },
];

// $K values for the two states shown. Both breakdowns add up to the same totals (75 sales, 23 profit).
const VALUES: Record<string, Record<string, Record<string, number>>> = {
  Revenue: { Category: { Bikes: 45, Gear: 20, Apparel: 10 }, Region: { West: 30, East: 25, Central: 20 } },
  Profit: { Category: { Bikes: 12, Gear: 7, Apparel: 4 }, Region: { West: 9, East: 8, Central: 6 } },
};

const STATES = [
  { metric: 'Revenue', breakdown: 'Category', bar: 'bg-sky-500/80' },
  { metric: 'Profit', breakdown: 'Region', bar: 'bg-emerald-500/80' },
];

const fieldOf = (list: typeof METRIC, label: string) => list.find((r) => r.label === label)!.field;

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

function Slicer({ title, options, selected }: { title: string; options: typeof METRIC; selected: string }) {
  return (
    <div>
      <p className="text-[10px] text-fd-muted-foreground">{title}</p>
      <div className="mt-0.5 flex gap-1">
        {options.map((o) => (
          <span
            key={o.label}
            className={cn(
              'rounded border px-1.5 py-0.5 text-[11px]',
              o.label === selected
                ? 'border-amber-500 bg-amber-500/15 font-semibold text-amber-700 dark:text-amber-300'
                : 'border-fd-border text-fd-muted-foreground',
            )}
          >
            {o.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FieldParametersAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a field parameter
      </p>

      {/* The parameter table */}
      <div className="rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">What Modeling › New parameter › Fields writes</p>
        <pre className="mt-2 overflow-x-auto font-mono text-[10px] leading-snug sm:text-xs">
          {'Metric = {\n'}
          {METRIC.map((r, i) => (
            <span key={r.label}>
              {'  ('}
              <span className="text-sky-600 dark:text-sky-400">&quot;{r.label}&quot;</span>
              {', '}
              <span className="text-violet-600 dark:text-violet-400">NAMEOF({r.field})</span>
              {', '}
              <span className="text-emerald-600 dark:text-emerald-400">{r.order}</span>
              {')'}
              {i < METRIC.length - 1 ? ',' : ''}
              {'\n'}
            </span>
          ))}
          {'}'}
        </pre>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="text-[10px] uppercase text-fd-muted-foreground">
              <th className="px-1.5 py-1 text-left font-normal text-sky-600 dark:text-sky-400">
                <span className="inline-flex items-center gap-1">
                  <Badge n="1" className="size-4 bg-sky-500 text-[9px]" />
                  Metric
                </span>
              </th>
              <th className="px-1.5 py-1 text-left font-normal text-violet-600 dark:text-violet-400">
                <span className="inline-flex items-center gap-1">
                  <Badge n="2" className="size-4 bg-violet-500 text-[9px]" />
                  Metric Fields <span className="normal-case">(hidden)</span>
                </span>
              </th>
              <th className="px-1.5 py-1 text-right font-normal text-emerald-600 dark:text-emerald-400">
                <span className="inline-flex items-center gap-1">
                  <Badge n="3" className="size-4 bg-emerald-500 text-[9px]" />
                  Order
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="font-mono text-[11px] sm:text-xs">
            {METRIC.map((r) => (
              <tr key={r.label} className="border-t border-fd-border">
                <td className="px-1.5 py-1 font-sans">{r.label}</td>
                <td className="px-1.5 py-1 break-all text-fd-muted-foreground">{r.field}</td>
                <td className="px-1.5 py-1 text-right">{r.order}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* One visual, two slicer states */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {STATES.map((st) => {
          const data = Object.entries(VALUES[st.metric][st.breakdown]);
          const max = Math.max(...data.map(([, v]) => v));
          return (
            <div key={st.metric} className="rounded-lg border border-fd-border bg-fd-background p-3 leading-snug">
              <div className="flex items-start gap-1.5">
                <Badge n="4" className="mt-3 bg-amber-500" />
                <div className="space-y-1.5">
                  <Slicer title="Metric" options={METRIC} selected={st.metric} />
                  <Slicer title="Breakdown By" options={BREAKDOWN} selected={st.breakdown} />
                </div>
              </div>
              <div className="mt-2 rounded-md bg-fd-foreground/5 p-2 font-mono text-[10px] leading-snug break-all">
                <span className="text-fd-muted-foreground">Y-axis → </span>
                {fieldOf(METRIC, st.metric)}
                <br />
                <span className="inline-flex items-center gap-1">
                  <Badge n="5" className="size-3.5 bg-fd-primary text-[8px]" />
                  <span className="text-fd-muted-foreground">X-axis →</span>
                </span>
                {' '}
                {fieldOf(BREAKDOWN, st.breakdown)}
              </div>
              <p className="mt-2 text-xs font-semibold">
                {st.metric} by {st.breakdown}
              </p>
              <div className="mt-1 space-y-1">
                {data.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[4rem_1fr] items-center gap-2 text-[11px]">
                    <span className="truncate">{k}</span>
                    <div className="flex items-center gap-1">
                      <div className={cn('h-3.5 rounded-sm', st.bar)} style={{ width: `${(v / max) * 80}%` }} />
                      <span className="font-mono text-fd-muted-foreground">${v}K</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[11px] text-fd-muted-foreground">
        Same chart, nothing rebuilt: only the two slicer selections differ.
      </p>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Display name</span> — the first value in each
            tuple, and the column the slicer shows. Renaming &quot;Total Sales&quot; to &quot;Revenue&quot; means editing
            this string in the table&apos;s DAX (or in the Fields dialog), not adding a column.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">NAMEOF()</span> — a reference to an
            existing measure or column, not a copy of its data. This hidden Fields column is what visuals actually bind
            to.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Order</span> — the sort order of the
            slicer options, and the order fields appear in when more than one is selected.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Selection</span> — filters the parameter
            table to one row, and the visual swaps in that row&apos;s field. Select several and the visual shows all of
            them (multiple series, or multiple columns in a table); select none and it shows every field, so set the
            slicer to single select for a clean switcher.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="5" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Second parameter</span> — Breakdown By lists columns instead of
            measures, so it swaps the axis. Two parameters on one chart give 3 × 3 = 9 combinations from one visual.
            Revenue and Profit add up to the same totals either way ($75K and $23K), because only the grouping changed.
          </p>
        </div>
      </div>
    </div>
  );
}
