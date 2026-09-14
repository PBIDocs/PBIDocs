'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const MONTHS = ['January', 'February', 'March'] as const;
type Month = (typeof MONTHS)[number];

interface FactRow {
  id: string;
  orderDate: Month;
  shipDate: Month;
  amount: number;
}

const FACT_ROWS: FactRow[] = [
  { id: '1', orderDate: 'January', shipDate: 'January', amount: 500 },
  { id: '2', orderDate: 'January', shipDate: 'February', amount: 300 },
  { id: '3', orderDate: 'February', shipDate: 'February', amount: 200 },
  { id: '4', orderDate: 'February', shipDate: 'March', amount: 400 },
];

export function UserRelationshipPlayground() {
  const [filterMonth, setFilterMonth] = useState<Month>('March');

  const totalSales = FACT_ROWS.filter((r) => r.orderDate === filterMonth).reduce((s, r) => s + r.amount, 0);
  const salesByShipDate = FACT_ROWS.filter((r) => r.shipDate === filterMonth).reduce((s, r) => s + r.amount, 0);

  const diverges = totalSales !== salesByShipDate;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — pick the month the date slicer is filtered to
      </p>

      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">OrderDate (active)</th>
              <th className="px-3 py-2 text-left">ShipDate (inactive)</th>
              <th className="px-3 py-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {FACT_ROWS.map((row) => (
              <tr key={row.id} className="border-t border-fd-border">
                <td className="px-3 py-2">{row.orderDate}</td>
                <td className="px-3 py-2">{row.shipDate}</td>
                <td className="px-3 py-2">{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">DimDate slicer selection</span>
        <select
          aria-label="Filter month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value as Month)}
          className="w-fit rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">{highlightCode('Total Sales = CALCULATE(SUM(FactSales[Amount]))')}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">filters by OrderDate — the active relationship</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">{totalSales}</p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            diverges ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-xs break-words">
            {highlightCode('Sales by Ship Date = CALCULATE(SUM(FactSales[Amount]), USERELATIONSHIP(FactSales[ShipDateKey], DimDate[DateKey]))')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">activates ShipDate for just this measure</p>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              diverges ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {salesByShipDate}
          </p>
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — with the slicer on {filterMonth}, {totalSales} was ordered that month, but {salesByShipDate} actually
          shipped that month — some of it ordered in a different month entirely. Same fact table, same slicer
          selection, two genuinely different numbers, because each measure filters through a different
          relationship.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — every order placed in {filterMonth} also happened to ship in {filterMonth}, so both measures agree.
          Pick a different month to see them diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why these two measures return different totals for the same slicer selection, in terms of active vs inactive relationships:\n\n```\n',
            `Slicer: DimDate = ${filterMonth}\nFactSales rows: ${FACT_ROWS.map((r) => `Order=${r.orderDate}/Ship=${r.shipDate}/Amount=${r.amount}`).join(', ')}\nTotal Sales (via OrderDate, active) -> ${totalSales}`,
            `\n\`\`\`\nSales by Ship Date (via USERELATIONSHIP on ShipDate) -> ${salesByShipDate}`,
          )}
        />
      </div>
    </div>
  );
}
