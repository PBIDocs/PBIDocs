'use client';

import { useState } from 'react';
import { FlaskConical, ArrowLeftRight } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

interface Row {
  col1: string;
  col2: string;
}

const table1Headers = ['Region', 'Amount'];
const table1Rows: Row[] = [
  { col1: 'East', col2: '100' },
  { col1: 'West', col2: '200' },
];

// Table2's underlying data, independent of which physical column order it's
// built in -- the swap toggle changes the actual column order, same as
// building the table with its columns in a different sequence in M or DAX.
const table2Data = [
  { region: 'North', amount: '50' },
  { region: 'South', amount: '75' },
];

export function UnionPlayground() {
  // Table2 starts built with columns in the OPPOSITE order from Table1 --
  // same column names, same data, just authored Amount-then-Region instead
  // of Region-then-Amount. UNION() doesn't look at names at all; only
  // position determines where each value ends up.
  const [table2Swapped, setTable2Swapped] = useState(true);

  const table2Headers = table2Swapped ? ['Amount', 'Region'] : ['Region', 'Amount'];
  const table2Rows: Row[] = table2Data.map((d) =>
    table2Swapped ? { col1: d.amount, col2: d.region } : { col1: d.region, col2: d.amount },
  );

  // UNION() output columns are named after the FIRST table; each row from
  // every table lands under those names purely by position (1st -> 1st,
  // 2nd -> 2nd), regardless of what the source table called that position.
  const unionRows = [...table1Rows, ...table2Rows];

  const garbled = table2Swapped;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold text-fd-muted-foreground">Table1</p>
          <table className="w-full overflow-hidden rounded-lg border border-fd-border text-sm">
            <thead>
              <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
                <th className="px-3 py-1.5 text-left">{table1Headers[0]}</th>
                <th className="px-3 py-1.5 text-left">{table1Headers[1]}</th>
              </tr>
            </thead>
            <tbody>
              {table1Rows.map((r, i) => (
                <tr key={i} className="border-t border-fd-border bg-fd-background font-mono text-xs">
                  <td className="px-3 py-1.5">{r.col1}</td>
                  <td className="px-3 py-1.5">{r.col2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-semibold text-fd-muted-foreground">Table2</p>
            <button
              type="button"
              onClick={() => setTable2Swapped((s) => !s)}
              className="flex items-center gap-1 rounded-md border border-fd-border px-2 py-0.5 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
            >
              <ArrowLeftRight className="size-3" />
              swap column order
            </button>
          </div>
          <table className="w-full overflow-hidden rounded-lg border border-fd-border text-sm">
            <thead>
              <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
                <th className="px-3 py-1.5 text-left">{table2Headers[0]}</th>
                <th className="px-3 py-1.5 text-left">{table2Headers[1]}</th>
              </tr>
            </thead>
            <tbody>
              {table2Rows.map((r, i) => (
                <tr key={i} className="border-t border-fd-border bg-fd-background font-mono text-xs">
                  <td className="px-3 py-1.5">{r.col1}</td>
                  <td className="px-3 py-1.5">{r.col2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode('UNION(Table1, Table2)')}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table
          className={cn(
            'w-full overflow-hidden rounded-lg border text-sm',
            garbled ? 'border-amber-500/40' : 'border-fd-border',
          )}
        >
          <thead>
            <tr className={cn('text-xs uppercase text-fd-muted-foreground', garbled ? 'bg-amber-500/10' : 'bg-fd-secondary/50')}>
              <th className="px-3 py-1.5 text-left">{table1Headers[0]}</th>
              <th className="px-3 py-1.5 text-left">{table1Headers[1]}</th>
            </tr>
          </thead>
          <tbody>
            {unionRows.map((r, i) => (
              <tr
                key={i}
                className={cn(
                  'border-t font-mono text-xs',
                  garbled && i >= table1Rows.length
                    ? 'border-amber-500/40 bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400'
                    : 'border-fd-border bg-fd-background',
                )}
              >
                <td className="px-3 py-1.5">{r.col1}</td>
                <td className="px-3 py-1.5">{r.col2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {garbled ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — Table2&apos;s columns were built in the opposite order (Amount, Region), but UNION() doesn&apos;t know
          that: it matched by position, so Table2&apos;s Amount values landed under the Region header, and its
          Region values landed under Amount.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — with both tables built in the same column order, the positional match happens to line up correctly.
          Click &quot;swap column order&quot; above to see it break.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            "Explain why UNION() produced this result, especially why it matched columns the way it did:\n\n```\n",
            `Table1: ${table1Headers.join(', ')}\n${table1Rows.map((r) => `${r.col1}, ${r.col2}`).join('\n')}\n\nTable2: ${table2Headers.join(', ')}\n${table2Rows.map((r) => `${r.col1}, ${r.col2}`).join('\n')}`,
            `\n\`\`\`\nUNION(Table1, Table2) ->\n${table1Headers.join(', ')}\n${unionRows.map((r) => `${r.col1}, ${r.col2}`).join('\n')}`,
          )}
        />
      </div>
    </div>
  );
}
