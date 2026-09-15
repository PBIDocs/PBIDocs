'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface Row {
  id: string;
  orderId: string;
  discount: string;
}

const initialRows: Row[] = [
  { id: '1', orderId: '1001', discount: '10' },
  { id: '2', orderId: '1002', discount: '' },
  { id: '3', orderId: '1003', discount: '5' },
  { id: '4', orderId: '1004', discount: 'N/A' },
];

function isNumeric(value: string): boolean {
  return value.trim() !== '' && !Number.isNaN(Number(value.trim()));
}

export function CountRowsCountCountaPlayground() {
  const [rows, setRows] = useState<Row[]>(initialRows);

  const updateRow = (id: string, field: 'orderId' | 'discount', value: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const countRows = rows.length;
  const count = rows.filter((r) => isNumeric(r.discount)).length;
  const countA = rows.filter((r) => r.discount.trim() !== '').length;

  const allSame = countRows === count && count === countA;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit Discount to blank, a number, or text
      </p>

      <p className="mb-2 text-xs font-semibold text-fd-muted-foreground">FactSales</p>
      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">OrderID</th>
              <th className="px-3 py-2 text-left">Discount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`Row ${row.id} order id`}
                    value={row.orderId}
                    onChange={(e) => updateRow(row.id, 'orderId', e.target.value)}
                    className="w-24 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`Row ${row.id} discount`}
                    value={row.discount}
                    placeholder="(blank)"
                    onChange={(e) => updateRow(row.id, 'discount', e.target.value)}
                    className="w-24 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">{highlightCode('COUNTROWS(FactSales)')}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">every row, no exceptions</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">{countRows}</p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            count !== countRows ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-xs break-words">{highlightCode('COUNT(FactSales[Discount])')}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">only rows where Discount is a number</p>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              count !== countRows ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {count}
          </p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            countA !== countRows ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-xs break-words">{highlightCode('COUNTA(FactSales[Discount])')}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">only rows where Discount isn&apos;t blank</p>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              countA !== countRows ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {countA}
          </p>
        </div>
      </div>

      {!allSame ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — {countRows} rows exist no matter what. COUNT() only counts the {count} row{count === 1 ? '' : 's'} where
          Discount is genuinely numeric — a blank or a text value like &quot;N/A&quot; doesn&apos;t qualify.
          COUNTA() is looser: it counts the {countA} row{countA === 1 ? '' : 's'} where Discount is anything at all
          except blank, so &quot;N/A&quot; counts there even though it isn&apos;t a number. Only COUNTROWS() is
          guaranteed to equal the real row count regardless of what&apos;s in any particular column.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — every row currently has a genuine number in Discount, so all three agree ({countRows} each). Clear a
          cell, or type text like &quot;N/A&quot; into one, to see them diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why COUNTROWS, COUNT, and COUNTA return different numbers here:\n\n```\n',
            `FactSales[Discount]: ${rows.map((r) => (r.discount.trim() === '' ? '(blank)' : r.discount)).join(', ')}`,
            `\n\`\`\`\nCOUNTROWS(FactSales) -> ${countRows}\nCOUNT(FactSales[Discount]) -> ${count}\nCOUNTA(FactSales[Discount]) -> ${countA}`,
          )}
        />
      </div>
    </div>
  );
}
