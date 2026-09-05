'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface FactRow {
  id: string;
  productId: string;
  promotion: 'Yes' | 'No';
}

const initialFactRows: FactRow[] = [
  { id: '1', productId: 'A', promotion: 'Yes' },
  { id: '2', productId: 'A', promotion: 'No' },
  { id: '3', productId: 'B', promotion: 'Yes' },
  { id: '4', productId: 'C', promotion: 'No' },
];

export function CrossFilterPlayground() {
  const [dimensionText, setDimensionText] = useState('A, B, C');
  const [factRows, setFactRows] = useState<FactRow[]>(initialFactRows);

  const updateRow = (id: string, field: 'productId' | 'promotion', value: string) => {
    setFactRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value as never } : r)));
  };

  const dimensionProducts = dimensionText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const promoProductIds = new Set(
    factRows.filter((r) => r.promotion === 'Yes' && r.productId.trim()).map((r) => r.productId.trim()),
  );

  const withoutCrossFilter = dimensionProducts.length;
  const withCrossFilter = dimensionProducts.filter((p) => promoProductIds.has(p)).length;

  const diverges = withoutCrossFilter !== withCrossFilter;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — DimProduct is on the &quot;one&quot; side, FactSales on the &quot;many&quot; side
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">DimProduct[ProductID]</span>
        <input
          type="text"
          aria-label="Dimension products"
          value={dimensionText}
          onChange={(e) => setDimensionText(e.target.value)}
          className="w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">FactSales[ProductID]</th>
              <th className="px-3 py-2 text-left">Promotion</th>
            </tr>
          </thead>
          <tbody>
            {factRows.map((row) => (
              <tr key={row.id} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`Fact row ${row.id} product`}
                    value={row.productId}
                    onChange={(e) => updateRow(row.id, 'productId', e.target.value)}
                    className="w-20 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    aria-label={`Fact row ${row.id} promotion`}
                    value={row.promotion}
                    onChange={(e) => updateRow(row.id, 'promotion', e.target.value)}
                    className="rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs">
            {highlightCode('CALCULATE(COUNTROWS(DimProduct), FactSales[Promotion] = "Yes")')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            no CROSSFILTER — the FactSales filter can&apos;t flow back to DimProduct
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">{withoutCrossFilter}</p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            diverges ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-xs">
            {highlightCode('CALCULATE(COUNTROWS(DimProduct), CROSSFILTER(FactSales[ProductID], DimProduct[ProductID], BOTH), FactSales[Promotion] = "Yes")')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">CROSSFILTER(..., BOTH) — now it can</p>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              diverges ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {withCrossFilter}
          </p>
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — a standard one-to-many relationship only filters DimProduct → FactSales by default, never
          the reverse. Without CROSSFILTER, the &quot;Promotion = Yes&quot; filter on FactSales has no
          way back to DimProduct, so COUNTROWS(DimProduct) still counts all {withoutCrossFilter} products.
          CROSSFILTER(..., BOTH) temporarily lets that filter flow backward too, narrowing DimProduct
          down to just the {withCrossFilter} product(s) that actually have a promo sale.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — every DimProduct row currently has at least one matching &quot;Yes&quot; promotion sale, so
          both versions happen to agree. Remove or change a fact row&apos;s promotion so that not every
          product has one, to see them diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why CROSSFILTER changes this result, in terms of relationship filter direction:\n\n```\n',
            `DimProduct[ProductID]: ${dimensionProducts.join(', ')}\nFactSales rows: ${factRows.map((r) => `${r.productId}=${r.promotion}`).join(', ')}\nCALCULATE(COUNTROWS(DimProduct), FactSales[Promotion] = "Yes") -> ${withoutCrossFilter}`,
            `\n\`\`\`\nCALCULATE(COUNTROWS(DimProduct), CROSSFILTER(FactSales[ProductID], DimProduct[ProductID], BOTH), FactSales[Promotion] = "Yes") -> ${withCrossFilter}`,
          )}
        />
      </div>
    </div>
  );
}
