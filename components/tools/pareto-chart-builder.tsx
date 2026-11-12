'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRightLeft, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import { ParetoChart } from '@/components/pareto-chart';
import {
  DEFAULT_NAMES,
  DEFAULT_SETTINGS,
  TUTORIAL_ITEMS,
  compute,
  generateDax,
  parseItems,
  settingsError,
  type DaxNames,
  type Metric,
} from '@/lib/pareto';

const inputClass =
  'w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

function formatter(metric: Metric) {
  return (v: number) =>
    metric === 'cost'
      ? `$${v.toLocaleString('en-US', { maximumFractionDigits: v >= 100 ? 0 : 2 })}`
      : v.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function ParetoChartBuilder() {
  const [text, setText] = useState(TUTORIAL_ITEMS);
  const [metricChoice, setMetric] = useState<Metric>(DEFAULT_SETTINGS.metric);
  const [thresholdText, setThresholdText] = useState(String(DEFAULT_SETTINGS.threshold));
  const [otherLast, setOtherLast] = useState(DEFAULT_SETTINGS.otherLast);
  const [names, setNames] = useState<DaxNames>(DEFAULT_NAMES);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseItems(text), [text]);
  const metric: Metric = parsed.hasCost ? metricChoice : 'count';
  const thresholdError = settingsError(Number(thresholdText));
  const threshold = thresholdError ? DEFAULT_SETTINGS.threshold : Number(thresholdText);
  const settings = { metric, threshold, otherLast };
  const result = compute(parsed.items, settings);
  const fmt = formatter(metric);
  const dax = generateDax(settings, names);
  const noun = metric === 'cost' ? 'of the cost' : 'of the total';

  // How the order changes between count and cost, when there's a cost column.
  const shift = (() => {
    if (!parsed.hasCost) return null;
    const byCount = compute(parsed.items, { ...settings, metric: 'count' });
    const byCost = compute(parsed.items, { ...settings, metric: 'cost' });
    if (byCount.rows.length < 2 || byCost.rows.length < 2) return null;
    const rankIn = (rows: typeof byCount.rows, cause: string) => rows.find((r) => r.cause === cause);
    let mover: { cause: string; countRank: number; costRank: number; countShare: number; costShare: number } | null = null;
    for (const c of byCost.rows) {
      const k = rankIn(byCount.rows, c.cause);
      if (!k || c.isOther) continue;
      const jump = k.rank - c.rank;
      if (jump >= 2 && (!mover || jump > mover.countRank - mover.costRank)) {
        mover = { cause: c.cause, countRank: k.rank, costRank: c.rank, countShare: k.share, costShare: c.share };
      }
    }
    const sameTop = byCount.rows[0].cause === byCost.rows[0].cause;
    if (!mover && sameTop) return null;
    return { mover, countTop: byCount.rows[0], costTop: byCost.rows[0], sameTop };
  })();

  const ties = result.rows.filter((r) => r.tied);
  const errors = [...(thresholdError ? [`${thresholdError} Using 80% until that’s fixed.`] : []), ...parsed.errors];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-xl border border-fd-border p-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Causes or defects
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            spellCheck={false}
            className={cn(inputClass, 'resize-y font-mono text-xs')}
          />
          <span className="text-xs font-normal text-fd-muted-foreground">
            One cause per line with its count, and optionally its cost: <code>Solder bridge, 68, 272</code>. Or paste a
            raw log with one cause per line and each line counts once. Commas or tabs, so a copy from Excel works;
            repeated causes are added together.
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
            <span className="flex h-5 items-center">Rank by</span>
            <div className="flex rounded-lg border border-fd-border p-0.5">
              {(['count', 'cost'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={m === 'cost' && !parsed.hasCost}
                  onClick={() => setMetric(m)}
                  className={cn(
                    'flex-1 rounded-md px-2 py-1.5 text-sm capitalize transition-colors disabled:opacity-40',
                    metric === m ? 'bg-fd-primary text-fd-primary-foreground' : 'hover:bg-fd-accent',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            {!parsed.hasCost && <span className="font-normal">Add a cost to every line to rank by cost.</span>}
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
            <span className="flex h-5 items-center">Vital few threshold (%)</span>
            <input
              type="text"
              inputMode="decimal"
              value={thresholdText}
              onChange={(e) => setThresholdText(e.target.value)}
              className={cn(inputClass, 'font-mono')}
            />
          </label>
          <div className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
            <span className="flex h-5 items-center">&ldquo;Other&rdquo;</span>
            <label className="flex h-[38px] items-center gap-2 text-sm font-normal text-fd-foreground">
              <input
                type="checkbox"
                checked={otherLast}
                onChange={(e) => setOtherLast(e.target.checked)}
                className="size-4 accent-fd-primary"
              />
              Always rank Other last
            </label>
          </div>
        </div>

        {errors.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {errors.slice(0, 5).map((e) => (
              <li key={e}>{e}</li>
            ))}
            {errors.length > 5 && <li>…and {errors.length - 5} more.</li>}
          </ul>
        )}
      </div>

      {result.rows.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: metric === 'cost' ? 'Total cost' : 'Total', value: fmt(result.total) },
              { label: 'Causes', value: String(result.rows.length) },
              { label: 'Vital few', value: `${result.vitalCount} of ${result.rows.length}` },
              { label: `Share ${metric === 'cost' ? 'of cost' : 'covered'}`, value: pct(result.vitalShare) },
            ].map((t) => (
              <div key={t.label} className="flex flex-col gap-1 rounded-lg border border-fd-border p-3">
                <span className="text-xs text-fd-muted-foreground">{t.label}</span>
                <span className="font-mono text-2xl font-bold">{t.value}</span>
              </div>
            ))}
          </div>

          <p className="-mt-4 text-sm text-fd-muted-foreground">
            {result.vitalCount === 1 ? 'The top cause accounts' : `The top ${result.vitalCount} causes account`} for{' '}
            {pct(result.vitalShare)} {noun}, the first point where the cumulative line reaches {threshold}%.
          </p>

          {shift && (
            <div className="flex gap-3 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-800 dark:text-violet-200">
              <ArrowRightLeft className="mt-0.5 size-4 shrink-0" />
              <p>
                {!shift.sameTop && (
                  <>
                    By count, <strong>{shift.countTop.cause}</strong> leads; by cost,{' '}
                    <strong>{shift.costTop.cause}</strong> does.{' '}
                  </>
                )}
                {shift.mover && (
                  <>
                    <strong>{shift.mover.cause}</strong> ranks #{shift.mover.countRank} by count with{' '}
                    {pct(shift.mover.countShare)} of the defects, but #{shift.mover.costRank} by cost with{' '}
                    {pct(shift.mover.costShare)} of the cost.{' '}
                  </>
                )}
                Switch <strong>Rank by</strong> to see both. A count-only Pareto would point the team at the wrong
                problem.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-fd-border p-3 sm:p-5">
            <ParetoChart rows={result.rows} threshold={threshold} format={fmt} className="hidden sm:block" />
            <ParetoChart rows={result.rows} threshold={threshold} format={fmt} compact className="sm:hidden" />
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fd-muted-foreground">
              <span>
                <span className="mr-1 inline-block size-2.5 rounded-sm bg-sky-600/80" />
                Vital few
              </span>
              <span>
                <span className="mr-1 inline-block size-2.5 rounded-sm bg-slate-400/50" />
                The rest
              </span>
              <span>
                <span className="mr-1 inline-block h-0.5 w-4 bg-amber-500 align-middle" />
                Cumulative %
              </span>
              <span>
                <span className="mr-1 inline-block w-4 border-t border-dashed border-red-500 align-middle" />
                {threshold}% threshold
              </span>
              <span className="sm:hidden">Bars are numbered by rank; names are in the table.</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="overflow-x-auto rounded-lg border border-fd-border">
              <table className="w-full text-sm">
                <thead className="bg-fd-secondary/60 text-left text-xs">
                  <tr>
                    <th className="px-3 py-2 text-right font-semibold">#</th>
                    <th className="px-3 py-2 font-semibold">Cause</th>
                    <th className="px-3 py-2 text-right font-semibold">{metric === 'cost' ? 'Cost' : 'Count'}</th>
                    <th className="px-3 py-2 text-right font-semibold">Share</th>
                    <th className="px-3 py-2 text-right font-semibold">Cumulative</th>
                    <th className="px-3 py-2 font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r) => (
                    <tr key={r.cause} className={cn('border-t border-fd-border', r.vital && 'bg-sky-500/5')}>
                      <td className="px-3 py-1.5 text-right font-mono text-xs text-fd-muted-foreground">{r.rank}</td>
                      <td className="px-3 py-1.5">
                        {r.cause}
                        {r.tied && <span className="ml-1.5 text-xs text-fd-muted-foreground">tie</span>}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono">{fmt(r.value)}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{pct(r.share)}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{pct(r.cumShare)}</td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {r.vital && (
                          <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
                            Vital few
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {ties.length > 0 && (
              <p className="text-xs text-fd-muted-foreground">
                Ties ({ties.map((r) => r.cause).join(', ')}) are ordered A to Z, so the cumulative line still steps up
                one bar at a time. The DAX below breaks ties the same way.
              </p>
            )}
          </div>
        </>
      )}

      {result.rows.length === 0 && (
        <p className="rounded-lg border border-fd-border px-4 py-6 text-center text-sm text-fd-muted-foreground">
          Add a cause above to see the Pareto chart.
        </p>
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-fd-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">The same Pareto as DAX measures</p>
            <p className="text-sm text-fd-muted-foreground">
              Rank, cumulative, cumulative %, the vital-few flag, and a bar color, for a line and clustered column chart
              with your table&apos;s names. The{' '}
              <Link href="/tutorials/build-a-pareto-chart-dashboard" className="text-fd-primary hover:underline">
                Pareto tutorial
              </Link>{' '}
              walks through each one.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(dax);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ['table', 'Table'],
              ['column', 'Cause column'],
              ['costColumn', 'Cost column'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
              {label}
              <input
                type="text"
                value={names[key]}
                disabled={key === 'costColumn' && metric !== 'cost'}
                onChange={(e) => setNames((n) => ({ ...n, [key]: e.target.value }))}
                className={cn(inputClass, 'font-mono disabled:opacity-50')}
              />
            </label>
          ))}
        </div>
        <pre className="max-h-[32rem] overflow-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
          <code>{highlightCode(dax)}</code>
        </pre>
      </div>
    </div>
  );
}
