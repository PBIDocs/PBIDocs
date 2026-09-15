'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface Row {
  id: string;
  promoCode: string;
}

const initialRows: Row[] = [
  { id: '1', promoCode: 'SAVE10' },
  { id: '2', promoCode: 'SAVE10' },
  { id: '3', promoCode: '' },
  { id: '4', promoCode: 'WELCOME' },
];

export function DistinctCountBlankPlayground() {
  const [rows, setRows] = useState<Row[]>(initialRows);

  const updateRow = (id: string, value: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, promoCode: value } : r)));
  };

  const hasBlank = rows.some((r) => r.promoCode.trim() === '');
  const distinctValues = new Set(rows.map((r) => r.promoCode.trim()));
  const distinctCount = distinctValues.size;
  const distinctCountNoBlank = new Set(rows.map((r) => r.promoCode.trim()).filter((v) => v !== '')).size;

  const diverges = distinctCount !== distinctCountNoBlank;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — clear or fill in a cell to add or remove a blank
      </p>

      <p className="mb-2 text-xs font-semibold text-fd-muted-foreground">FactSales[PromoCode]</p>
      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-fd-border first:border-t-0">
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    aria-label={`Row ${row.id} promo code`}
                    value={row.promoCode}
                    placeholder="(blank)"
                    onChange={(e) => updateRow(row.id, e.target.value)}
                    className="w-40 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          className={cn(
            'rounded-lg border p-3',
            diverges ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-sm break-words">{highlightCode('DISTINCTCOUNT(FactSales[PromoCode])')}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">counts blank as one distinct value</p>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              diverges ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {distinctCount}
          </p>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-sm break-words">
            {highlightCode('DISTINCTCOUNTNOBLANK(FactSales[PromoCode])')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">excludes blank entirely</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">{distinctCountNoBlank}</p>
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — at least one row has no promo code at all. {hasBlank ? 'DISTINCTCOUNT() counts that blank as its own distinct value, one higher than the real number of promo codes actually used.' : ''}{' '}
          If the question is &quot;how many distinct promo codes were used,&quot; DISTINCTCOUNTNOBLANK()&apos;s{' '}
          {distinctCountNoBlank} is the honest answer — DISTINCTCOUNT()&apos;s {distinctCount} overstates it by
          counting &quot;no code&quot; as if it were one.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — no blank rows right now, so both functions agree ({distinctCount} either way). Clear a cell above to
          see them diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why DISTINCTCOUNT and DISTINCTCOUNTNOBLANK return different numbers here:\n\n```\n',
            `FactSales[PromoCode]: ${rows.map((r) => (r.promoCode.trim() === '' ? '(blank)' : r.promoCode)).join(', ')}`,
            `\n\`\`\`\nDISTINCTCOUNT(FactSales[PromoCode]) -> ${distinctCount}\nDISTINCTCOUNTNOBLANK(FactSales[PromoCode]) -> ${distinctCountNoBlank}`,
          )}
        />
      </div>
    </div>
  );
}
