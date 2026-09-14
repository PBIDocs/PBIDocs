'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const CUSTOMERS = ['1', '2', '3'] as const;
type Customer = (typeof CUSTOMERS)[number];

const FACT_SALES: { customerKey: Customer; orderId: string }[] = [
  { customerKey: '1', orderId: '5001' },
  { customerKey: '1', orderId: '5002' },
  { customerKey: '1', orderId: '5003' },
  { customerKey: '2', orderId: '5004' },
];

export function RelatedTablePlayground() {
  const [customer, setCustomer] = useState<Customer>('1');
  const [relationshipActive, setRelationshipActive] = useState(true);

  const matchingOrders = FACT_SALES.filter((r) => r.customerKey === customer);
  const orderCount = relationshipActive ? matchingOrders.length : null;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — pick a customer, then break the relationship
      </p>

      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">FactSales[CustomerKey]</th>
              <th className="px-3 py-2 text-left">OrderID</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {FACT_SALES.map((row) => (
              <tr
                key={row.orderId}
                className={cn('border-t border-fd-border', row.customerKey === customer && relationshipActive && 'bg-fd-primary/5')}
              >
                <td className="px-3 py-2">{row.customerKey}</td>
                <td className="px-3 py-2">{row.orderId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-fd-muted-foreground">Viewing DimCustomer row</span>
          <select
            aria-label="Customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value as Customer)}
            className="w-fit rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          >
            {CUSTOMERS.map((c) => (
              <option key={c} value={c}>
                CustomerKey {c}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={relationshipActive}
            onChange={(e) => setRelationshipActive(e.target.checked)}
            className="size-4 accent-fd-primary"
          />
          <span className="text-fd-muted-foreground">Relationship active</span>
        </label>
      </div>

      <div className="mt-4">
        <div className="font-mono text-sm break-words">
          {highlightCode('Order Count = COUNTROWS(RELATEDTABLE(FactSales))')}
        </div>
      </div>

      <div
        className={cn(
          'mt-3 rounded-lg border p-3',
          relationshipActive ? 'border-fd-border bg-fd-background' : 'border-amber-500/40 bg-amber-500/10',
        )}
      >
        <p className="text-xs text-fd-muted-foreground">
          Evaluated for CustomerKey {customer}, {matchingOrders.length} matching row
          {matchingOrders.length === 1 ? '' : 's'} in FactSales
        </p>
        <p
          className={cn(
            'mt-1 font-mono text-lg font-semibold',
            relationshipActive ? 'text-fd-primary' : 'text-amber-600 dark:text-amber-400',
          )}
        >
          {orderCount === null ? 'BLANK()' : orderCount}
        </p>
      </div>

      {!relationshipActive ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — CustomerKey {customer} genuinely has {matchingOrders.length} order{matchingOrders.length === 1 ? '' : 's'}{' '}
          in FactSales, but with the relationship inactive, RELATEDTABLE() has no path to cross — it doesn&apos;t
          error, it just quietly returns an empty table, so COUNTROWS() returns BLANK(). No warning, no error, just
          a number that looks like &quot;zero orders&quot; when the real answer is {matchingOrders.length}.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — with the relationship active, RELATEDTABLE() correctly finds every FactSales row for CustomerKey{' '}
          {customer}. Turn off the relationship above to see what happens instead.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why COUNTROWS(RELATEDTABLE(FactSales)) returns BLANK() instead of the real order count once the relationship is inactive:\n\n```\n',
            `CustomerKey ${customer} has ${matchingOrders.length} matching row(s) in FactSales\nRelationship active: ${relationshipActive}`,
            `\n\`\`\`\nCOUNTROWS(RELATEDTABLE(FactSales)) -> ${orderCount === null ? 'BLANK()' : orderCount}`,
          )}
        />
      </div>
    </div>
  );
}
