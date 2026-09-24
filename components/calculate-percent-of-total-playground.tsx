'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const CATEGORIES = ['Bikes', 'Accessories', 'Clothing'] as const;
type Category = (typeof CATEGORIES)[number];

function formatPercent(value: number | null): string {
  if (value === null) return '(blank)';
  return `${(value * 100).toFixed(0)}%`;
}

export function CalculatePercentOfTotalPlayground() {
  const [sales, setSales] = useState<Record<Category, string>>({
    Bikes: '150000',
    Accessories: '80000',
    Clothing: '270000',
  });
  const [selected, setSelected] = useState<Category>('Bikes');

  const parsed: Record<Category, number> = {
    Bikes: Number.parseFloat(sales.Bikes) || 0,
    Accessories: Number.parseFloat(sales.Accessories) || 0,
    Clothing: Number.parseFloat(sales.Clothing) || 0,
  };

  const categorySales = parsed[selected];
  const grandTotal = parsed.Bikes + parsed.Accessories + parsed.Clothing;

  const correctPercent = grandTotal === 0 ? null : categorySales / grandTotal;
  const mistakePercent = categorySales === 0 ? null : categorySales / categorySales;

  const diverges = correctPercent !== mistakePercent;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit sales by category and pick which one is filtered
      </p>

      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Sales</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((c) => (
              <tr key={c} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="selected-category"
                      aria-label={`Filter to ${c}`}
                      checked={selected === c}
                      onChange={() => setSelected(c)}
                    />
                    {c}
                  </label>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label={`${c} sales`}
                    value={sales[c]}
                    onChange={(e) => setSales((prev) => ({ ...prev, [c]: e.target.value }))}
                    className="w-28 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-sm outline-none focus:border-fd-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        The visual is currently filtered to <strong>{selected}</strong> ({categorySales}). Grand total across all
        categories: {grandTotal}.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">
            {highlightCode('DIVIDE([Total Sales], CALCULATE([Total Sales], ALL(DimProduct)))')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">correct — ALL() removes the category filter</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">{formatPercent(correctPercent)}</p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            diverges ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-xs break-words">{highlightCode('DIVIDE([Total Sales], [Total Sales])')}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">mistake — no ALL(), denominator never changes</p>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              diverges ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {formatPercent(mistakePercent)}
          </p>
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — without <span className="font-mono">ALL(DimProduct)</span>, the denominator sits inside{' '}
          <span className="font-mono">CALCULATE()</span> with no filter argument at all, so it just re-evaluates{' '}
          <span className="font-mono">[Total Sales]</span> in the exact same filter context as the numerator —
          the category filter is never removed. The numerator and denominator end up identical, so the
          &quot;percent of total&quot; comes out 100% for every single category, no matter what the values are.
          This throws no error — it just quietly produces a useless measure.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — with only one category holding all the sales, both versions happen to agree. Add sales to another
          category to see the mistake stay stuck at 100% while the correct version changes.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why the version without ALL() always returns 100% here, no matter the filter or values:\n\n```\n',
            `Filtered to: ${selected} (${categorySales})\nSales: Bikes=${parsed.Bikes}, Accessories=${parsed.Accessories}, Clothing=${parsed.Clothing}\nCorrect % of total: ${formatPercent(correctPercent)}`,
            `\n\`\`\`\nMistake % (no ALL()): ${formatPercent(mistakePercent)}`,
          )}
        />
      </div>
    </div>
  );
}
