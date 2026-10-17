'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const MONTHS = ['January', 'February', 'March', 'April'] as const;

export function RunningTotalPlayground() {
  const [sales, setSales] = useState<Record<(typeof MONTHS)[number], string>>({
    January: '50000',
    February: '60000',
    March: '45000',
    April: '70000',
  });

  const parsed = MONTHS.map((m) => Number.parseFloat(sales[m]) || 0);
  const running = parsed.reduce<number[]>((acc, v) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
    return [...acc, prev + v];
  }, []);

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit a month&apos;s sales and watch every running total after it shift
      </p>

      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Month</th>
              <th className="px-3 py-2 text-left">Monthly Sales</th>
              <th className="px-3 py-2 text-left">Running Total</th>
            </tr>
          </thead>
          <tbody>
            {MONTHS.map((m, i) => (
              <tr key={m} className="border-t border-fd-border">
                <td className="px-3 py-2 font-mono">{m}</td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label={`${m} sales`}
                    value={sales[m]}
                    onChange={(e) => setSales((prev) => ({ ...prev, [m]: e.target.value }))}
                    className="w-28 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-sm outline-none focus:border-fd-primary"
                  />
                </td>
                <td className="px-3 py-2 font-mono font-semibold text-fd-primary">${running[i].toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <div className="font-mono text-xs break-words">
          {highlightCode(
            'Running Sales = CALCULATE([Total Sales], FILTER(ALL(DimDate[Date]), DimDate[Date] <= MAX(DimDate[Date])))',
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        — <span className="font-mono">ALL(DimDate[Date])</span> removes the current month&apos;s own filter first, so{' '}
        <span className="font-mono">FILTER()</span> has the entire calendar to search through, not just the one row
        the visual would otherwise restrict it to. Edit any month&apos;s sales and notice that month&apos;s change
        carries forward into every running total after it, but never into the ones before it — a running total
        only ever looks backward from its own row.
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why ALL(DimDate[Date]) is required inside this running total, and why a change to one month only affects the running totals after it:\n\n```\n',
            `Monthly Sales: ${MONTHS.map((m, i) => `${m}=${parsed[i]}`).join(', ')}`,
            `\n\`\`\`\nRunning Total: ${MONTHS.map((m, i) => `${m}=${running[i]}`).join(', ')}`,
          )}
        />
      </div>
    </div>
  );
}
