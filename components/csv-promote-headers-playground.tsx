'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const DEFAULT_CSV = 'Name,Region,Sales\nAlice,East,500\nBob,West,700';

// Deliberately a plain comma split, not full RFC4180 quoted-field parsing --
// enough to show the actual point (generic column names, no type detection,
// first row not special until PromoteHeaders runs), not a full CSV parser.
function parseCsv(text: string): string[][] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(','));
}

function MiniTable({ headers, rows, headerIsData }: { headers: string[]; rows: string[][]; headerIsData?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-fd-border">
      <table className="w-full min-w-[360px] border-collapse text-sm">
        <thead>
          <tr
            className={
              headerIsData
                ? 'bg-fd-secondary/30 text-xs text-fd-muted-foreground/70 italic'
                : 'bg-fd-secondary/50 text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase'
            }
          >
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-mono">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-fd-border">
              {headers.map((_, j) => (
                <td key={j} className="px-3 py-1.5 font-mono text-fd-foreground">
                  {row[j] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CsvPromoteHeadersPlayground() {
  const [csvText, setCsvText] = useState(DEFAULT_CSV);

  const rows = parseCsv(csvText);
  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const genericHeaders = Array.from({ length: columnCount }, (_, i) => `Column${i + 1}`);

  const [firstRow, ...restRows] = rows;
  const promotedHeaders = firstRow ?? [];

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <label className="mb-4 flex flex-col gap-1 text-sm">
        <span className="text-fd-muted-foreground">CSV text</span>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </label>

      {rows.length === 0 ? (
        <p className="text-sm text-fd-muted-foreground">Enter at least one row of CSV text above.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 font-mono text-xs text-fd-muted-foreground">Csv.Document() output</p>
            <MiniTable headers={genericHeaders} rows={rows} headerIsData />
          </div>
          <div>
            <p className="mb-2 font-mono text-xs text-fd-muted-foreground">
              After Table.PromoteHeaders()
            </p>
            <MiniTable headers={promotedHeaders} rows={restRows} />
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-xs text-fd-muted-foreground">
          — the top table treats every row, including the first, as plain data; the bottom table
          is the same rows after promoting row 1 to headers.
        </span>
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain what Csv.Document() and Table.PromoteHeaders() each do to this CSV data:\n\n```\n',
            csvText,
            '\n```',
          )}
        />
      </div>
    </div>
  );
}
