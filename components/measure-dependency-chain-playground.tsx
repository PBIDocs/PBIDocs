'use client';

import { useState } from 'react';
import { FlaskConical, ArrowDown } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

export function MeasureDependencyChainPlayground() {
  const [salesText, setSalesText] = useState('500000');
  const [costText, setCostText] = useState('350000');

  const sales = Number.parseFloat(salesText) || 0;
  const cost = Number.parseFloat(costText) || 0;
  const profit = sales - cost;
  const margin = sales === 0 ? null : profit / sales;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit Total Sales or Total Cost and watch it ripple through every measure built on top
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">{highlightCode('Total Sales = SUM(FactSales[SalesAmount])')}</div>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Total Sales"
            value={salesText}
            onChange={(e) => setSalesText(e.target.value)}
            className="mt-2 w-full rounded-md border border-fd-border bg-fd-secondary/30 px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">{highlightCode('Total Cost = SUM(FactSales[Cost])')}</div>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Total Cost"
            value={costText}
            onChange={(e) => setCostText(e.target.value)}
            className="mt-2 w-full rounded-md border border-fd-border bg-fd-secondary/30 px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </div>
      </div>

      <div className="mt-3 flex justify-center text-fd-muted-foreground">
        <ArrowDown className="size-4" />
      </div>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3">
        <div className="font-mono text-xs break-words">{highlightCode('Gross Profit = [Total Sales] - [Total Cost]')}</div>
        <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">${profit.toLocaleString()}</p>
      </div>

      <div className="mt-3 flex justify-center text-fd-muted-foreground">
        <ArrowDown className="size-4" />
      </div>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3">
        <div className="font-mono text-xs break-words">
          {highlightCode('Profit Margin = DIVIDE([Gross Profit], [Total Sales])')}
        </div>
        <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">
          {margin === null ? '(blank)' : `${(margin * 100).toFixed(1)}%`}
        </p>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        — <span className="font-mono">Gross Profit</span> and <span className="font-mono">Profit Margin</span>{' '}
        never reference <span className="font-mono">FactSales</span> directly; they reference{' '}
        <span className="font-mono">[Total Sales]</span> and <span className="font-mono">[Total Cost]</span> by
        name. Edit either base measure above and both layers built on top of it recalculate immediately — change the
        logic once, at the base, and every measure built on it stays correct automatically.
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why editing Total Sales or Total Cost automatically updates Gross Profit and Profit Margin here, without changing their formulas:\n\n```\n',
            `Total Sales: ${sales}, Total Cost: ${cost}`,
            `\n\`\`\`\nGross Profit: ${profit}\nProfit Margin: ${margin === null ? '(blank)' : (margin * 100).toFixed(1) + '%'}`,
          )}
        />
      </div>
    </div>
  );
}
