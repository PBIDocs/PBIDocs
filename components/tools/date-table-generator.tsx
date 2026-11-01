'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import {
  MONTH_NAMES,
  buildColumns,
  daxTableRef,
  fiscalYearEndArg,
  formatIsoDate,
  generateDax,
  generateM,
  parseIsoDate,
  sortByPairs,
  toPreviewDay,
  type ColumnGroup,
  type DateTableOptions,
  type PreviewDay,
} from '@/lib/date-table';

type Output = 'dax' | 'm';
type PreviewMode = 'days' | 'months';

const MAX_DAYS = 200 * 366;

const GROUPS: { id: ColumnGroup; label: string; columns: string }[] = [
  { id: 'labels', label: 'Period labels', columns: 'Month Short, Month Year (with its sort key), Year Quarter' },
  {
    id: 'day',
    label: 'Day of week',
    columns: 'Day of Month, Day of Year, Day of Week Number, Day Name, Day Short, Is Weekend',
  },
  { id: 'week', label: 'Weeks', columns: 'Week Start, ISO Week, ISO Year' },
  { id: 'fiscal', label: 'Fiscal calendar', columns: 'Fiscal Year, Fiscal Year Label, Fiscal Month Number, Fiscal Quarter' },
  { id: 'relative', label: 'Relative to today', columns: 'Year Offset, Month Offset, Is Future' },
  { id: 'dateKey', label: 'Integer date key', columns: 'Date Key (20260101), for fact tables keyed by YYYYMMDD' },
];

const DEFAULT_OPTIONS: DateTableOptions = {
  tableName: 'Date',
  rangeMode: 'fixed',
  startDate: '2020-01-01',
  endDate: '2030-12-31',
  factTable: 'Sales',
  factColumn: 'Order Date',
  groups: { dateKey: false, labels: true, day: true, week: false, fiscal: false, relative: false },
  weekStart: 'monday',
  fiscalStartMonth: 7,
  fiscalNaming: 'end',
};

const inputClass =
  'w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

function formatCell(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return String(value);
}

export function DateTableGenerator() {
  const [opts, setOpts] = useState<DateTableOptions>(DEFAULT_OPTIONS);
  const [output, setOutput] = useState<Output>('dax');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('days');
  const [copied, setCopied] = useState(false);
  const [today, setToday] = useState<PreviewDay | null>(null);

  useEffect(() => {
    // The page is prerendered, so "today" has to come from the visitor's
    // clock after hydration rather than from the build machine's.
    const now = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(toPreviewDay(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))));
  }, []);

  function update<K extends keyof DateTableOptions>(key: K, value: DateTableOptions[K]) {
    setOpts((prev) => ({ ...prev, [key]: value }));
  }

  function toggleGroup(id: ColumnGroup) {
    setOpts((prev) => ({ ...prev, groups: { ...prev.groups, [id]: !prev.groups[id] } }));
  }

  const start = parseIsoDate(opts.startDate);
  const end = parseIsoDate(opts.endDate);
  const dayCount = start && end ? Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1 : 0;
  const rangeError =
    opts.rangeMode !== 'fixed'
      ? ''
      : !start || !end
        ? 'Enter both a start and an end date.'
        : dayCount < 1
          ? 'The end date has to be on or after the start date.'
          : dayCount > MAX_DAYS
            ? 'That range is over 200 years. Trim it to the years your data actually covers.'
            : '';

  const code = useMemo(
    () => (rangeError ? '' : output === 'dax' ? generateDax(opts) : generateM(opts)),
    [opts, output, rangeError],
  );
  const columns = useMemo(() => buildColumns(opts), [opts]);
  const sortPairs = useMemo(() => sortByPairs(opts), [opts]);

  const fiscalOn = opts.groups.fiscal;
  const fsm = opts.fiscalStartMonth;

  // In fact-table mode there's no fixed start date to preview from, so show
  // the start of the current (fiscal) year as a stand-in.
  const previewDays = useMemo(() => {
    if (rangeError) return [];
    const now = new Date();
    const year = now.getFullYear();
    const first =
      opts.rangeMode === 'fixed'
        ? parseIsoDate(opts.startDate)
        : opts.groups.fiscal && opts.fiscalStartMonth > 1
          ? new Date(Date.UTC(now.getMonth() + 1 >= opts.fiscalStartMonth ? year : year - 1, opts.fiscalStartMonth - 1, 1))
          : new Date(Date.UTC(year, 0, 1));
    const last = opts.rangeMode === 'fixed' ? parseIsoDate(opts.endDate) : null;
    if (!first) return [];
    const days: PreviewDay[] = [];
    for (let i = 0; i < (previewMode === 'days' ? 7 : 12); i++) {
      const date =
        previewMode === 'days'
          ? new Date(first.getTime() + i * 86_400_000)
          : new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + i, 1));
      if (date.getTime() < first.getTime()) continue;
      if (last && date.getTime() > last.getTime()) break;
      days.push(toPreviewDay(date));
    }
    return days;
  }, [opts, previewMode, rangeError]);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tableName = opts.tableName.trim() || 'Date';
  const fyExample = (naming: 'end' | 'start') => {
    if (fsm === 1) return 'FY2026 = Jan–Dec 2026';
    const startLabel = `${MONTH_NAMES[fsm - 1].slice(0, 3)} 2026`;
    const endLabel = `${MONTH_NAMES[fsm - 2].slice(0, 3)} 2027`;
    return `FY${naming === 'end' ? 2027 : 2026} = ${startLabel}–${endLabel}`;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 rounded-xl border border-fd-border p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Table name
            <input
              type="text"
              value={opts.tableName}
              onChange={(e) => update('tableName', e.target.value)}
              maxLength={60}
              className={inputClass}
            />
          </label>
          <div className="flex flex-col gap-1.5 text-sm font-medium">
            Date range
            <div className="inline-flex w-fit rounded-full border border-fd-border p-1 text-sm">
              {(['fixed', 'fact'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => update('rangeMode', mode)}
                  className={cn(
                    'rounded-full px-3 py-1 font-medium transition-colors',
                    opts.rangeMode === mode
                      ? 'bg-fd-primary text-fd-primary-foreground'
                      : 'text-fd-muted-foreground hover:text-fd-foreground',
                  )}
                >
                  {mode === 'fixed' ? 'Fixed dates' : 'From a fact table'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {opts.rangeMode === 'fixed' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Start date
              <input
                type="date"
                value={opts.startDate}
                onChange={(e) => update('startDate', e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              End date
              <input
                type="date"
                value={opts.endDate}
                onChange={(e) => update('endDate', e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Fact table
                <input
                  type="text"
                  value={opts.factTable}
                  onChange={(e) => update('factTable', e.target.value)}
                  maxLength={80}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Date column
                <input
                  type="text"
                  value={opts.factColumn}
                  onChange={(e) => update('factColumn', e.target.value)}
                  maxLength={80}
                  className={inputClass}
                />
              </label>
            </div>
            <p className="text-xs text-fd-muted-foreground">
              The range follows the earliest and latest dates in that column, widened to whole{' '}
              {fiscalOn && fsm > 1 ? 'fiscal' : 'calendar'} years, so it grows on every refresh.
            </p>
          </div>
        )}

        {rangeError && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500" role="alert">
            {rangeError}
          </p>
        )}

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">Columns</legend>
          <p className="text-xs text-fd-muted-foreground">
            Always included: Date, Year, Quarter, Month Number, Month Name.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {GROUPS.map((group) => (
              <label
                key={group.id}
                className={cn(
                  'flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                  opts.groups[group.id] ? 'border-fd-primary/50 bg-fd-primary/5' : 'border-fd-border hover:bg-fd-accent/50',
                )}
              >
                <input
                  type="checkbox"
                  checked={opts.groups[group.id]}
                  onChange={() => toggleGroup(group.id)}
                  className="mt-0.5 size-4 shrink-0 accent-fd-primary"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{group.label}</span>
                  <span className="text-xs text-fd-muted-foreground">{group.columns}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {(opts.groups.day || opts.groups.week || fiscalOn) && (
          <div className="grid gap-4 sm:grid-cols-3">
            {(opts.groups.day || opts.groups.week) && (
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Week starts on
                <select
                  value={opts.weekStart}
                  onChange={(e) => update('weekStart', e.target.value as DateTableOptions['weekStart'])}
                  className={inputClass}
                >
                  <option value="monday">Monday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </label>
            )}
            {fiscalOn && (
              <>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Fiscal year starts in
                  <select
                    value={fsm}
                    onChange={(e) => update('fiscalStartMonth', Number(e.target.value))}
                    className={inputClass}
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={name} value={i + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Fiscal year named by
                  <select
                    value={opts.fiscalNaming}
                    onChange={(e) => update('fiscalNaming', e.target.value as DateTableOptions['fiscalNaming'])}
                    className={inputClass}
                  >
                    <option value="end">Year it ends ({fyExample('end')})</option>
                    <option value="start">Year it starts ({fyExample('start')})</option>
                  </select>
                </label>
              </>
            )}
          </div>
        )}
      </div>

      {!rangeError && (
        <div className="flex flex-col gap-4 rounded-xl border border-fd-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex w-fit rounded-full border border-fd-border p-1 text-sm">
              {(['dax', 'm'] as const).map((o) => (
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
                  {o === 'dax' ? 'DAX' : 'Power Query M'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={copyCode}
              className="flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <p className="text-sm text-fd-muted-foreground">
            {output === 'dax' ? (
              <>
                In Power BI Desktop: <strong className="text-fd-foreground">Modeling → New table</strong>, then
                paste.
              </>
            ) : (
              <>
                In Power Query: <strong className="text-fd-foreground">New Source → Blank Query → Advanced Editor</strong>,
                paste, and rename the query to <code className="text-fd-foreground">{tableName}</code>.
              </>
            )}{' '}
            {opts.rangeMode === 'fixed' && `${dayCount.toLocaleString()} rows, `}
            {columns.length + 1} columns.
          </p>

          <pre className="max-h-[28rem] overflow-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
            <code>{highlightCode(code)}</code>
          </pre>
        </div>
      )}

      {!rangeError && previewDays.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="inline-flex w-fit rounded-full border border-fd-border p-1 text-xs">
              {(['days', 'months'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPreviewMode(m)}
                  className={cn(
                    'rounded-full px-3 py-1 font-medium transition-colors',
                    previewMode === m
                      ? 'bg-fd-primary text-fd-primary-foreground'
                      : 'text-fd-muted-foreground hover:text-fd-foreground',
                  )}
                >
                  {m === 'days' ? 'First 7 days' : '1st of each month'}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-fd-muted-foreground">
            {opts.rangeMode === 'fact'
              ? 'Sample rows from the current year, since the real range depends on your data. '
              : ''}
            Month and day names follow your model&apos;s locale; they&apos;re shown in English here.
          </p>
          <div className="overflow-x-auto rounded-lg border border-fd-border">
            <table className="w-full text-xs">
              <thead className="bg-fd-secondary/60 text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold whitespace-nowrap">Date</th>
                  {columns.map((col) => (
                    <th key={col.name} className="px-3 py-2 font-semibold whitespace-nowrap">
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewDays.map((day) => (
                  <tr key={day.date.getTime()} className="border-t border-fd-border">
                    <td className="px-3 py-1.5 font-mono whitespace-nowrap">{formatIsoDate(day.date)}</td>
                    {columns.map((col) => (
                      <td key={col.name} className="px-3 py-1.5 whitespace-nowrap text-fd-muted-foreground">
                        {today ? formatCell(col.preview(day, today)) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!rangeError && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">After you paste it</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-fd-muted-foreground">
            <li>
              Select the <code className="text-fd-foreground">{tableName}</code> table, then{' '}
              <strong className="text-fd-foreground">Table tools → Mark as date table</strong> and pick the{' '}
              <code className="text-fd-foreground">Date</code> column.
            </li>
            <li>
              Relate <code className="text-fd-foreground">{tableName}[{opts.groups.dateKey ? 'Date Key' : 'Date'}]</code>{' '}
              to your fact table&apos;s date column (one-to-many, single direction).
            </li>
            {sortPairs.length > 0 && (
              <li>
                Set <strong className="text-fd-foreground">Sort by column</strong> so these don&apos;t sort
                alphabetically:
                <ul className="mt-1.5 flex flex-col gap-1">
                  {sortPairs.map((pair) => (
                    <li key={pair.column}>
                      <code className="text-fd-foreground">{pair.column}</code> by{' '}
                      <code className="text-fd-foreground">{pair.sortBy}</code>
                    </li>
                  ))}
                </ul>
              </li>
            )}
            <li>
              Build the measures on top of it with the{' '}
              <Link href="/tools/time-intelligence-generator" className="text-fd-primary hover:underline">
                Time Intelligence Generator
              </Link>
              : YTD, prior year, growth, and rolling windows.
            </li>
            {fiscalOn && fsm > 1 && (
              <li>
                Fiscal year-to-date measures need the year-end date:{' '}
                <code className="text-fd-foreground">
                  TOTALYTD([Total Sales], {daxTableRef(tableName)}[Date], &quot;
                  {fiscalYearEndArg(fsm)}&quot;)
                </code>
                .
              </li>
            )}
            {opts.groups.relative && (
              <li>
                The relative columns are fixed at refresh time, not when someone opens the report, and the Power BI
                service evaluates &quot;today&quot; in UTC. Schedule a daily refresh to keep them current.
              </li>
            )}
          </ol>
        </div>
      )}
    </div>
  );
}
