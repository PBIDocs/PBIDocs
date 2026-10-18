'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const YEARS = ['FY2019', 'FY2020', 'FY2021'] as const;
type Year = (typeof YEARS)[number];

const ROWS_PER_YEAR: Record<Year, number> = {
  FY2019: 3,
  FY2020: 4,
  FY2021: 2,
};

const TOTAL_ROWS = Object.values(ROWS_PER_YEAR).reduce((a, b) => a + b, 0);

export function UdfValExprPlayground() {
  const [year, setYear] = useState<Year>('FY2020');

  const valResult = ROWS_PER_YEAR[year];
  const exprResult = TOTAL_ROWS;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — pick a fiscal year filter and compare val vs. expr
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">
          CALCULATE(..., &apos;Date&apos;[Fiscal Year] = &quot;{year}&quot;)
        </span>
        <select
          aria-label="Fiscal year filter"
          value={year}
          onChange={(e) => setYear(e.target.value as Year)}
          className="w-36 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y} ({ROWS_PER_YEAR[y]} rows)
            </option>
          ))}
        </select>
      </div>

      <p className="mt-2 text-xs text-fd-muted-foreground">
        &apos;Sales&apos; has {TOTAL_ROWS} rows total: {YEARS.map((y) => `${y}=${ROWS_PER_YEAR[y]}`).join(', ')}.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">
            {highlightCode('FUNCTION CountRowsNow = (t : TABLE VAL) => COUNTROWS(CALCULATETABLE(t, ALL(\'Date\')))')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">val — t arrives already filtered to {year}</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">{valResult}</p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            valResult !== exprResult ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-xs break-words">
            {highlightCode(
              'FUNCTION CountRowsLater = (t : TABLE EXPR) => COUNTROWS(CALCULATETABLE(t, ALL(\'Date\')))',
            )}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">expr — ALL(&apos;Date&apos;) actually takes effect</p>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              valResult !== exprResult ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {exprResult}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
        — both functions call the identical <span className="font-mono">CALCULATETABLE(t, ALL(&apos;Date&apos;))</span>{' '}
        inside. With <span className="font-mono">val</span>, <span className="font-mono">t</span> is already a
        materialized, filtered table by the time the function runs — {year}&apos;s filter was applied before entry,
        so there&apos;s no filter context left for <span className="font-mono">ALL()</span> to remove.{' '}
        <span className="font-mono">expr</span> passes the unevaluated expression instead, so{' '}
        <span className="font-mono">ALL(&apos;Date&apos;)</span> genuinely removes the year filter before{' '}
        <span className="font-mono">t</span> is materialized — every year counts, regardless of which one was
        selected above.
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why a val parameter and an expr parameter produce different COUNTROWS() results here, even though both call the identical CALCULATETABLE(t, ALL(\'Date\')):\n\n```\n',
            `Fiscal year filter: ${year}\nSales rows: FY2019=3, FY2020=4, FY2021=2 (total ${TOTAL_ROWS})`,
            `\n\`\`\`\nCountRowsNow (val): ${valResult}\nCountRowsLater (expr): ${exprResult}`,
          )}
        />
      </div>
    </div>
  );
}
