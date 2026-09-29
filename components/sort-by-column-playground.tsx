'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const MONTHS = ['April', 'August', 'December', 'February'] as const;
type Month = (typeof MONTHS)[number];

const TRUE_CALENDAR_ORDER: Month[] = ['February', 'April', 'August', 'December'];
const ALPHABETICAL_ORDER: Month[] = ['April', 'August', 'December', 'February'];

export function SortByColumnPlayground() {
  const [numbers, setNumbers] = useState<Record<Month, string>>({
    April: '4',
    August: '8',
    December: '12',
    February: '2',
  });

  const parsed: Record<Month, number> = {
    April: Number.parseFloat(numbers.April) || 0,
    August: Number.parseFloat(numbers.August) || 0,
    December: Number.parseFloat(numbers.December) || 0,
    February: Number.parseFloat(numbers.February) || 0,
  };

  const customOrder = [...MONTHS].sort((a, b) => parsed[a] - parsed[b]);
  const isCalendarCorrect = customOrder.join(',') === TRUE_CALENDAR_ORDER.join(',');

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit Month Number and watch the sort order follow it
      </p>

      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Month Name</th>
              <th className="px-3 py-2 text-left">Month Number</th>
            </tr>
          </thead>
          <tbody>
            {MONTHS.map((m) => (
              <tr key={m} className="border-t border-fd-border">
                <td className="px-3 py-2 font-mono">{m}</td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label={`${m} number`}
                    value={numbers[m]}
                    onChange={(e) => setNumbers((prev) => ({ ...prev, [m]: e.target.value }))}
                    className="w-20 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-sm outline-none focus:border-fd-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">Sort Month Name alphabetically</p>
          <p className="mt-1 font-mono text-sm text-fd-primary">{ALPHABETICAL_ORDER.join(' → ')}</p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            isCalendarCorrect ? 'border-fd-border bg-fd-background' : 'border-amber-500/40 bg-amber-500/10',
          )}
        >
          <p className="text-xs text-fd-muted-foreground">Sort Month Name by Month Number</p>
          <p
            className={cn(
              'mt-1 font-mono text-sm',
              isCalendarCorrect ? 'text-fd-primary' : 'font-semibold text-amber-600 dark:text-amber-400',
            )}
          >
            {customOrder.join(' → ')}
          </p>
        </div>
      </div>

      {isCalendarCorrect ? (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — with these Month Number values, sorting by that column puts the months in real calendar order, instead
          of alphabetical. Change one of the numbers to something out of sequence to see the order break.
        </p>
      ) : (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — the whole point of a sort-by column is that Power BI trusts it completely: whatever order the numbers
          put the months in is the order that gets displayed, calendar-correct or not. With these particular
          numbers, the months no longer land in real calendar sequence — the sort column is only as correct as the
          values assigned to it.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain how sorting a text column by a numeric column works in Power BI, using this example:\n\n```\n',
            `Month Number values: April=${parsed.April}, August=${parsed.August}, December=${parsed.December}, February=${parsed.February}`,
            `\n\`\`\`\nResulting sort order: ${customOrder.join(', ')}`,
          )}
        />
      </div>
    </div>
  );
}
