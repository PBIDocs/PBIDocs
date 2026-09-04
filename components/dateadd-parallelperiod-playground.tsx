'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

interface DateParts {
  year: number;
  month: number; // 1-12
  day: number;
}

const UNITS = ['MONTH', 'QUARTER', 'YEAR'] as const;
type Unit = (typeof UNITS)[number];

const MONTHS_PER_UNIT: Record<Unit, number> = { MONTH: 1, QUARTER: 3, YEAR: 12 };

function isValidDate({ year, month, day }: DateParts): boolean {
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return false;
  if (month < 1 || month > 12) return false;
  const maxDay = new Date(year, month, 0).getDate();
  return day >= 1 && day <= maxDay;
}

function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

// Shifts a date by wholeMonths, clamping the day to the target month's length
// -- the same EDATE/Date.AddMonths behavior DATEADD relies on internally.
function shiftByMonths(d: DateParts, wholeMonths: number): DateParts {
  const totalMonths = d.year * 12 + (d.month - 1) + wholeMonths;
  let newYear = Math.floor(totalMonths / 12);
  let newMonthIndex = totalMonths % 12;
  if (newMonthIndex < 0) {
    newMonthIndex += 12;
    newYear -= 1;
  }
  const maxDay = daysInMonth(newYear, newMonthIndex);
  return { year: newYear, month: newMonthIndex + 1, day: Math.min(d.day, maxDay) };
}

function quarterStartMonthIndex0(monthIndex0: number): number {
  return Math.floor(monthIndex0 / 3) * 3;
}

function firstDayOfPeriod(d: DateParts, unit: Unit): DateParts {
  if (unit === 'YEAR') return { year: d.year, month: 1, day: 1 };
  if (unit === 'QUARTER') return { year: d.year, month: quarterStartMonthIndex0(d.month - 1) + 1, day: 1 };
  return { year: d.year, month: d.month, day: 1 };
}

function lastDayOfPeriod(d: DateParts, unit: Unit): DateParts {
  if (unit === 'YEAR') return { year: d.year, month: 12, day: 31 };
  if (unit === 'QUARTER') {
    const startIdx0 = quarterStartMonthIndex0(d.month - 1);
    const endIdx0 = startIdx0 + 2;
    return { year: d.year, month: endIdx0 + 1, day: daysInMonth(d.year, endIdx0) };
  }
  return { year: d.year, month: d.month, day: daysInMonth(d.year, d.month - 1) };
}

function fmt(d: DateParts): string {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

function DateFields({
  label,
  parts,
  onChange,
}: {
  label: string;
  parts: { year: string; month: string; day: string };
  onChange: (field: 'year' | 'month' | 'day', value: string) => void;
}) {
  return (
    <PlaygroundRow label={label}>
      <input
        type="text"
        inputMode="numeric"
        aria-label={`${label} year`}
        value={parts.year}
        onChange={(e) => onChange('year', e.target.value)}
        className="w-16 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
      />
      <span className="text-fd-muted-foreground">-</span>
      <input
        type="text"
        inputMode="numeric"
        aria-label={`${label} month`}
        value={parts.month}
        onChange={(e) => onChange('month', e.target.value)}
        className="w-14 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
      />
      <span className="text-fd-muted-foreground">-</span>
      <input
        type="text"
        inputMode="numeric"
        aria-label={`${label} day`}
        value={parts.day}
        onChange={(e) => onChange('day', e.target.value)}
        className="w-14 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
      />
    </PlaygroundRow>
  );
}

export function DateAddParallelPeriodPlayground() {
  const [start, setStart] = useState({ year: '2026', month: '1', day: '1' });
  const [end, setEnd] = useState({ year: '2026', month: '1', day: '15' });
  const [intervals, setIntervals] = useState('-1');
  const [unit, setUnit] = useState<Unit>('MONTH');

  const startParts: DateParts = {
    year: Number.parseInt(start.year, 10),
    month: Number.parseInt(start.month, 10),
    day: Number.parseInt(start.day, 10),
  };
  const endParts: DateParts = {
    year: Number.parseInt(end.year, 10),
    month: Number.parseInt(end.month, 10),
    day: Number.parseInt(end.day, 10),
  };
  const intervalsNum = Number.parseInt(intervals, 10);

  const valid = isValidDate(startParts) && isValidDate(endParts) && !Number.isNaN(intervalsNum);

  const monthsShift = valid ? intervalsNum * MONTHS_PER_UNIT[unit] : 0;
  const dateAddStart = valid ? shiftByMonths(startParts, monthsShift) : null;
  const dateAddEnd = valid ? shiftByMonths(endParts, monthsShift) : null;

  const parallelStart = dateAddStart ? firstDayOfPeriod(dateAddStart, unit) : null;
  const parallelEnd = dateAddEnd ? lastDayOfPeriod(dateAddEnd, unit) : null;

  const differs =
    valid &&
    dateAddStart &&
    dateAddEnd &&
    parallelStart &&
    parallelEnd &&
    (fmt(dateAddStart) !== fmt(parallelStart) || fmt(dateAddEnd) !== fmt(parallelEnd));

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — the current filter context is this date range
      </p>

      <PlaygroundTable>
        <DateFields label="Range start" parts={start} onChange={(f, v) => setStart((s) => ({ ...s, [f]: v }))} />
        <DateFields label="Range end" parts={end} onChange={(f, v) => setEnd((s) => ({ ...s, [f]: v }))} />
        <PlaygroundRow label="Shift by">
          <input
            type="text"
            inputMode="numeric"
            aria-label="Number of intervals"
            value={intervals}
            onChange={(e) => setIntervals(e.target.value)}
            className="w-16 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
          <select
            aria-label="Interval unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </PlaygroundRow>
      </PlaygroundTable>

      {!valid ? (
        <p className="mt-4 text-xs text-fd-muted-foreground">Enter two valid dates and a whole number of intervals.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-fd-border bg-fd-background p-3">
            <div className="font-mono text-sm">{highlightCode(`DATEADD(Dates[Date], ${intervals}, ${unit})`)}</div>
            <p className="mt-2 font-mono text-sm font-semibold text-fd-primary">
              {fmt(dateAddStart!)} … {fmt(dateAddEnd!)}
            </p>
            <p className="mt-1 text-xs text-fd-muted-foreground">same shape, just shifted</p>
          </div>
          <div
            className={cn(
              'rounded-lg border p-3',
              differs ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
            )}
          >
            <div className="font-mono text-sm">{highlightCode(`PARALLELPERIOD(Dates[Date], ${intervals}, ${unit})`)}</div>
            <p
              className={cn(
                'mt-1 font-mono text-sm font-semibold',
                differs ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
              )}
            >
              {fmt(parallelStart!)} … {fmt(parallelEnd!)}
            </p>
            <p className="mt-1 text-xs text-fd-muted-foreground">always the full period(s)</p>
          </div>
        </div>
      )}

      {differs && (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — the original range wasn&apos;t a full {unit.toLowerCase()}, so PARALLELPERIOD snapped its result out to
          the entire {unit.toLowerCase()}(s) instead of preserving the same shape DATEADD kept.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why DATEADD and PARALLELPERIOD return different date ranges for the same shift:\n\n```\n',
            `Current range: ${fmt(startParts)} to ${fmt(endParts)}\nDATEADD(..., ${intervals}, ${unit}) -> ${dateAddStart ? fmt(dateAddStart) : ''} to ${dateAddEnd ? fmt(dateAddEnd) : ''}`,
            `\n\`\`\`\nPARALLELPERIOD(..., ${intervals}, ${unit}) -> ${parallelStart ? fmt(parallelStart) : ''} to ${parallelEnd ? fmt(parallelEnd) : ''}`,
          )}
        />
      </div>
    </div>
  );
}
