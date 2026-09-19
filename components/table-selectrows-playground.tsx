'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface Row {
  id: string;
  status: string;
}

const initialRows: Row[] = [
  { id: '1', status: 'Active' },
  { id: '2', status: 'active' },
  { id: '3', status: 'ACTIVE' },
  { id: '4', status: 'Inactive' },
];

export function TableSelectRowsPlayground() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [searchValue, setSearchValue] = useState('active');
  const [normalize, setNormalize] = useState(false);

  const updateRow = (id: string, value: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: value } : r)));
  };

  const matches = rows.map((r) =>
    normalize ? r.status.toLowerCase() === searchValue.toLowerCase() : r.status === searchValue,
  );
  const matchCount = matches.filter(Boolean).length;

  // Rows that a case-insensitive reading of "matches the search value" would
  // expect to match, but the exact comparison doesn't catch.
  const missedCount = rows.filter(
    (r, i) => !matches[i] && r.status.toLowerCase() === searchValue.toLowerCase(),
  ).length;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit casing, the search value, or toggle normalization
      </p>

      <p className="mb-2 text-xs font-semibold text-fd-muted-foreground">Source[Status]</p>
      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Kept?</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((row, i) => {
              const isMissed = !matches[i] && row.status.toLowerCase() === searchValue.toLowerCase();
              return (
                <tr key={row.id} className={cn('border-t border-fd-border', isMissed && 'bg-amber-500/10')}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      aria-label={`Row ${row.id} status`}
                      value={row.status}
                      onChange={(e) => updateRow(row.id, e.target.value)}
                      className="w-28 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                    />
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2',
                      matches[i]
                        ? 'text-fd-primary'
                        : isMissed
                          ? 'font-semibold text-amber-600 dark:text-amber-400'
                          : 'text-fd-muted-foreground/50',
                    )}
                  >
                    {matches[i] ? 'yes' : isMissed ? 'no — case mismatch' : 'no'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-fd-muted-foreground">Search value</span>
          <input
            type="text"
            aria-label="Search value"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-32 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={normalize}
            onChange={(e) => setNormalize(e.target.checked)}
            className="size-4 accent-fd-primary"
          />
          <span className="text-fd-muted-foreground">Normalize with Text.Lower() first</span>
        </label>
      </div>

      <div className="mt-4">
        <div className="font-mono text-xs break-words">
          {normalize
            ? highlightCode(`Table.SelectRows(Source, each Text.Lower([Status]) = "${searchValue.toLowerCase()}")`)
            : highlightCode(`Table.SelectRows(Source, each [Status] = "${searchValue}")`)}
        </div>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        {matchCount} of {rows.length} row{rows.length === 1 ? '' : 's'} kept.
      </p>

      {missedCount > 0 ? (
        <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
          — {missedCount} row{missedCount === 1 ? '' : 's'} that clearly mean{missedCount === 1 ? 's' : ''}{' '}
          &quot;{searchValue}&quot; to a human {missedCount === 1 ? 'gets' : 'get'} silently dropped, highlighted
          above. M&apos;s <span className="font-mono">=</span> comparison on text is case-sensitive by default —
          check the box to normalize both sides with <span className="font-mono">Text.Lower()</span> and see them
          all get kept.
        </p>
      ) : (
        <p className="mt-2 text-xs text-fd-muted-foreground">
          — every row that matches case-insensitively is also kept exactly as-is right now. Change a row&apos;s
          casing (or the search value&apos;s) to see the case-sensitive comparison start missing one.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why some rows are silently dropped here even though they look like they should match:\n\n```\n',
            `Source[Status]: ${rows.map((r) => `"${r.status}"`).join(', ')}\nSearch value: "${searchValue}"\nNormalize with Text.Lower(): ${normalize}`,
            `\n\`\`\`\n${matchCount} of ${rows.length} rows kept`,
          )}
        />
      </div>
    </div>
  );
}
