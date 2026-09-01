'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const DEFAULT_ITEMS = 'Widget\nGadget\nGizmo\nDoohickey';

export function TableAddIndexColumnPlayground() {
  const [itemsText, setItemsText] = useState(DEFAULT_ITEMS);
  const [initialValue, setInitialValue] = useState('0');
  const [increment, setIncrement] = useState('1');

  const items = itemsText
    .split('\n')
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  const startNum = Number.parseFloat(initialValue);
  const incNum = Number.parseFloat(increment);
  const inputsAreValid = !Number.isNaN(startNum) && !Number.isNaN(incNum);

  const indexValues = inputsAreValid ? items.map((_, i) => startNum + i * incNum) : [];

  const formula = `Table.AddIndexColumn(Source, "Index", ${initialValue || '0'}, ${increment || '1'})`;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <label className="mb-4 flex flex-col gap-1 text-sm">
        <span className="text-fd-muted-foreground">Product column (one per line)</span>
        <textarea
          value={itemsText}
          onChange={(e) => setItemsText(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </label>

      <PlaygroundTable>
        <PlaygroundRow label="initialValue">
          <input
            type="text"
            inputMode="decimal"
            aria-label="Initial value"
            value={initialValue}
            onChange={(e) => setInitialValue(e.target.value)}
            className="w-24 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={Number.isNaN(startNum)}
          />
        </PlaygroundRow>
        <PlaygroundRow label="increment">
          <input
            type="text"
            inputMode="decimal"
            aria-label="Increment"
            value={increment}
            onChange={(e) => setIncrement(e.target.value)}
            className="w-24 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={Number.isNaN(incNum)}
          />
        </PlaygroundRow>
      </PlaygroundTable>

      <p className="mt-4 mb-2 font-mono text-xs text-fd-muted-foreground">{formula}</p>

      {items.length === 0 || !inputsAreValid ? (
        <p className="text-sm text-fd-muted-foreground">
          {items.length === 0 ? 'Enter at least one product above.' : 'Enter numbers for initialValue and increment.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-fd-border">
          <table className="w-full min-w-[320px] border-collapse text-sm">
            <thead>
              <tr className="bg-fd-secondary/50 text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">
                <th className="px-3 py-2 text-left">Index</th>
                <th className="px-3 py-2 text-left">Product</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-t border-fd-border">
                  <td className="px-3 py-1.5 font-mono font-semibold text-fd-primary">{indexValues[i]}</td>
                  <td className="px-3 py-1.5 font-mono text-fd-foreground">{item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {inputsAreValid && startNum === 0 && (
          <span className="text-xs text-fd-muted-foreground">
            — this is the default: index starts at 0, not 1.
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain this Table.AddIndexColumn() result:\n\n```\n',
            formula,
            `\n\`\`\`\nResulting index values: ${indexValues.join(', ')}`,
          )}
        />
      </div>
    </div>
  );
}
