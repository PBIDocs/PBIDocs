'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

type MissingFieldMode = 'Error' | 'Ignore' | 'UseNull';

const SOURCE_COLUMNS = ['OrderID', 'CustomerID', 'Amount'];
const SOURCE_ROW = { OrderID: '1001', CustomerID: '55', Amount: '250' };

export function TableSelectColumnsPlayground() {
  const [requestedText, setRequestedText] = useState('OrderID, CustomerID, Region');
  const [mode, setMode] = useState<MissingFieldMode>('Error');

  const requested = requestedText
    .split(',')
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const missing = requested.filter((c) => !SOURCE_COLUMNS.includes(c));
  const hasMissing = missing.length > 0;
  const willError = hasMissing && mode === 'Error';

  const resultColumns =
    mode === 'Ignore' ? requested.filter((c) => SOURCE_COLUMNS.includes(c)) : requested;

  const formula = `Table.SelectColumns(Source, {${requested.map((c) => `"${c}"`).join(', ')}}${
    mode === 'Error' ? '' : `, MissingField.${mode}`
  })`;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <div className="mb-4">
        <p className="mb-2 text-xs text-fd-muted-foreground">Source (actual columns)</p>
        <div className="overflow-x-auto rounded-lg border border-fd-border">
          <table className="w-full min-w-[300px] border-collapse text-sm">
            <thead>
              <tr className="bg-fd-secondary/50 text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">
                {SOURCE_COLUMNS.map((c) => (
                  <th key={c} className="px-3 py-2 text-left">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-fd-border">
                {SOURCE_COLUMNS.map((c) => (
                  <td key={c} className="px-3 py-1.5 font-mono text-fd-foreground">
                    {SOURCE_ROW[c as keyof typeof SOURCE_ROW]}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <label className="mb-4 flex flex-col gap-1 text-sm">
        <span className="text-fd-muted-foreground">Columns to select (comma-separated)</span>
        <input
          type="text"
          value={requestedText}
          onChange={(e) => setRequestedText(e.target.value)}
          className="w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </label>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['Error', 'Ignore', 'UseNull'] as MissingFieldMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={
              'rounded-lg border px-3 py-1.5 text-xs font-semibold ' +
              (mode === m
                ? 'border-fd-primary bg-fd-primary/10 text-fd-primary'
                : 'border-fd-border text-fd-muted-foreground hover:bg-fd-muted')
            }
          >
            {m === 'Error' ? '(default: Error)' : `MissingField.${m}`}
          </button>
        ))}
      </div>

      <p className="mb-2 font-mono text-xs text-fd-muted-foreground">{formula}</p>

      {willError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500 dark:text-red-400">
          Expression.Error: The column &apos;{missing[0]}&apos; of the table wasn&apos;t found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-fd-border">
          <table className="w-full min-w-[300px] border-collapse text-sm">
            <thead>
              <tr className="bg-fd-secondary/50 text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">
                {resultColumns.map((c) => (
                  <th key={c} className="px-3 py-2 text-left">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-fd-border">
                {resultColumns.map((c) => {
                  const isMissing = !SOURCE_COLUMNS.includes(c);
                  return (
                    <td
                      key={c}
                      className={
                        'px-3 py-1.5 font-mono ' +
                        (isMissing ? 'italic text-fd-muted-foreground' : 'text-fd-foreground')
                      }
                    >
                      {isMissing ? 'null' : SOURCE_ROW[c as keyof typeof SOURCE_ROW]}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {hasMissing && (
          <span className="text-xs text-fd-muted-foreground">
            — &quot;{missing.join('", "')}&quot; {missing.length === 1 ? "doesn't" : "don't"} exist in
            Source.
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain this Table.SelectColumns() result, especially the MissingField behavior:\n\n```\n',
            formula,
            `\n\`\`\`\n${willError ? "Result: errors -- the column wasn't found" : `Result columns: ${resultColumns.join(', ')}`}`,
          )}
        />
      </div>
    </div>
  );
}
