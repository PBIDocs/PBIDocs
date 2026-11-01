'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import { MONTH_NAMES, fiscalYearEndArg } from '@/lib/date-table';
import {
  CALCS,
  PREVIEW_START_YEAR,
  cleanMeasureName,
  generateCalcItems,
  generateMeasures,
  generateQueryView,
  measureName,
  measureText,
  sampleSeries,
  type CalcId,
  type CalcSpec,
  type TiOptions,
} from '@/lib/time-intelligence';

type Output = 'measures' | 'calcGroup';

const GROUP_ORDER: CalcSpec['group'][] = ['Period to date', 'Prior period', 'Growth', 'Rolling'];

const DEFAULT_OPTIONS: TiOptions = {
  baseMeasure: 'Total Sales',
  homeTable: 'Sales',
  dateTable: 'Date',
  dateColumn: 'Date',
  fiscalStartMonth: 1,
  selected: {
    mtd: false,
    qtd: false,
    ytd: true,
    py: true,
    pm: false,
    pytd: true,
    yoy: false,
    yoyPct: true,
    momPct: false,
    ytdYoyPct: false,
    r3: false,
    r12: true,
    rt: false,
  },
};

const inputClass =
  'w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex shrink-0 items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

function CodeCard({ title, note, code }: { title: string; note?: string; code: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-fd-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold">{title}</p>
          {note && <p className="text-xs text-fd-muted-foreground">{note}</p>}
        </div>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto rounded-md bg-fd-secondary px-3 py-2 text-sm">
        <code>{highlightCode(code)}</code>
      </pre>
    </div>
  );
}

function formatValue(value: number | null, percent: boolean): string {
  if (value === null) return '';
  return percent ? `${(value * 100).toFixed(1)}%` : value.toLocaleString('en-US');
}

export function TimeIntelligenceGenerator() {
  const [opts, setOpts] = useState<TiOptions>(DEFAULT_OPTIONS);
  const [output, setOutput] = useState<Output>('measures');

  function update<K extends keyof TiOptions>(key: K, value: TiOptions[K]) {
    setOpts((prev) => ({ ...prev, [key]: value }));
  }

  function toggle(id: CalcId) {
    setOpts((prev) => ({ ...prev, selected: { ...prev.selected, [id]: !prev.selected[id] } }));
  }

  const measures = useMemo(() => generateMeasures(opts), [opts]);
  const queryView = useMemo(() => generateQueryView(opts, measures), [opts, measures]);
  const calcItems = useMemo(() => generateCalcItems(opts), [opts]);
  const series = useMemo(() => sampleSeries(opts.fiscalStartMonth), [opts.fiscalStartMonth]);

  const selectedCalcs = CALCS.filter((c) => opts.selected[c.id]);
  const nameOf = (id: CalcId) => CALCS.find((c) => c.id === id)!.label;
  const base = cleanMeasureName(opts.baseMeasure);
  const fsm = opts.fiscalStartMonth;
  const qtdMisaligned = opts.selected.qtd && fsm > 1 && (fsm - 1) % 3 !== 0;
  const percentNames =
    output === 'measures'
      ? measures.filter((m) => m.percent).map((m) => m.name)
      : calcItems.filter((i) => i.percent).map((i) => i.name);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 rounded-xl border border-fd-border p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Base measure
            <input
              type="text"
              value={opts.baseMeasure}
              onChange={(e) => update('baseMeasure', e.target.value)}
              maxLength={80}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Fiscal year starts in
            <select
              value={fsm}
              onChange={(e) => update('fiscalStartMonth', Number(e.target.value))}
              className={inputClass}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>
                  {i === 0 ? 'January (calendar year)' : name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Date table
            <input
              type="text"
              value={opts.dateTable}
              onChange={(e) => update('dateTable', e.target.value)}
              maxLength={80}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Date column
            <input
              type="text"
              value={opts.dateColumn}
              onChange={(e) => update('dateColumn', e.target.value)}
              maxLength={80}
              className={inputClass}
            />
          </label>
        </div>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-sm font-medium">Calculations</legend>
          {GROUP_ORDER.map((group) => (
            <div key={group} className="flex flex-col gap-2">
              <p className="text-xs font-medium tracking-wide text-fd-muted-foreground uppercase">{group}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {CALCS.filter((c) => c.group === group).map((calc) => (
                  <label
                    key={calc.id}
                    className={cn(
                      'flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                      opts.selected[calc.id]
                        ? 'border-fd-primary/50 bg-fd-primary/5'
                        : 'border-fd-border hover:bg-fd-accent/50',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={opts.selected[calc.id]}
                      onChange={() => toggle(calc.id)}
                      className="mt-0.5 size-4 shrink-0 accent-fd-primary"
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{calc.label}</span>
                      <span className="text-xs text-fd-muted-foreground">{calc.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </fieldset>

        {qtdMisaligned && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
            Your fiscal year starts in {MONTH_NAMES[fsm - 1]}, which isn&apos;t a calendar quarter boundary.
            DATESQTD always uses calendar quarters, so quarter-to-date won&apos;t line up with your fiscal
            quarters. Use the Fiscal Quarter column from your date table instead.
          </p>
        )}
      </div>

      {selectedCalcs.length === 0 ? (
        <p className="text-sm text-fd-muted-foreground">Pick at least one calculation to generate code.</p>
      ) : (
        <>
          <div className="flex flex-col gap-4 rounded-xl border border-fd-border p-5">
            <div className="inline-flex w-fit rounded-full border border-fd-border p-1 text-sm">
              {(['measures', 'calcGroup'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutput(o)}
                  className={cn(
                    'rounded-full px-4 py-1.5 font-medium transition-colors',
                    output === o
                      ? 'bg-fd-primary text-fd-primary-foreground'
                      : 'text-fd-muted-foreground hover:text-fd-foreground',
                  )}
                >
                  {o === 'measures' ? 'Measures' : 'Calculation group'}
                </button>
              ))}
            </div>

            {output === 'measures' ? (
              <>
                <p className="text-sm text-fd-muted-foreground">
                  One measure each, for <strong className="text-fd-foreground">Home → New measure</strong>. Or
                  add them all at once with the DAX query view script below.
                </p>
                <div className="flex flex-col gap-3">
                  {measures.map((m) => (
                    <CodeCard
                      key={m.id}
                      title={m.name}
                      note={
                        m.requiredBy.length
                          ? `Added because ${m.requiredBy.map(nameOf).join(' and ')} uses it.`
                          : undefined
                      }
                      code={measureText(m)}
                    />
                  ))}
                </div>

                <div className="mt-2 flex flex-col gap-3 border-t border-fd-border pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold">All at once: DAX query view</p>
                      <p className="text-sm text-fd-muted-foreground">
                        Open <strong className="text-fd-foreground">DAX query view</strong>, paste, and run it to
                        check the numbers. Then click the <strong className="text-fd-foreground">Update model</strong>{' '}
                        link above the measures to add them to the{' '}
                        <code className="text-fd-foreground">{opts.homeTable.trim() || 'Sales'}</code> table.
                      </p>
                    </div>
                    <CopyButton text={queryView} />
                  </div>
                  <label className="flex max-w-xs flex-col gap-1.5 text-sm font-medium">
                    Table to store the measures in
                    <input
                      type="text"
                      value={opts.homeTable}
                      onChange={(e) => update('homeTable', e.target.value)}
                      maxLength={80}
                      className={inputClass}
                    />
                  </label>
                  <pre className="max-h-[28rem] overflow-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
                    <code>{highlightCode(queryView)}</code>
                  </pre>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-fd-muted-foreground">
                  One set of items that works on every measure. In{' '}
                  <strong className="text-fd-foreground">Model view → Calculation group</strong>, name the group
                  (for example <em>Time Intelligence</em>), rename its column to <em>Period</em>, and add each item
                  below. Put <em>Period</em> on a visual&apos;s columns to apply them to any measure.
                </p>
                <div className="flex flex-col gap-3">
                  {calcItems.map((item) => (
                    <CodeCard
                      key={item.name}
                      title={item.name}
                      note={item.percent ? 'Set its dynamic format string to "0.0%".' : undefined}
                      code={`${item.name} =\n${item.expression}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Preview</h2>
            <p className="text-xs text-fd-muted-foreground">
              What these return by month for a made-up {base}, with {PREVIEW_START_YEAR}–{PREVIEW_START_YEAR + 1}{' '}
              behind it for the prior-year and rolling windows.
              {fsm > 1 && ` The line marks where your fiscal year starts and YTD resets.`} At month level,
              month-to-date equals the month itself; it differs only on daily rows.
            </p>
            <div className="overflow-x-auto rounded-lg border border-fd-border">
              <table className="w-full text-xs">
                <thead className="bg-fd-secondary/60 text-left">
                  <tr>
                    <th className="px-3 py-2 font-semibold whitespace-nowrap">Month</th>
                    <th className="px-3 py-2 text-right font-semibold whitespace-nowrap">{base}</th>
                    {selectedCalcs.map((c) => (
                      <th key={c.id} className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                        {output === 'measures' ? measureName(opts, c.id) : c.suffix}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 12 }, (_, k) => 24 + k).map((i) => (
                    <tr
                      key={i}
                      className={cn(
                        'border-t',
                        fsm > 1 && series.months[i] === fsm ? 'border-t-2 border-fd-primary' : 'border-fd-border',
                      )}
                    >
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {MONTH_NAMES[series.months[i] - 1].slice(0, 3)} {PREVIEW_START_YEAR + 2}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap">
                        {formatValue(series.values[i], false)}
                      </td>
                      {selectedCalcs.map((c) => (
                        <td
                          key={c.id}
                          className="px-3 py-1.5 text-right font-mono whitespace-nowrap text-fd-muted-foreground"
                        >
                          {formatValue(c.preview(series, i), Boolean(c.percent))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Before these will work</h2>
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-fd-muted-foreground">
              <li>
                <code className="text-fd-foreground">{opts.dateTable.trim() || 'Date'}</code> has to be marked as a
                date table, with one row for every day and no gaps. If you don&apos;t have one yet, the{' '}
                <Link href="/tools/date-table-generator" className="text-fd-primary hover:underline">
                  Date Table Generator
                </Link>{' '}
                builds it.
              </li>
              <li>
                Visuals must slice by columns from that date table, not by a date column on the fact table, or
                the time shifts have nothing to move.
              </li>
              {percentNames.length > 0 && (
                <li>
                  Format {percentNames.map((n, i) => (
                    <span key={n}>
                      {i > 0 && (i === percentNames.length - 1 ? ' and ' : ', ')}
                      <code className="text-fd-foreground">{n}</code>
                    </span>
                  ))}{' '}
                  as a percentage.
                </li>
              )}
              {fsm > 1 && (
                <li>
                  The fiscal year-end <code className="text-fd-foreground">&quot;{fiscalYearEndArg(fsm)}&quot;</code>{' '}
                  is read in your model&apos;s locale. If your model uses day-first dates and it errors, write it
                  as <code className="text-fd-foreground">&quot;{fiscalYearEndArg(fsm).split('/').reverse().join('/')}&quot;</code>.
                </li>
              )}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
