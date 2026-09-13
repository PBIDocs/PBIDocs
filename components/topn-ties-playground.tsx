'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const PRODUCT_NAMES = ['Tire A', 'Tire B', 'Helmet A', 'Lock A', 'Pump A', 'Grip Tape', 'Bottle Cage', 'Chain Oil'];

function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

interface Row {
  name: string;
  value: number;
}

export function TopNTiesPlayground() {
  const [valuesText, setValuesText] = useState('50000, 42000, 18000, 18000, 12000, 9500');
  const [n, setN] = useState(3);

  const parsedValues = valuesText
    .split(',')
    .map((s) => Number.parseFloat(s.trim()))
    .filter((v) => !Number.isNaN(v));

  const rows: Row[] = parsedValues
    .map((value, i) => ({ name: PRODUCT_NAMES[i] ?? `Product ${i + 1}`, value }))
    .sort((a, b) => b.value - a.value);

  const clampedN = Math.max(1, Math.min(n, rows.length || 1));
  const cutoffValue = rows[clampedN - 1]?.value;
  const returnedRows = cutoffValue === undefined ? [] : rows.filter((r) => r.value >= cutoffValue);

  const diverges = returnedRows.length > clampedN;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit the values or N to create or remove a tie at the cutoff
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="text-fd-muted-foreground">[Total Sales] by product</span>
          <input
            type="text"
            aria-label="Sales values"
            value={valuesText}
            onChange={(e) => setValuesText(e.target.value)}
            className="w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </div>
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-fd-muted-foreground">N</span>
          <input
            type="number"
            min={1}
            aria-label="N value"
            value={n}
            onChange={(e) => setN(Number.parseInt(e.target.value, 10) || 1)}
            className="w-20 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="font-mono text-sm break-words">
          {highlightCode(`TOPN(${clampedN}, ALL(DimProduct), [Total Sales])`)}
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Total Sales</th>
              <th className="px-3 py-2 text-left">Returned?</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((row, i) => {
              const returned = returnedRows.includes(row);
              const isExtra = returned && i >= clampedN;
              return (
                <tr
                  key={`${row.name}-${i}`}
                  className={cn('border-t border-fd-border', isExtra && 'bg-amber-500/10')}
                >
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.value}</td>
                  <td
                    className={cn(
                      'px-3 py-2',
                      returned
                        ? isExtra
                          ? 'font-semibold text-amber-600 dark:text-amber-400'
                          : 'text-fd-primary'
                        : 'text-fd-muted-foreground/50',
                    )}
                  >
                    {returned ? (isExtra ? 'yes — tied' : 'yes') : 'no'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        Requested top {clampedN}, got back {returnedRows.length} row{returnedRows.length === 1 ? '' : 's'}.
      </p>

      {diverges ? (
        <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
          — {returnedRows.length - clampedN} extra row{returnedRows.length - clampedN === 1 ? '' : 's'} tied for the
          last spot at exactly {cutoffValue}. TOPN doesn&apos;t arbitrarily cut one out to force exactly {clampedN}{' '}
          rows — every row tied at the cutoff value comes back. Code consuming this result can&apos;t assume an
          exact row count.
        </p>
      ) : (
        <p className="mt-2 text-xs text-fd-muted-foreground">
          — no tie at the cutoff, so exactly {clampedN} row{clampedN === 1 ? '' : 's'} came back. Change a value to
          match the {clampedN === 1 ? 'top' : ordinal(clampedN)}-place value to see an extra row appear.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why TOPN returned more rows than requested here:\n\n```\n',
            `Values: ${rows.map((r) => `${r.name}=${r.value}`).join(', ')}\nRequested N: ${clampedN}`,
            `\n\`\`\`\nTOPN(${clampedN}, ...) returned ${returnedRows.length} row(s): ${returnedRows.map((r) => r.name).join(', ')}`,
          )}
        />
      </div>
    </div>
  );
}
