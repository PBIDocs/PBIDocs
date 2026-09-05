'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

const CATEGORIES = ['Electronics', 'Furniture', 'Apparel'] as const;
type Category = (typeof CATEGORIES)[number];

const SALES: Record<Category, number> = {
  Electronics: 500,
  Furniture: 300,
  Apparel: 200,
};

export function KeepFiltersPlayground() {
  const [outerFilter, setOuterFilter] = useState<Category>('Electronics');
  const [innerFilter, setInnerFilter] = useState<Category>('Furniture');

  // Without KEEPFILTERS: CALCULATE's own condition on Category REPLACES the
  // outer visual filter entirely -- the result depends only on innerFilter.
  const withoutKeepFilters = SALES[innerFilter];

  // With KEEPFILTERS: the condition is ANDed with the existing outer filter
  // instead of replacing it. Since a row's Category can only match one value,
  // the two conditions can only both be true when outer and inner agree.
  const withKeepFilters = outerFilter === innerFilter ? SALES[innerFilter] : 0;

  const diverges = withoutKeepFilters !== withKeepFilters;

  const formulaWithout = `CALCULATE(SUM(Sales[Amount]), Sales[Category] = "${innerFilter}")`;
  const formulaWith = `CALCULATE(SUM(Sales[Amount]), KEEPFILTERS(Sales[Category] = "${innerFilter}"))`;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="Current visual filter (Category)">
          <select
            aria-label="Outer visual filter category"
            value={outerFilter}
            onChange={(e) => setOuterFilter(e.target.value as Category)}
            className="rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </PlaygroundRow>
        <PlaygroundRow label="CALCULATE's own condition">
          <select
            aria-label="Inner CALCULATE filter category"
            value={innerFilter}
            onChange={(e) => setInnerFilter(e.target.value as Category)}
            className="rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </PlaygroundRow>
      </PlaygroundTable>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        Sales by category: Electronics {SALES.Electronics}, Furniture {SALES.Furniture}, Apparel{' '}
        {SALES.Apparel} — the visual is currently filtered to <strong>{outerFilter}</strong> only.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-sm">{highlightCode(formulaWithout)}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">no KEEPFILTERS — replaces the outer filter</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">{withoutKeepFilters}</p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            diverges ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-sm">{highlightCode(formulaWith)}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">KEEPFILTERS — ANDs with the outer filter</p>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              diverges ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {withKeepFilters}
          </p>
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — the visual is filtered to {outerFilter}, but this measure asks for {innerFilter}.
          Without KEEPFILTERS, {innerFilter} replaces {outerFilter} entirely, returning{' '}
          {innerFilter}&apos;s own total. With KEEPFILTERS, a row would need to be both{' '}
          {outerFilter} and {innerFilter} at once — impossible for a single-valued column — so the
          result is 0.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — the outer filter and CALCULATE&apos;s own condition already agree ({outerFilter}), so
          both versions return the same total. Change the two dropdowns to different categories to
          see them diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why CALCULATE with and without KEEPFILTERS return different results here:\n\n```\n',
            `Visual filtered to: Category = ${outerFilter}\n${formulaWithout} -> ${withoutKeepFilters}`,
            `\n\`\`\`\n${formulaWith} -> ${withKeepFilters}`,
          )}
        />
      </div>
    </div>
  );
}
