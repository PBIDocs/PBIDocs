'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface ProductRow {
  id: string;
  product: string;
  category: string;
  price: string;
}

const initialRows: ProductRow[] = [
  { id: '1', product: 'Widget A', category: 'Hardware', price: '100' },
  { id: '2', product: 'Widget B', category: 'Software', price: '50' },
];

export function AddColumnsSelectColumnsPlayground() {
  const [rows, setRows] = useState<ProductRow[]>(initialRows);

  const updateRow = (id: string, field: 'product' | 'category' | 'price', value: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const computed = rows.map((r) => {
    const price = Number.parseFloat(r.price);
    const profit = Number.isNaN(price) ? null : Math.round(price * 0.3 * 100) / 100;
    return { ...r, profit };
  });

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <p className="mb-2 text-xs font-semibold text-fd-muted-foreground">Products (source table)</p>
      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`Row ${row.id} product`}
                    value={row.product}
                    onChange={(e) => updateRow(row.id, 'product', e.target.value)}
                    className="w-28 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`Row ${row.id} category`}
                    value={row.category}
                    onChange={(e) => updateRow(row.id, 'category', e.target.value)}
                    className="w-28 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    aria-label={`Row ${row.id} price`}
                    value={row.price}
                    onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                    className="w-20 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs">
            {highlightCode('ADDCOLUMNS(Products, "Profit", Products[Price] * 0.3)')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">keeps every original column, plus the new one</p>
          <div className="mt-2 overflow-x-auto rounded-md border border-fd-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-fd-secondary/50 uppercase text-fd-muted-foreground">
                  <th className="px-2 py-1 text-left">Product</th>
                  <th className="px-2 py-1 text-left">Category</th>
                  <th className="px-2 py-1 text-left">Price</th>
                  <th className="px-2 py-1 text-left text-fd-primary">Profit</th>
                </tr>
              </thead>
              <tbody>
                {computed.map((row) => (
                  <tr key={row.id} className="border-t border-fd-border font-mono">
                    <td className="px-2 py-1">{row.product}</td>
                    <td className="px-2 py-1">{row.category}</td>
                    <td className="px-2 py-1">{row.price}</td>
                    <td className="px-2 py-1 font-semibold text-fd-primary">{row.profit ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={cn('rounded-lg border p-3 border-amber-500/40 bg-amber-500/10')}>
          <div className="font-mono text-xs">
            {highlightCode('SELECTCOLUMNS(Products, "Product", Products[Product], "Profit", Products[Price] * 0.3)')}
          </div>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            returns only the columns listed — Category and Price are gone, not just hidden
          </p>
          <div className="mt-2 overflow-x-auto rounded-md border border-amber-500/40">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-amber-500/10 uppercase text-amber-600 dark:text-amber-400">
                  <th className="px-2 py-1 text-left">Product</th>
                  <th className="px-2 py-1 text-left">Profit</th>
                </tr>
              </thead>
              <tbody>
                {computed.map((row) => (
                  <tr key={row.id} className="border-t border-amber-500/30 font-mono">
                    <td className="px-2 py-1">{row.product}</td>
                    <td className="px-2 py-1 font-semibold text-amber-600 dark:text-amber-400">{row.profit ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        — edit a row above and both results update. Notice{' '}
        <span className="font-mono text-amber-600 dark:text-amber-400">Category</span> and{' '}
        <span className="font-mono text-amber-600 dark:text-amber-400">Price</span> never appear on the
        SELECTCOLUMNS side, even though the same source table has them — SELECTCOLUMNS never carries
        columns forward automatically the way ADDCOLUMNS does.
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why ADDCOLUMNS and SELECTCOLUMNS produce tables with different columns here:\n\n```\n',
            `ADDCOLUMNS(Products, "Profit", Products[Price] * 0.3) -> columns: Product, Category, Price, Profit`,
            `\n\`\`\`\nSELECTCOLUMNS(Products, "Product", Products[Product], "Profit", Products[Price] * 0.3) -> columns: Product, Profit only`,
          )}
        />
      </div>
    </div>
  );
}
