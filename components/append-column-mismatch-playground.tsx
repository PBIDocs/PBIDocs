'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const SALES_JAN = [
  { CustomerID: 1, Amount: 100 },
  { CustomerID: 2, Amount: 150 },
];

const SALES_FEB = [
  { id: 3, Amount: 200 },
  { id: 4, Amount: 250 },
];

export function AppendColumnMismatchPlayground() {
  const [febColumnName, setFebColumnName] = useState('CustID');

  const matches = febColumnName.trim() === 'CustomerID';
  const columns = matches ? ['CustomerID', 'Amount'] : ['CustomerID', febColumnName.trim() || 'CustID', 'Amount'];

  const janRows = SALES_JAN.map((r) =>
    matches
      ? { CustomerID: r.CustomerID, Amount: r.Amount }
      : { CustomerID: r.CustomerID, [febColumnName.trim() || 'CustID']: null, Amount: r.Amount },
  );
  const febRows = SALES_FEB.map((r) =>
    matches
      ? { CustomerID: r.id, Amount: r.Amount }
      : { CustomerID: null, [febColumnName.trim() || 'CustID']: r.id, Amount: r.Amount },
  );
  const allRows = [...janRows, ...febRows];

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit SalesFeb&apos;s ID column name and watch Table.Combine() react
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="mb-2 text-xs text-fd-muted-foreground">SalesJan columns</p>
          <p className="font-mono text-sm">CustomerID, Amount</p>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="mb-2 text-xs text-fd-muted-foreground">SalesFeb columns</p>
          <div className="flex items-center gap-1.5 font-mono text-sm">
            <input
              type="text"
              aria-label="SalesFeb ID column name"
              value={febColumnName}
              onChange={(e) => setFebColumnName(e.target.value)}
              className="w-24 rounded-md border border-fd-border bg-fd-secondary/30 px-2 py-1 font-mono text-sm outline-none focus:border-fd-primary"
            />
            <span>, Amount</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="font-mono text-xs break-words">{highlightCode('Table.Combine({SalesJan, SalesFeb})')}</div>
      </div>

      <div
        className={cn(
          'mt-3 overflow-x-auto rounded-lg border',
          matches ? 'border-fd-border' : 'border-amber-500/40 bg-amber-500/10',
        )}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              {columns.map((c) => (
                <th key={c} className="px-3 py-2 text-left">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {allRows.map((row, i) => (
              <tr key={i} className="border-t border-fd-border">
                {columns.map((c) => {
                  const v = (row as Record<string, number | null>)[c];
                  return (
                    <td key={c} className="px-3 py-2">
                      {v === null || v === undefined ? (
                        <span className="italic text-fd-muted-foreground">(null)</span>
                      ) : (
                        v
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {matches ? (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — both tables use <span className="font-mono">CustomerID</span>, so{' '}
          <span className="font-mono">Table.Combine()</span> stacks cleanly into one fully-populated column.
        </p>
      ) : (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — <span className="font-mono">Table.Combine()</span> treats <span className="font-mono">CustomerID</span>{' '}
          and <span className="font-mono">{febColumnName.trim() || 'CustID'}</span> as two unrelated columns, not
          the same key under a different name. The result has <strong>both</strong> columns, each half-populated
          with <span className="font-mono">(null)</span> for the rows that came from the table without that exact
          name — no error, just a silently wider, wrong table.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why Table.Combine() produces a wider table with null values here, instead of an error:\n\n```\n',
            `SalesJan columns: CustomerID, Amount\nSalesFeb columns: ${febColumnName.trim() || 'CustID'}, Amount`,
            `\n\`\`\`\nResult columns: ${columns.join(', ')}`,
          )}
        />
      </div>
    </div>
  );
}
