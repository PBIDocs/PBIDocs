'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import { ProbabilityPlot, ReliabilityCurve } from '@/components/weibull-charts';
import {
  DEFAULT_NAMES,
  TUTORIAL_INTERVAL,
  TUTORIAL_UNITS,
  bLife,
  betaBand,
  fit as fitWeibull,
  fleetMtbf,
  generateDax,
  meanLife,
  parseUnits,
  reliability,
  type DaxNames,
} from '@/lib/weibull';

const inputClass =
  'w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

const h0 = (v: number) => Math.round(v).toLocaleString('en-US');
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export function WeibullAnalysis() {
  const [text, setText] = useState(TUTORIAL_UNITS);
  const [bText, setBText] = useState('10');
  const [intervalText, setIntervalText] = useState(String(TUTORIAL_INTERVAL));
  const [names, setNames] = useState<DaxNames>(DEFAULT_NAMES);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseUnits(text), [text]);
  const result = useMemo(() => fitWeibull(parsed.units), [parsed]);
  const bNum = Number(bText);
  const bOk = Number.isFinite(bNum) && bNum > 0 && bNum < 100;
  const bPercent = bOk ? bNum : 10;
  const intNum = Number(intervalText.replace(/,/g, ''));
  const intOk = Number.isFinite(intNum) && intNum > 0;
  const interval = intOk ? intNum : TUTORIAL_INTERVAL;
  const mtbf = fleetMtbf(parsed.units);
  const dax = generateDax(names, { bPercent, interval });

  const errors = [
    ...(bOk ? [] : ['The B-life percentage needs to be between 0 and 100. Using 10 until that’s fixed.']),
    ...(intOk ? [] : ['The replacement interval needs to be a positive number of hours.']),
    ...parsed.errors,
  ];

  const failuresOnly = useMemo(() => {
    if (!result || result.suspensions === 0) return null;
    return fitWeibull(parsed.units.filter((u) => u.status === 'F'));
  }, [parsed, result]);

  const band = result ? betaBand(result.beta) : null;
  const bl = result ? bLife(result.beta, result.eta, bPercent / 100) : 0;
  const rAt = result ? reliability(result.beta, result.eta, interval) : 0;
  const rExp = mtbf ? Math.exp(-interval / mtbf) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-xl border border-fd-border p-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Units: ID, hours, status
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            spellCheck={false}
            className={cn(inputClass, 'resize-y font-mono text-xs')}
          />
          <span className="text-xs font-normal text-fd-muted-foreground">
            One unit per line: an ID, its operating hours (or cycles, miles, starts), and F if it failed or S if it&apos;s
            still running (suspended). The ID is optional, and a line with no status counts as a failure. Commas or tabs.
          </span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
            B-life (% failed)
            <input type="text" inputMode="decimal" value={bText} onChange={(e) => setBText(e.target.value)} className={cn(inputClass, 'font-mono')} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
            Replacement interval or mission time (hours)
            <input
              type="text"
              inputMode="numeric"
              value={intervalText}
              onChange={(e) => setIntervalText(e.target.value)}
              className={cn(inputClass, 'font-mono')}
            />
          </label>
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

      {!result ? (
        <p className="rounded-lg border border-fd-border px-4 py-6 text-center text-sm text-fd-muted-foreground">
          A Weibull fit needs at least two failures at different hours.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Shape β', value: result.beta.toFixed(2) },
              { label: 'Scale η (hours)', value: h0(result.eta) },
              { label: `B${bPercent} life (hours)`, value: h0(bl) },
              { label: `Reliability at ${h0(interval)} h`, value: pct(rAt) },
            ].map((t) => (
              <div key={t.label} className="flex flex-col gap-1 rounded-lg border border-fd-border p-3">
                <span className="text-xs text-fd-muted-foreground">{t.label}</span>
                <span className="font-mono text-2xl font-bold">{t.value}</span>
              </div>
            ))}
          </div>
          <p className="-mt-4 text-sm text-fd-muted-foreground">
            {result.failures} failures and {result.suspensions} suspensions. Mean life {h0(meanLife(result.beta, result.eta))}{' '}
            hours. Fit R² {result.r2.toFixed(3)}
            {result.r2 < 0.9 && ': the points don’t follow one straight line well, so check for mixed failure modes'}.
          </p>

          {band && (
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-800 dark:text-sky-200">
              <strong>
                β = {result.beta.toFixed(2)}: {band.label}.
              </strong>{' '}
              {band.text}
            </div>
          )}

          {mtbf && rExp !== null && result.beta > 1.1 && rExp - rAt > 0.03 && (
            <div className="flex gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <p>
                The fleet MTBF (total hours ÷ failures) is <strong>{h0(mtbf)} hours</strong>. Treated as a constant failure
                rate, it predicts {pct(rExp)} of units survive to {h0(interval)} hours. The Weibull fit says{' '}
                <strong>{pct(rAt)}</strong>: {pct(1 - rAt)} fail before the interval. MTBF assumes failures are random,
                and these are wearing out.
              </p>
            </div>
          )}

          {failuresOnly && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
              Dropping the {result.suspensions} units still running would put η at <strong>{h0(failuresOnly.eta)} hours</strong>{' '}
              instead of {h0(result.eta)} ({pct(1 - failuresOnly.eta / result.eta)} lower) and B{bPercent} at{' '}
              {h0(bLife(failuresOnly.beta, failuresOnly.eta, bPercent / 100))} hours. Units that haven&apos;t failed yet
              are evidence that life is longer; leaving them out makes the fleet look worse than it is.
            </div>
          )}

          <div className="grid gap-4">
            <div className="rounded-xl border border-fd-border p-3 sm:p-5">
              <p className="mb-2 text-sm font-semibold">Weibull probability plot</p>
              <ProbabilityPlot fit={result} bPercent={bPercent} className="hidden sm:block" />
              <ProbabilityPlot fit={result} bPercent={bPercent} compact className="sm:hidden" />
              <p className="mt-2 text-xs text-fd-muted-foreground">
                Dots are failures at their median ranks; <span className="text-amber-600 dark:text-amber-400">△</span> marks
                units still running. A straight line means one Weibull describes the data; its slope is β. Dashed lines:{' '}
                <span className="text-red-600 dark:text-red-400">B{bPercent} life</span> and{' '}
                <span className="text-violet-600 dark:text-violet-400">η, where 63.2% have failed</span>.
              </p>
            </div>
            <div className="rounded-xl border border-fd-border p-3 sm:p-5">
              <p className="mb-2 text-sm font-semibold">Reliability: Weibull vs. MTBF</p>
              <ReliabilityCurve fit={result} mtbf={mtbf} interval={interval} className="hidden sm:block" />
              <ReliabilityCurve fit={result} mtbf={mtbf} interval={interval} compact className="sm:hidden" />
              <p className="mt-2 text-xs text-fd-muted-foreground">
                <span className="text-sky-600 dark:text-sky-400">Solid</span>: share still running by age, from the fit.{' '}
                Dashed: the same from the fleet MTBF as a constant failure rate. At {h0(interval)} hours: Weibull{' '}
                {pct(rAt)}
                {rExp !== null && <>, MTBF {pct(rExp)}</>}.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">How each failure is ranked</h2>
            <div className="overflow-x-auto rounded-lg border border-fd-border">
              <table className="w-full text-sm">
                <thead className="bg-fd-secondary/60 text-left text-xs">
                  <tr>
                    <th className="px-3 py-2 text-right font-semibold">Order</th>
                    <th className="px-3 py-2 font-semibold">Unit</th>
                    <th className="px-3 py-2 text-right font-semibold">Hours</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 text-right font-semibold">Reverse rank</th>
                    <th className="px-3 py-2 text-right font-semibold">Adjusted rank</th>
                    <th className="px-3 py-2 text-right font-semibold">Median rank</th>
                  </tr>
                </thead>
                <tbody>
                  {result.ranked.map((u) => (
                    <tr key={u.order} className={cn('border-t border-fd-border', u.status === 'S' && 'text-fd-muted-foreground')}>
                      <td className="px-3 py-1.5 text-right font-mono text-xs">{u.order}</td>
                      <td className="px-3 py-1.5 font-mono text-xs whitespace-nowrap">{u.id}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{h0(u.hours)}</td>
                      <td className="px-3 py-1.5">
                        {u.status === 'F' ? (
                          'Failed'
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">Running</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono">{u.reverseRank}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{u.adjustedRank?.toFixed(3) ?? ''}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{u.medianRank !== null ? pct(u.medianRank) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-fd-muted-foreground">
              A running unit gets no rank of its own, but it pushes every later failure&apos;s adjusted rank up by less
              than a full step (Johnson&apos;s method). The median rank is Bernard&apos;s approximation, (adjusted rank −
              0.3) ÷ (N + 0.4).
            </p>
          </div>
        </>
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-fd-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">The same fit in DAX</p>
            <p className="text-sm text-fd-muted-foreground">
              Calculated columns for the ranks and plot coordinates, then measures that fit β and η with LINESTX. The{' '}
              <Link href="/tutorials/build-a-weibull-reliability-dashboard" className="text-fd-primary hover:underline">
                Weibull tutorial
              </Link>{' '}
              covers the Power Query step that adds the Order column.
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
        <div className="grid gap-3 sm:grid-cols-4">
          {(
            [
              ['table', 'Table'],
              ['hours', 'Hours column'],
              ['status', 'Status column'],
              ['failed', 'Failed value'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
              {label}
              <input
                type="text"
                value={names[key]}
                onChange={(e) => setNames((n) => ({ ...n, [key]: e.target.value }))}
                className={cn(inputClass, 'font-mono')}
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
