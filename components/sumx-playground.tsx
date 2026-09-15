'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface Row {
  id: string;
  quantity: string;
  unitPrice: string;
}

const initialRows: Row[] = [
  { id: '1', quantity: '2', unitPrice: '45' },
  { id: '2', quantity: '1', unitPrice: '68' },
  { id: '3', quantity: '3', unitPrice: '45' },
];

export function SumXPlayground() {
  const [rows, setRows] = useState<Row[]>(initialRows);

  const updateRow = (id: string, field: 'quantity' | 'unitPrice', value: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const parsed = rows.map((r) => ({
    quantity: Number.parseFloat(r.quantity) || 0,
    unitPrice: Number.parseFloat(r.unitPrice) || 0,
  }));

  const sumX = parsed.reduce((total, r) => total + r.quantity * r.unitPrice, 0);
  const sumQuantity = parsed.reduce((total, r) => total + r.quantity, 0);
  const sumPrice = parsed.reduce((total, r) => total + r.unitPrice, 0);
  const naiveProduct = sumQuantity * sumPrice;

  const diverges = sumX !== naiveProduct;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit Quantity or UnitPrice on any row
      </p>

      <p className="mb-2 text-xs font-semibold text-fd-muted-foreground">FactSales</p>
      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Quantity</th>
              <th className="px-3 py-2 text-left">UnitPrice</th>
              <th className="px-3 py-2 text-left">Quantity × UnitPrice</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((row, i) => (
              <tr key={row.id} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    aria-label={`Row ${row.id} quantity`}
                    value={row.quantity}
                    onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                    className="w-16 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    aria-label={`Row ${row.id} unit price`}
                    value={row.unitPrice}
                    onChange={(e) => updateRow(row.id, 'unitPrice', e.target.value)}
                    className="w-16 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
                <td className="px-3 py-2 text-fd-muted-foreground">{parsed[i].quantity * parsed[i].unitPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">
            {highlightCode('SUMX(FactSales, FactSales[Quantity] * FactSales[UnitPrice])')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">multiplies each row first, then sums the results</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">{sumX}</p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            diverges ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-xs break-words">
            {highlightCode('SUM(FactSales[Quantity]) * SUM(FactSales[UnitPrice])')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">sums each column first, then multiplies the totals</p>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              diverges ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {naiveProduct}
          </p>
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — these aren&apos;t two ways of writing the same formula. SUMX() computes {sumQuantity === 0 ? '0' : parsed.map((r) => r.quantity * r.unitPrice).join(' + ')} = {sumX}, the real total revenue.
          The right side sums Quantity ({sumQuantity}) and UnitPrice ({sumPrice}) separately, then multiplies those
          two totals together — a number ({naiveProduct}) that doesn&apos;t correspond to anything real, since it
          multiplies a total quantity by a total price that were never paired on the same row.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — with a single row, there&apos;s nothing to sum first, so both sides happen to agree ({sumX}). Add a
          second row with different values to see them diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why SUMX(Quantity * UnitPrice) and SUM(Quantity) * SUM(UnitPrice) return different numbers here:\n\n```\n',
            `FactSales rows: ${rows.map((r) => `Quantity=${r.quantity}/UnitPrice=${r.unitPrice}`).join(', ')}`,
            `\n\`\`\`\nSUMX(FactSales, FactSales[Quantity] * FactSales[UnitPrice]) -> ${sumX}\nSUM(FactSales[Quantity]) * SUM(FactSales[UnitPrice]) -> ${naiveProduct}`,
          )}
        />
      </div>
    </div>
  );
}
