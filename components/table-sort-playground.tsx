'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

const DEFAULT_VALUES = '10, 9, 2, 1';

export function TableSortPlayground() {
  const [valuesText, setValuesText] = useState(DEFAULT_VALUES);

  const values = valuesText
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

  const sortedAsText = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const numericValues = values.map((v) => Number.parseFloat(v));
  const allNumeric = numericValues.every((n) => !Number.isNaN(n));
  const sortedAsNumber = allNumeric
    ? [...values].sort((a, b) => Number.parseFloat(a) - Number.parseFloat(b))
    : [];

  const ordersDiffer = allNumeric && sortedAsText.join(',') !== sortedAsNumber.join(',');

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <label className="mb-4 flex flex-col gap-1 text-sm">
        <span className="text-fd-muted-foreground">Column values (comma-separated)</span>
        <input
          type="text"
          value={valuesText}
          onChange={(e) => setValuesText(e.target.value)}
          className="w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={cn('rounded-lg border p-3', ordersDiffer ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background')}>
          <p className="text-xs text-fd-muted-foreground">
            Sorted as <code className="rounded bg-fd-secondary px-1 py-0.5">text</code> (Order.Ascending)
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-fd-primary">
            {sortedAsText.length > 0 ? sortedAsText.join(', ') : '—'}
          </p>
        </div>
        <div className={cn('rounded-lg border p-3', ordersDiffer ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background')}>
          <p className="text-xs text-fd-muted-foreground">
            Sorted as a real <code className="rounded bg-fd-secondary px-1 py-0.5">number</code>
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-fd-primary">
            {allNumeric ? sortedAsNumber.join(', ') : 'not all values are numeric'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {ordersDiffer && (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Different orders — the text-typed column sorts by character, not by value.
          </span>
        )}
        {allNumeric && !ordersDiffer && (
          <span className="text-xs text-fd-muted-foreground">
            Same order for these values — try adding a two-digit and a one-digit number together
            (like 10 and 9) to see them diverge.
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain this Table.Sort() text-vs-numeric ordering difference:\n\n',
            `Values: ${values.join(', ')}\nSorted as text: ${sortedAsText.join(', ')}\nSorted as number: ${allNumeric ? sortedAsNumber.join(', ') : 'n/a (not all numeric)'}`,
          )}
        />
      </div>
    </div>
  );
}
