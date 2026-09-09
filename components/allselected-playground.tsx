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

const REGIONS = ['East', 'West'] as const;
type Region = (typeof REGIONS)[number];

const SLICER_OPTIONS = ['All Regions', ...REGIONS] as const;
type SlicerOption = (typeof SLICER_OPTIONS)[number];

// FactSales[Amount] by Region and Category.
const SALES: Record<Region, Record<Category, number>> = {
  East: { Electronics: 500, Furniture: 200, Apparel: 100 },
  West: { Electronics: 300, Furniture: 400, Apparel: 600 },
};

const GRAND_TOTAL = REGIONS.reduce(
  (sum, r) => sum + CATEGORIES.reduce((s, c) => s + SALES[r][c], 0),
  0,
);

function regionTotal(region: SlicerOption): number {
  if (region === 'All Regions') return GRAND_TOTAL;
  return CATEGORIES.reduce((s, c) => s + SALES[region][c], 0);
}

export function AllSelectedPlayground() {
  const [slicer, setSlicer] = useState<SlicerOption>('East');
  const [categoryRow, setCategoryRow] = useState<Category>('Electronics');

  // Plain CALCULATE(SUM(...)) respects every filter in effect: the current
  // row's category (visual-level) AND the slicer's region (user selection).
  const plainSum =
    slicer === 'All Regions'
      ? REGIONS.reduce((s, r) => s + SALES[r][categoryRow], 0)
      : SALES[slicer][categoryRow];

  // ALL(FactSales) removes every filter on the table, full stop -- both the
  // row's category AND the slicer's region selection. Always the same
  // number, no matter what the user has selected anywhere.
  const allTotal = GRAND_TOTAL;

  // ALLSELECTED(FactSales) removes only the filter that came from inside the
  // visual (the row's own category) -- it keeps whatever the user actually
  // selected outside the visual (the region slicer).
  const allSelectedTotal = regionTotal(slicer);

  const pctOfSelected = allSelectedTotal > 0 ? (plainSum / allSelectedTotal) * 100 : 0;
  const pctOfGrand = allTotal > 0 ? (plainSum / allTotal) * 100 : 0;

  const diverges = allTotal !== allSelectedTotal;

  const formulaPlain = 'CALCULATE(SUM(FactSales[Amount]))';
  const formulaAll = 'CALCULATE(SUM(FactSales[Amount]), ALL(FactSales))';
  const formulaAllSelected = 'CALCULATE(SUM(FactSales[Amount]), ALLSELECTED(FactSales))';

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="Region slicer (user selection)">
          <select
            aria-label="Region slicer"
            value={slicer}
            onChange={(e) => setSlicer(e.target.value as SlicerOption)}
            className="rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          >
            {SLICER_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </PlaygroundRow>
        <PlaygroundRow label="Category (current visual row)">
          <select
            aria-label="Category row"
            value={categoryRow}
            onChange={(e) => setCategoryRow(e.target.value as Category)}
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
        Imagine a matrix visual with one row per category, filtered down to the{' '}
        <strong>{slicer}</strong> slicer selection — you&apos;re looking at the <strong>{categoryRow}</strong>{' '}
        row specifically.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">{highlightCode(formulaPlain)}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">respects the row AND the slicer</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">{plainSum}</p>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">{highlightCode(formulaAll)}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">ignores the row AND the slicer</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">{allTotal}</p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            diverges ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-xs break-words">{highlightCode(formulaAllSelected)}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">ignores the row, keeps the slicer</p>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              diverges ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {allSelectedTotal}
          </p>
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — with the slicer set to {slicer}, ALL(FactSales) ignores that selection entirely and always
          returns the full {allTotal} across every region and category. ALLSELECTED(FactSales) only
          removes the {categoryRow} row&apos;s own filter — it still respects the {slicer} slicer, so
          it returns {allSelectedTotal} on every row, not just this one. That makes{' '}
          <span className="font-mono">{formulaPlain} / {formulaAllSelected}</span> a true
          &quot;% of selected total&quot; ({pctOfSelected.toFixed(1)}%), while dividing by ALL&apos;s{' '}
          {allTotal} would give {pctOfGrand.toFixed(1)}% — a number that won&apos;t sum to 100% across
          the visual&apos;s rows once a slicer is applied.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — with the slicer set to All Regions, there&apos;s no user selection to preserve, so
          ALLSELECTED and ALL agree ({allTotal} either way). Pick East or West above to see them
          diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why CALCULATE with ALL vs ALLSELECTED return different results here, in terms of visual-level filters vs user selections:\n\n```\n',
            `Region slicer selected: ${slicer}\nCurrent visual row: Category = ${categoryRow}\n${formulaPlain} -> ${plainSum}\n${formulaAll} -> ${allTotal}`,
            `\n\`\`\`\n${formulaAllSelected} -> ${allSelectedTotal}`,
          )}
        />
      </div>
    </div>
  );
}
