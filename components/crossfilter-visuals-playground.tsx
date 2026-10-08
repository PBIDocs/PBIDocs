'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const CATEGORIES = ['Bikes', 'Accessories', 'Clothing'] as const;
type Category = (typeof CATEGORIES)[number];

const SALES: Record<Category, number> = {
  Bikes: 150000,
  Accessories: 80000,
  Clothing: 40000,
};

const MAX_SALES = Math.max(...Object.values(SALES));
const GRAND_TOTAL = Object.values(SALES).reduce((a, b) => a + b, 0);

export function CrossFilterVisualsPlayground() {
  const [selected, setSelected] = useState<Category | null>(null);

  const total = selected === null ? GRAND_TOTAL : SALES[selected];

  function clickBar(c: Category) {
    setSelected((prev) => (prev === c ? null : c));
  }

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — click a bar, then click it again to clear the selection
      </p>

      <p className="mb-2 text-xs text-fd-muted-foreground">Bar Chart — Sales by Category</p>
      <div className="flex items-end gap-4 rounded-lg border border-fd-border bg-fd-background p-4" style={{ height: '180px' }}>
        {CATEGORIES.map((c) => {
          const isSelected = selected === c;
          const isDimmed = selected !== null && !isSelected;
          return (
            <button
              key={c}
              type="button"
              aria-label={`Select ${c} bar`}
              aria-pressed={isSelected}
              onClick={() => clickBar(c)}
              className="flex flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="font-mono text-[10px] text-fd-muted-foreground">${SALES[c].toLocaleString()}</span>
              <div
                className={cn(
                  'w-full rounded-t-sm transition-opacity',
                  isSelected ? 'bg-fd-primary' : 'bg-fd-primary/60',
                  isDimmed && 'opacity-30',
                )}
                style={{ height: `${(SALES[c] / MAX_SALES) * 90}px` }}
              />
              <span className="font-mono text-xs">{c}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">Table visual</p>
          <table className="mt-2 w-full text-xs">
            <tbody className="font-mono">
              <tr className="border-t border-fd-border/50">
                <td className="py-1">Category</td>
                <td className="py-1 text-fd-primary">{selected ?? 'All Categories'}</td>
              </tr>
              <tr className="border-t border-fd-border/50">
                <td className="py-1">Total Sales</td>
                <td className="py-1 font-semibold text-fd-primary">${total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">KPI card — Total Sales</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-fd-primary">${total.toLocaleString()}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        — all three visuals use the exact same measure, <span className="font-mono">SUM(FactSales[SalesAmount])</span>.
        Clicking a bar doesn&apos;t change the formula at all; it creates a filter context (
        <span className="font-mono">Category = {selected ?? '(none)'}</span>) that Power BI automatically propagates
        to every other visual on the page. Clicking the same bar again clears that selection and returns every
        visual to the grand total.
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why clicking a bar in one visual changes the result shown in two completely separate visuals here, without changing any DAX:\n\n```\n',
            `Selected category: ${selected ?? 'none (grand total)'}`,
            `\n\`\`\`\nTable and KPI card both show Total Sales: $${total.toLocaleString()}`,
          )}
        />
      </div>
    </div>
  );
}
