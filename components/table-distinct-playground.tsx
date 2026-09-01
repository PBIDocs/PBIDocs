'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

interface Row {
  customerId: string;
  email: string;
}

const DEFAULT_ROWS: Row[] = [
  { customerId: '1001', email: 'j.chen@example.com' },
  { customerId: '1001', email: 'jchen@work-example.com' },
  { customerId: '1002', email: 'b.diaz@example.com' },
];

function parseRows(text: string): Row[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [customerId, email] = line.split(',').map((v) => v.trim());
      return { customerId: customerId ?? '', email: email ?? '' };
    });
}

function rowsToText(rows: Row[]): string {
  return rows.map((r) => `${r.customerId}, ${r.email}`).join('\n');
}

export function TableDistinctPlayground() {
  const [text, setText] = useState(rowsToText(DEFAULT_ROWS));

  const rows = parseRows(text);

  // Table.Distinct(Source, {"CustomerID"}) semantics: keep the FIRST row seen
  // for each CustomerID, discard the rest of that group entirely -- no
  // merging of the other columns.
  const seen = new Set<string>();
  const keptRows: Row[] = [];
  const droppedRows: Row[] = [];
  for (const row of rows) {
    if (row.customerId === '') continue;
    if (seen.has(row.customerId)) {
      droppedRows.push(row);
    } else {
      seen.add(row.customerId);
      keptRows.push(row);
    }
  }

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <label className="mb-4 flex flex-col gap-1 text-sm">
        <span className="text-fd-muted-foreground">CustomerID, Email (one row per line)</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </label>

      <p className="mb-2 font-mono text-xs text-fd-muted-foreground">
        Table.Distinct(Source, {'{'}&quot;CustomerID&quot;{'}'})
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs text-fd-muted-foreground">Source</p>
          <div className="overflow-x-auto rounded-lg border border-fd-border">
            <table className="w-full min-w-[360px] border-collapse text-sm">
              <thead>
                <tr className="bg-fd-secondary/50 text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">
                  <th className="px-3 py-2 text-left">CustomerID</th>
                  <th className="px-3 py-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const isDropped = droppedRows.includes(row);
                  return (
                    <tr
                      key={i}
                      className={cn('border-t border-fd-border', isDropped && 'bg-red-500/10')}
                    >
                      <td className="px-3 py-1.5 font-mono text-fd-foreground">{row.customerId}</td>
                      <td
                        className={cn(
                          'px-3 py-1.5 font-mono',
                          isDropped ? 'text-red-500 line-through dark:text-red-400' : 'text-fd-foreground',
                        )}
                      >
                        {row.email}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs text-fd-muted-foreground">
            After Table.Distinct(Source, {'{'}&quot;CustomerID&quot;{'}'})
          </p>
          <div className="overflow-x-auto rounded-lg border border-fd-border">
            <table className="w-full min-w-[360px] border-collapse text-sm">
              <thead>
                <tr className="bg-fd-secondary/50 text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">
                  <th className="px-3 py-2 text-left">CustomerID</th>
                  <th className="px-3 py-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {keptRows.map((row, i) => (
                  <tr key={i} className="border-t border-fd-border">
                    <td className="px-3 py-1.5 font-mono text-fd-foreground">{row.customerId}</td>
                    <td className="px-3 py-1.5 font-mono text-fd-primary">{row.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {droppedRows.length > 0 && (
          <span className="text-xs text-red-500 dark:text-red-400">
            — {droppedRows.length} row{droppedRows.length === 1 ? '' : 's'} struck through above got
            silently discarded, including its Email value — Table.Distinct() never merged or
            flagged the difference.
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain this Table.Distinct() result, especially any discarded rows:\n\n',
            `Source rows (CustomerID, Email):\n${rowsToText(rows)}\n\nAfter Table.Distinct(Source, {"CustomerID"}):\n${rowsToText(keptRows)}`,
          )}
        />
      </div>
    </div>
  );
}
