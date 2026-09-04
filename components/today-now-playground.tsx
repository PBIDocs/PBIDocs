'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ORDER_DATE = '2026-08-01';
const REFRESH_DATE = '2026-09-01';

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / MS_PER_DAY);
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function TodayNowPlayground() {
  const [daysSinceRefresh, setDaysSinceRefresh] = useState(5);

  const liveToday = addDays(REFRESH_DATE, daysSinceRefresh);

  const calcColumnResult = daysBetween(ORDER_DATE, REFRESH_DATE); // frozen at refresh time, forever
  const measureResult = daysBetween(ORDER_DATE, liveToday); // re-evaluated against the "live" TODAY()

  const stale = daysSinceRefresh > 0;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="OrderDate (fixed)">
          <span className="font-mono text-sm">{ORDER_DATE}</span>
        </PlaygroundRow>
        <PlaygroundRow label="Last data refresh">
          <span className="font-mono text-sm">{REFRESH_DATE}</span>
        </PlaygroundRow>
        <PlaygroundRow label="Days since that refresh, no new refresh yet">
          <input
            type="range"
            min={0}
            max={30}
            value={daysSinceRefresh}
            onChange={(e) => setDaysSinceRefresh(Number(e.target.value))}
            className="w-40 accent-fd-primary"
            aria-label="Days since refresh"
          />
          <span className="ml-2 font-mono text-sm">
            {daysSinceRefresh} day{daysSinceRefresh === 1 ? '' : 's'} — TODAY() is really {liveToday}
          </span>
        </PlaygroundRow>
      </PlaygroundTable>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="mb-1 text-xs font-semibold text-fd-muted-foreground">Calculated column</p>
          <div className="font-mono text-sm">{highlightCode('DaysSinceOrder = TODAY() - [OrderDate]')}</div>
          <p className="mt-2 font-mono text-lg font-semibold text-fd-primary">{calcColumnResult}</p>
          <p className="mt-1 text-xs text-fd-muted-foreground">
            baked in at the last refresh ({REFRESH_DATE}) — stays exactly this value no matter how many days pass,
            until the next refresh
          </p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            stale ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <p className="mb-1 text-xs font-semibold text-fd-muted-foreground">Measure</p>
          <div className="font-mono text-sm">{highlightCode('[Days Since Order] := TODAY() - MIN(Sales[OrderDate])')}</div>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              stale ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {measureResult}
          </p>
          <p className="mt-1 text-xs text-fd-muted-foreground">
            re-evaluated every time the report is viewed, reflecting today&apos;s actual date even with no new
            refresh
          </p>
        </div>
      </div>

      {stale && (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — {daysSinceRefresh} day{daysSinceRefresh === 1 ? '' : 's'} have passed since the last refresh with no new
          refresh run, and the calculated column still says {calcColumnResult} while the measure correctly says{' '}
          {measureResult}.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why a calculated column using TODAY() and a measure using TODAY() can show different values for the same report:\n\n```\n',
            `OrderDate: ${ORDER_DATE}\nLast refresh: ${REFRESH_DATE}\nDays since refresh (no new refresh): ${daysSinceRefresh}\nCalculated column result: ${calcColumnResult}`,
            `\n\`\`\`\nMeasure result: ${measureResult}`,
          )}
        />
      </div>
    </div>
  );
}
