'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const CATEGORIES = ['Bikes', 'Accessories', 'Clothing'] as const;
type Category = (typeof CATEGORIES)[number];

interface Row {
  category: Category;
  amount: string;
}

const INITIAL_ROWS: Row[] = [
  { category: 'Bikes', amount: '70000' },
  { category: 'Bikes', amount: '50000' },
  { category: 'Accessories', amount: '25000' },
  { category: 'Accessories', amount: '20000' },
  { category: 'Clothing', amount: '18000' },
];

export function SummarizeGroupingPlayground() {
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  const grouped = CATEGORIES.map((cat) => {
    const total = rows
      .filter((r) => r.category === cat)
      .reduce((sum, r) => sum + (Number.parseFloat(r.amount) || 0), 0);
    return { category: cat, total, count: rows.filter((r) => r.category === cat).length };
  }).filter((g) => g.count > 0);

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit a row's category or amount and watch the grouped table recompute
      </p>

      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">FactSales row</th>
              <th className="px-3 py-2 text-left">DimProduct[Category]</th>
              <th className="px-3 py-2 text-left">SalesAmount</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-fd-border">
                <td className="px-3 py-2 text-fd-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2">
                  <select
                    aria-label={`Row ${i + 1} category`}
                    value={r.category}
                    onChange={(e) => updateRow(i, { category: e.target.value as Category })}
                    className="rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-sm outline-none focus:border-fd-primary"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label={`Row ${i + 1} amount`}
                    value={r.amount}
                    onChange={(e) => updateRow(i, { amount: e.target.value })}
                    className="w-24 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-sm outline-none focus:border-fd-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <div className="font-mono text-xs break-words">
          {highlightCode(
            'SUMMARIZE(FactSales, DimProduct[Category], "Total Sales", SUM(FactSales[SalesAmount]))',
          )}
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Total Sales</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {grouped.map((g) => (
              <tr key={g.category} className="border-t border-fd-border">
                <td className="px-3 py-2">{g.category}</td>
                <td className="px-3 py-2 font-semibold text-fd-primary">{g.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        — the grouped table has exactly one row per distinct category currently present above, each with its
        values summed. Change a row&apos;s category and watch it move from one group&apos;s total into another;
        change its amount and watch only that one category&apos;s total shift.
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain how SUMMARIZE() produces this grouped result from the raw rows:\n\n```\n',
            `Raw rows: ${rows.map((r) => `${r.category}=${r.amount}`).join(', ')}`,
            `\n\`\`\`\nGrouped result: ${grouped.map((g) => `${g.category}=${g.total}`).join(', ')}`,
          )}
        />
      </div>
    </div>
  );
}
