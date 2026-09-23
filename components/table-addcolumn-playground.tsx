'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface Row {
  id: string;
  first: string;
  last: string;
}

const initialRows: Row[] = [
  { id: '1', first: 'John', last: 'Smith' },
  { id: '2', first: 'Priya', last: 'Rao' },
];

export function TableAddColumnPlayground() {
  const [rows, setRows] = useState<Row[]>(initialRows);

  const updateRow = (id: string, field: 'first' | 'last', value: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit First or Last, then compare the two approaches
      </p>

      <p className="mb-2 text-xs font-semibold text-fd-muted-foreground">Source</p>
      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">First</th>
              <th className="px-3 py-2 text-left">Last</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`Row ${row.id} first`}
                    value={row.first}
                    onChange={(e) => updateRow(row.id, 'first', e.target.value)}
                    className="w-28 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`Row ${row.id} last`}
                    value={row.last}
                    onChange={(e) => updateRow(row.id, 'last', e.target.value)}
                    className="w-28 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">
            {highlightCode('Table.AddColumn(Source, "FullName", each [First] & " " & [Last])')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">sees the whole row — every column is in scope</p>
          <div className="mt-2 overflow-x-auto rounded-md border border-fd-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-fd-secondary/50 uppercase text-fd-muted-foreground">
                  <th className="px-2 py-1 text-left">First</th>
                  <th className="px-2 py-1 text-left">Last</th>
                  <th className="px-2 py-1 text-left text-fd-primary">FullName</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-fd-border">
                    <td className="px-2 py-1">{row.first}</td>
                    <td className="px-2 py-1">{row.last}</td>
                    <td className="px-2 py-1 font-semibold text-fd-primary">
                      {row.first} {row.last}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <div className="font-mono text-xs break-words">
            {highlightCode('Table.TransformColumns(Source, {{"First", each _ & " " & [Last]}})')}
          </div>
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            sees only the value being transformed — [Last] isn&apos;t in scope here at all
          </p>
          <div className="mt-2 rounded-md border border-red-500/40 bg-fd-background p-2 font-mono text-xs text-red-600 dark:text-red-400">
            Expression.Error: The field &apos;Last&apos; wasn&apos;t found.
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        — <span className="font-mono">Table.AddColumn()</span>&apos;s expression runs with the whole row
        available, so combining two columns into a new one is exactly what it&apos;s for. The
        <span className="font-mono"> each</span> inside <span className="font-mono">Table.TransformColumns()</span>{' '}
        only ever receives the single value already sitting in the column being transformed — there&apos;s no
        row to reach <span className="font-mono">[Last]</span> from, so referencing it errors immediately, on
        every row, regardless of what the data actually contains.
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why Table.TransformColumns cannot reach a second column the way Table.AddColumn can:\n\n```\n',
            `Source rows: ${rows.map((r) => `First="${r.first}", Last="${r.last}"`).join('; ')}`,
            '\n```\nTable.AddColumn(...) -> combines First and Last correctly\nTable.TransformColumns(...) -> Expression.Error: The field \'Last\' wasn\'t found.',
          )}
        />
      </div>
    </div>
  );
}
