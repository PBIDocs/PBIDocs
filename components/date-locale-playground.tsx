'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Order = 'MDY' | 'DMY';

interface ParseResult {
  ok: boolean;
  display: string;
}

// Deliberately narrow: this parses only strict M/D/YYYY text and only
// decides month-vs-day ordering, not the full breadth of formats or
// locales Table.TransformColumnTypes's locale argument actually supports.
// That's enough to demonstrate the specific ambiguity, not a full
// culture-aware date parser.
function parseWithOrder(text: string, order: Order): ParseResult {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!match) return { ok: false, display: "doesn't match M/D/YYYY" };

  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = Number(match[3]);
  const month = order === 'MDY' ? first : second;
  const day = order === 'MDY' ? second : first;

  if (month < 1 || month > 12) return { ok: false, display: `${month} isn't a valid month` };

  const date = new Date(year, month - 1, day);
  if (date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { ok: false, display: `${day} isn't a valid day in that month` };
  }

  return { ok: true, display: `${MONTH_NAMES[month - 1]} ${day}, ${year}` };
}

export function DateLocalePlayground() {
  const [text, setText] = useState('03/04/2026');

  const us = parseWithOrder(text, 'MDY');
  const gb = parseWithOrder(text, 'DMY');
  const bothSucceeded = us.ok && gb.ok;
  const isAmbiguous = bothSucceeded && us.display !== gb.display;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="Date text">
          <input
            type="text"
            aria-label="Date text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. 03/04/2026"
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </PlaygroundRow>
      </PlaygroundTable>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div
          className={cn(
            'rounded-lg border p-3',
            isAmbiguous ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <p className="text-xs text-fd-muted-foreground">en-US locale (month/day/year)</p>
          <p
            className={cn(
              'mt-1 font-mono text-sm font-semibold',
              us.ok ? 'text-fd-primary' : 'text-fd-muted-foreground',
            )}
          >
            {us.display}
          </p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            isAmbiguous ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <p className="text-xs text-fd-muted-foreground">en-GB locale (day/month/year)</p>
          <p
            className={cn(
              'mt-1 font-mono text-sm font-semibold',
              gb.ok ? 'text-fd-primary' : 'text-fd-muted-foreground',
            )}
          >
            {gb.display}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {isAmbiguous && (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Both parsed successfully — into two different dates. This is the silent case.
          </span>
        )}
        {bothSucceeded && !isAmbiguous && (
          <span className="text-xs text-fd-muted-foreground">
            Both locales agree — not ambiguous for this particular value.
          </span>
        )}
        {(!us.ok || !gb.ok) && (
          <span className="text-xs text-fd-muted-foreground">
            {!us.ok && !gb.ok
              ? 'Neither locale can parse this as a valid date.'
              : 'Only one locale can parse this — the other fails loudly instead of guessing.'}
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain this Power Query locale-ambiguous date parsing result:\n\n',
            `Date text: "${text}"\nen-US (month/day/year): ${us.display}\nen-GB (day/month/year): ${gb.display}`,
          )}
        />
      </div>
    </div>
  );
}
