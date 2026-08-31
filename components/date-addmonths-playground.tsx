'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(year: number, monthIndex: number): number {
  // Day 0 of the *next* month is the last day of this one -- a reliable
  // way to get a month's length without a lookup table or leap-year logic.
  return new Date(year, monthIndex + 1, 0).getDate();
}

function addMonths(year: number, month: number, day: number, delta: number) {
  const totalMonths = year * 12 + (month - 1) + delta;
  let newYear = Math.floor(totalMonths / 12);
  let newMonthIndex = totalMonths % 12;
  if (newMonthIndex < 0) {
    newMonthIndex += 12;
    newYear -= 1;
  }
  const maxDay = daysInMonth(newYear, newMonthIndex);
  const newDay = Math.min(day, maxDay);
  return { year: newYear, month: newMonthIndex + 1, day: newDay, clamped: newDay !== day };
}

export function DateAddMonthsPlayground() {
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('31');
  const [delta, setDelta] = useState('1');

  const yearNum = Number.parseInt(year, 10);
  const monthNum = Number.parseInt(month, 10);
  const dayNum = Number.parseInt(day, 10);
  const deltaNum = Number.parseInt(delta, 10);

  const inputsAreValid =
    !Number.isNaN(yearNum) &&
    !Number.isNaN(deltaNum) &&
    !Number.isNaN(monthNum) &&
    monthNum >= 1 &&
    monthNum <= 12 &&
    !Number.isNaN(dayNum) &&
    dayNum >= 1 &&
    dayNum <= 31;

  const result = inputsAreValid ? addMonths(yearNum, monthNum, dayNum, deltaNum) : null;

  const formula = `Date.AddMonths(#date(${year}, ${month}, ${day}), ${delta})`;
  const resultText = result
    ? `#date(${result.year}, ${result.month}, ${result.day})`
    : 'invalid input';

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="Start date">
          <input
            type="text"
            inputMode="numeric"
            aria-label="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-16 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
          <span className="text-fd-muted-foreground">-</span>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-14 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={Number.isNaN(monthNum) || monthNum < 1 || monthNum > 12}
          />
          <span className="text-fd-muted-foreground">-</span>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-14 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={Number.isNaN(dayNum) || dayNum < 1 || dayNum > 31}
          />
        </PlaygroundRow>
        <PlaygroundRow label="Months to add">
          <input
            type="text"
            inputMode="numeric"
            aria-label="Months to add"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="negative to subtract"
            className="w-24 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={Number.isNaN(deltaNum)}
          />
        </PlaygroundRow>
      </PlaygroundTable>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode(formula)}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-fd-muted-foreground">Result:</span>
        {result ? (
          <>
            <span className="font-mono font-semibold text-fd-primary">
              #date({result.year}, {result.month}, {result.day})
            </span>
            <span className="text-fd-muted-foreground">
              — {MONTH_NAMES[result.month - 1]} {result.day}, {result.year}
            </span>
          </>
        ) : (
          <span className="text-xs text-fd-muted-foreground">
            — enter a valid date (month 1-12, day 1-31) and a whole number of months
          </span>
        )}
        {result?.clamped && (
          <span className="text-xs text-fd-muted-foreground">
            — {MONTH_NAMES[result.month - 1]} {result.year} doesn&apos;t have a day {day}, so it
            clamped to the last valid day instead of erroring
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why this Power Query M code returns the result shown:\n\n```\n',
            formula,
            `\n\`\`\`\nResult: ${resultText}`,
          )}
        />
      </div>
    </div>
  );
}
