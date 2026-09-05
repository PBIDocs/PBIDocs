'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

interface FactRow {
  id: string;
  category: string;
  amount: string;
}

const initialFactRows: FactRow[] = [
  { id: '1', category: 'Electronics', amount: '300' },
  { id: '2', category: 'Electronics', amount: '200' },
  { id: '3', category: 'Furniture', amount: '150' },
  { id: '4', category: 'Gadgets', amount: '80' },
];

export function ValuesDistinctPlayground() {
  const [dimensionText, setDimensionText] = useState('Electronics, Furniture, Apparel');
  const [factRows, setFactRows] = useState<FactRow[]>(initialFactRows);

  const updateRow = (id: string, field: 'category' | 'amount', value: string) => {
    setFactRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const dimensionCategories = dimensionText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const validRows = factRows.filter((r) => r.category.trim() && !Number.isNaN(Number.parseFloat(r.amount)));

  const totalByCategory = new Map<string, number>();
  let orphanTotal = 0;
  for (const row of validRows) {
    const amt = Number.parseFloat(row.amount);
    if (dimensionCategories.includes(row.category.trim())) {
      totalByCategory.set(row.category.trim(), (totalByCategory.get(row.category.trim()) ?? 0) + amt);
    } else {
      orphanTotal += amt;
    }
  }

  const hasOrphan = orphanTotal > 0;
  const valuesRowCount = dimensionCategories.length + (hasOrphan ? 1 : 0);
  const distinctRowCount = dimensionCategories.length;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — a simplified model of the documented behavior
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">DimProduct[Category] — the &quot;one&quot; side</span>
        <input
          type="text"
          aria-label="Dimension categories"
          value={dimensionText}
          onChange={(e) => setDimensionText(e.target.value)}
          className="w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">FactSales[Category] — the &quot;many&quot; side</th>
              <th className="px-3 py-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {factRows.map((row) => {
              const isOrphan = row.category.trim() && !dimensionCategories.includes(row.category.trim());
              return (
                <tr key={row.id} className={cn('border-t border-fd-border', isOrphan && 'bg-amber-500/10')}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      aria-label={`Fact row ${row.id} category`}
                      value={row.category}
                      onChange={(e) => updateRow(row.id, 'category', e.target.value)}
                      className={cn(
                        'w-32 min-w-0 rounded-md border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary',
                        isOrphan ? 'border-amber-500/40 text-amber-600 dark:text-amber-400' : 'border-fd-border',
                      )}
                    />
                    {isOrphan && <span className="ml-2 text-[10px] text-amber-600 dark:text-amber-400">no match in DimProduct</span>}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      aria-label={`Fact row ${row.id} amount`}
                      value={row.amount}
                      onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                      className="w-24 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-sm">{highlightCode('VALUES(DimProduct[Category])')}</div>
          <table className="mt-2 w-full text-xs">
            <tbody>
              {dimensionCategories.map((cat) => (
                <tr key={cat} className="border-t border-fd-border first:border-t-0">
                  <td className="py-1 font-mono">{cat}</td>
                  <td className="py-1 text-right font-mono">{totalByCategory.get(cat) ?? 0}</td>
                </tr>
              ))}
              {hasOrphan && (
                <tr className="border-t border-amber-500/40 bg-amber-500/10">
                  <td className="py-1 font-mono font-semibold text-amber-600 dark:text-amber-400">(Blank)</td>
                  <td className="py-1 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">
                    {orphanTotal}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            COUNTROWS(VALUES(...)) = <span className="font-mono font-semibold text-fd-primary">{valuesRowCount}</span>
          </p>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-sm">{highlightCode('DISTINCT(DimProduct[Category])')}</div>
          <table className="mt-2 w-full text-xs">
            <tbody>
              {dimensionCategories.map((cat) => (
                <tr key={cat} className="border-t border-fd-border first:border-t-0">
                  <td className="py-1 font-mono">{cat}</td>
                  <td className="py-1 text-right font-mono">{totalByCategory.get(cat) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            COUNTROWS(DISTINCT(...)) ={' '}
            <span className="font-mono font-semibold text-fd-primary">{distinctRowCount}</span>
          </p>
        </div>
      </div>

      {hasOrphan ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — a Gadgets fact row has no matching DimProduct category (a referential integrity gap).
          VALUES() adds an extra (Blank) row to account for it, worth {orphanTotal} on its own — DISTINCT()
          never adds that row, so those {orphanTotal} silently don&apos;t appear grouped under anything here.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — every fact row currently matches a real DimProduct category, so VALUES() and DISTINCT() return
          identical results. Change a fact row&apos;s category to something not in DimProduct to see them
          diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why VALUES() and DISTINCT() return a different row count here:\n\n```\n',
            `DimProduct[Category]: ${dimensionCategories.join(', ')}\nFactSales rows: ${validRows.map((r) => `${r.category}=${r.amount}`).join(', ')}`,
            `\n\`\`\`\nCOUNTROWS(VALUES(...)) = ${valuesRowCount}\nCOUNTROWS(DISTINCT(...)) = ${distinctRowCount}`,
          )}
        />
      </div>
    </div>
  );
}
