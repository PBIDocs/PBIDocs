'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

const DEFAULT_AMOUNTS = '150, 200, 50, 300';
const THRESHOLD = 100;

function MiniTable({ values, matched }: { values: number[]; matched: boolean[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-fd-border">
      <table className="w-full min-w-[220px] border-collapse text-sm">
        <thead>
          <tr className="bg-fd-secondary/50 text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">
            <th className="px-3 py-2 text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          {values.map((v, i) => (
            <tr key={i} className={cn('border-t border-fd-border', !matched[i] && 'opacity-40')}>
              <td className={cn('px-3 py-1.5 font-mono', matched[i] ? 'text-fd-primary font-semibold' : 'text-fd-muted-foreground line-through')}>
                {v}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TableFirstNPlayground() {
  const [amountsText, setAmountsText] = useState(DEFAULT_AMOUNTS);

  const amounts = amountsText
    .split(',')
    .map((v) => Number.parseFloat(v.trim()))
    .filter((v) => !Number.isNaN(v));

  // Table.FirstN(Source, each [Amount] > 100): take rows from the top only
  // until the condition first fails, then stop -- a later matching row is
  // never reached, not just skipped.
  const firstNKept: boolean[] = [];
  let stopped = false;
  for (const v of amounts) {
    if (stopped) {
      firstNKept.push(false);
      continue;
    }
    if (v > THRESHOLD) {
      firstNKept.push(true);
    } else {
      firstNKept.push(false);
      stopped = true;
    }
  }

  // Table.SelectRows: every matching row, regardless of position.
  const selectRowsKept = amounts.map((v) => v > THRESHOLD);

  const missedByFirstN = selectRowsKept.some((kept, i) => kept && !firstNKept[i]);

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <label className="mb-4 flex flex-col gap-1 text-sm">
        <span className="text-fd-muted-foreground">Amount column (comma-separated)</span>
        <input
          type="text"
          value={amountsText}
          onChange={(e) => setAmountsText(e.target.value)}
          className="w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </label>

      {amounts.length === 0 ? (
        <p className="text-sm text-fd-muted-foreground">Enter at least one number above.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 font-mono text-xs text-fd-muted-foreground">
              Table.FirstN(Source, each [Amount] &gt; {THRESHOLD})
            </p>
            <MiniTable values={amounts} matched={firstNKept} />
          </div>
          <div>
            <p className="mb-2 font-mono text-xs text-fd-muted-foreground">
              Table.SelectRows(Source, each [Amount] &gt; {THRESHOLD})
            </p>
            <MiniTable values={amounts} matched={selectRowsKept} />
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {missedByFirstN && (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            — Table.FirstN stopped at the first non-matching row and never reached a later
            matching one; Table.SelectRows caught it anyway.
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why Table.FirstN() and Table.SelectRows() gave different results here:\n\n',
            `Amount values: ${amounts.join(', ')}\nTable.FirstN(Source, each [Amount] > ${THRESHOLD}) keeps: ${amounts.filter((_, i) => firstNKept[i]).join(', ') || '(none)'}\nTable.SelectRows(Source, each [Amount] > ${THRESHOLD}) keeps: ${amounts.filter((_, i) => selectRowsKept[i]).join(', ') || '(none)'}`,
          )}
        />
      </div>
    </div>
  );
}
