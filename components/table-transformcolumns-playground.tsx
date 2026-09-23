'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const SOURCE_ROWS = ['  Alice  ', ' Bob', 'Eve  '];
const ACTUAL_COLUMN_NAME = 'Name';

export function TableTransformColumnsPlayground() {
  const [columnName, setColumnName] = useState('name');

  const matches = columnName === ACTUAL_COLUMN_NAME;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — the actual column is named &quot;Name&quot;, capital N
      </p>

      <p className="mb-2 text-xs font-semibold text-fd-muted-foreground">Source[Name] (before trimming)</p>
      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <tbody className="font-mono">
            {SOURCE_ROWS.map((value, i) => (
              <tr key={i} className="border-t border-fd-border first:border-t-0">
                <td className="px-3 py-1.5">&quot;{value}&quot;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">Column name passed to Table.TransformColumns</span>
        <input
          type="text"
          aria-label="Column name"
          value={columnName}
          onChange={(e) => setColumnName(e.target.value)}
          className="w-fit rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </div>

      <div className="mt-4">
        <div className="font-mono text-sm break-words">
          {highlightCode(`Table.TransformColumns(Source, {{"${columnName}", Text.Trim}})`)}
        </div>
      </div>

      <div
        className={cn(
          'mt-3 rounded-lg border p-3',
          matches ? 'border-fd-border bg-fd-background' : 'border-red-500/40 bg-red-500/10',
        )}
      >
        {matches ? (
          <div className="overflow-x-auto rounded-md border border-fd-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-fd-secondary/50 uppercase text-fd-muted-foreground">
                  <th className="px-2 py-1 text-left text-fd-primary">Name</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {SOURCE_ROWS.map((value, i) => (
                  <tr key={i} className="border-t border-fd-border">
                    <td className="px-2 py-1 font-semibold text-fd-primary">&quot;{value.trim()}&quot;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-mono text-xs text-red-600 dark:text-red-400">
            Expression.Error: The column &apos;{columnName}&apos; of the table wasn&apos;t found.
          </p>
        )}
      </div>

      {matches ? (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — the column name matches exactly, so every value gets trimmed. Change the case (or misspell it) to see
          the step fail instead.
        </p>
      ) : (
        <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">
          — column names in{' '}
          <span className="font-mono">Table.TransformColumns()</span>&apos;s operation list are case-sensitive,
          exactly like every other column reference in M. &quot;{columnName}&quot; and &quot;
          {ACTUAL_COLUMN_NAME}&quot; are different strings to Power Query even though they look like the same
          column to a person reading the step — this fails the whole step, not just the rows that would have
          changed.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why this Table.TransformColumns step fails or succeeds:\n\n```\n',
            `Actual column name: "${ACTUAL_COLUMN_NAME}"\nColumn name used in the step: "${columnName}"`,
            `\n\`\`\`\nTable.TransformColumns(Source, {{"${columnName}", Text.Trim}}) -> ${matches ? 'succeeds' : `Expression.Error: The column '${columnName}' of the table wasn't found.`}`,
          )}
        />
      </div>
    </div>
  );
}
