'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface PriceRow {
  id: string;
  productKey: string;
  price: string;
}

const initialRows: PriceRow[] = [
  { id: '1', productKey: '101', price: '25' },
  { id: '2', productKey: '102', price: '40' },
  { id: '3', productKey: '102', price: '40' },
  { id: '4', productKey: '103', price: '15' },
  { id: '5', productKey: '103', price: '99' },
];

type Result = { kind: 'blank' } | { kind: 'value'; value: string } | { kind: 'error' };

function computeLookup(rows: PriceRow[], searchKey: string): Result {
  const matches = rows.filter((r) => r.productKey.trim() === searchKey.trim());
  if (matches.length === 0) return { kind: 'blank' };
  const distinctValues = new Set(matches.map((r) => r.price.trim()));
  if (distinctValues.size > 1) return { kind: 'error' };
  return { kind: 'value', value: matches[0].price };
}

export function LookupValuePlayground() {
  const [rows, setRows] = useState<PriceRow[]>(initialRows);
  const [searchKey, setSearchKey] = useState('103');

  const updateRow = (id: string, field: 'productKey' | 'price', value: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const result = computeLookup(rows, searchKey);
  const matchCount = rows.filter((r) => r.productKey.trim() === searchKey.trim()).length;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit PriceList or the search key to hit every case
      </p>

      <p className="mb-2 text-xs font-semibold text-fd-muted-foreground">PriceList (lookup target)</p>
      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">ProductKey</th>
              <th className="px-3 py-2 text-left">Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`Row ${row.id} product key`}
                    value={row.productKey}
                    onChange={(e) => updateRow(row.id, 'productKey', e.target.value)}
                    className="w-20 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
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

      <div className="mt-4 flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">FactSales[ProductKey] being looked up</span>
        <input
          type="text"
          aria-label="Search key"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          className="w-fit rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </div>

      <div className="mt-4">
        <div className="font-mono text-sm break-words">
          {highlightCode(`LOOKUPVALUE(PriceList[Price], PriceList[ProductKey], "${searchKey}")`)}
        </div>
      </div>

      <div
        className={cn(
          'mt-3 rounded-lg border p-3',
          result.kind === 'error'
            ? 'border-red-500/40 bg-red-500/10'
            : result.kind === 'blank'
              ? 'border-fd-border bg-fd-background'
              : matchCount > 1
                ? 'border-amber-500/40 bg-amber-500/10'
                : 'border-fd-border bg-fd-background',
        )}
      >
        <p className="text-xs text-fd-muted-foreground">
          {matchCount} matching row{matchCount === 1 ? '' : 's'} for ProductKey &quot;{searchKey}&quot;
        </p>
        <p
          className={cn(
            'mt-1 font-mono text-lg font-semibold',
            result.kind === 'error'
              ? 'text-red-600 dark:text-red-400'
              : result.kind === 'blank'
                ? 'text-fd-muted-foreground'
                : matchCount > 1
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-fd-primary',
          )}
        >
          {result.kind === 'blank' && 'BLANK()'}
          {result.kind === 'value' && result.value}
          {result.kind === 'error' && 'ERROR — a table of multiple values was supplied'}
        </p>
      </div>

      {result.kind === 'error' ? (
        <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">
          — {matchCount} rows match ProductKey &quot;{searchKey}&quot;, with different prices. LOOKUPVALUE()
          doesn&apos;t pick one arbitrarily — it errors, because the search column doesn&apos;t actually
          identify a unique row the way a lookup target needs it to.
        </p>
      ) : result.kind === 'value' && matchCount > 1 ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — {matchCount} rows match ProductKey &quot;{searchKey}&quot;, but they all happen to have the same
          price, so LOOKUPVALUE() returns it without erroring. Change one of those rows&apos; prices to see
          it break.
        </p>
      ) : result.kind === 'blank' ? (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — no row in PriceList has ProductKey &quot;{searchKey}&quot;, so LOOKUPVALUE() returns BLANK()
          (unless a default value argument is supplied).
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — exactly one row matches, so LOOKUPVALUE() returns its price directly.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain what LOOKUPVALUE returns here and why:\n\n```\n',
            `PriceList rows: ${rows.map((r) => `ProductKey=${r.productKey}/Price=${r.price}`).join(', ')}\nSearch key: "${searchKey}" (${matchCount} matching row(s))`,
            `\n\`\`\`\nLOOKUPVALUE(PriceList[Price], PriceList[ProductKey], "${searchKey}") -> ${
              result.kind === 'blank' ? 'BLANK()' : result.kind === 'error' ? 'ERROR' : result.value
            }`,
          )}
        />
      </div>
    </div>
  );
}
