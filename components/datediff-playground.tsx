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
  month: number;
  day: number;
}

function isValidDate({ year, month, day }: DateParts): boolean {
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return false;
  if (month < 1 || month > 12) return false;
  const maxDay = new Date(year, month, 0).getDate();
  return day >= 1 && day <= maxDay;
}

// DATEDIFF counts calendar-unit *boundaries crossed* between two dates, not
// elapsed full periods -- e.g. MONTH counts how many times the
// (year, month) pair changed, regardless of the day-of-month on either end.
function dayDiff(a: DateParts, b: DateParts): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const aUtc = Date.UTC(a.year, a.month - 1, a.day);
  const bUtc = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((bUtc - aUtc) / msPerDay);
}

function monthDiff(a: DateParts, b: DateParts): number {
  return b.year * 12 + b.month - (a.year * 12 + a.month);
}

function quarterOf(month: number): number {
  return Math.floor((month - 1) / 3);
}

function quarterDiff(a: DateParts, b: DateParts): number {
  return (b.year * 4 + quarterOf(b.month)) - (a.year * 4 + quarterOf(a.month));
}

function yearDiff(a: DateParts, b: DateParts): number {
  return b.year - a.year;
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

export function DateDiffPlayground() {
  const [start, setStart] = useState({ year: '2026', month: '1', day: '31' });
  const [end, setEnd] = useState({ year: '2026', month: '2', day: '1' });

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

  const valid = isValidDate(startParts) && isValidDate(endParts);

  const results = valid
    ? [
        { unit: 'DAY', value: dayDiff(startParts, endParts) },
        { unit: 'MONTH', value: monthDiff(startParts, endParts) },
        { unit: 'QUARTER', value: quarterDiff(startParts, endParts) },
        { unit: 'YEAR', value: yearDiff(startParts, endParts) },
      ]
    : [];

  const startLiteral = `DATE(${start.year}, ${start.month}, ${start.day})`;
  const endLiteral = `DATE(${end.year}, ${end.month}, ${end.day})`;

  const dayCount = valid ? dayDiff(startParts, endParts) : null;
  const monthCount = valid ? monthDiff(startParts, endParts) : null;
  const surprising = valid && dayCount !== null && monthCount !== null && monthCount > 0 && dayCount <= 7;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <DateFields
          label="Start date"
          parts={start}
          onChange={(field, value) => setStart((s) => ({ ...s, [field]: value }))}
        />
        <DateFields label="End date" parts={end} onChange={(field, value) => setEnd((s) => ({ ...s, [field]: value }))} />
      </PlaygroundTable>

      {!valid ? (
        <p className="mt-4 text-xs text-fd-muted-foreground">Enter two valid calendar dates.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {results.map(({ unit, value }) => (
            <div
              key={unit}
              className={cn(
                'rounded-lg border p-3 text-center',
                unit === 'MONTH' && surprising
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : 'border-fd-border bg-fd-background',
              )}
            >
              <div className="font-mono text-sm">{highlightCode(`DATEDIFF(..., ${unit})`)}</div>
              <p
                className={cn(
                  'mt-1 font-mono text-lg font-semibold',
                  unit === 'MONTH' && surprising ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
                )}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {surprising && (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — only {dayCount} day{dayCount === 1 ? '' : 's'} apart, but DATEDIFF(..., MONTH) already returns{' '}
          {monthCount}: it counts calendar-month boundaries crossed, not full 30-day periods.
        </p>
      )}

      <div className="mt-3 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-xs text-fd-muted-foreground">
        {highlightCode(`DATEDIFF(${startLiteral}, ${endLiteral}, MONTH)`)}
      </div>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why DATEDIFF returns these results for these two dates, especially the MONTH unit:\n\n```\n',
            `Start: ${startLiteral}\nEnd: ${endLiteral}\n${results.map((r) => `DATEDIFF(..., ${r.unit}) = ${r.value}`).join('\n')}`,
            '\n```',
          )}
        />
      </div>
    </div>
  );
}
