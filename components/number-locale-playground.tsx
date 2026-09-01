'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

type Locale = 'en-US' | 'de-DE';

interface ParseResult {
  ok: boolean;
  display: string;
}

// Deliberately narrow, not a full locale-aware number parser -- enough to
// show the actual ambiguity honestly. Splits on the locale's OWN decimal
// character first, then only strips the grouping character from the
// integer part. This matters: a first pass that just stripped every comma
// (en-US) or period (de-DE) unconditionally, wherever it appeared, let
// "1.234,56" silently misparse as 1.23456 under en-US -- a fabricated wrong
// number, not a real one, since a comma sitting in the *fractional* part
// isn't a valid thousands-separator position at all. Rejecting that case
// as invalid (matching the "fails loudly" side of the ambiguity) is the
// defensible outcome here, not inventing a specific wrong value.
function parseWithLocale(text: string, locale: Locale): ParseResult {
  const trimmed = text.trim();
  const decimalChar = locale === 'en-US' ? '.' : ',';
  const groupChar = locale === 'en-US' ? ',' : '.';

  const decimalIndex = trimmed.indexOf(decimalChar);
  const integerPart = decimalIndex === -1 ? trimmed : trimmed.slice(0, decimalIndex);
  const fractionalPart = decimalIndex === -1 ? '' : trimmed.slice(decimalIndex + 1);

  // A second decimal character, or the grouping character, showing up in
  // the fractional part means this text isn't validly formatted here.
  if (fractionalPart.includes(decimalChar) || fractionalPart.includes(groupChar)) {
    return { ok: false, display: "doesn't match this locale's number format" };
  }

  const cleanedInteger = integerPart.split(groupChar).join('');
  const cleaned = fractionalPart ? `${cleanedInteger}.${fractionalPart}` : cleanedInteger;

  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
    return { ok: false, display: "doesn't match this locale's number format" };
  }

  return { ok: true, display: Number.parseFloat(cleaned).toString() };
}

export function NumberLocalePlayground() {
  const [text, setText] = useState('1.234,56');

  const us = parseWithLocale(text, 'en-US');
  const de = parseWithLocale(text, 'de-DE');
  const bothSucceeded = us.ok && de.ok;
  const isAmbiguous = bothSucceeded && us.display !== de.display;

  return (
    <div id="try-it-live-number" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="Number text">
          <input
            type="text"
            aria-label="Number text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. 1.234,56"
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
          <p className="text-xs text-fd-muted-foreground">en-US locale (period = decimal)</p>
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
          <p className="text-xs text-fd-muted-foreground">de-DE locale (comma = decimal)</p>
          <p
            className={cn(
              'mt-1 font-mono text-sm font-semibold',
              de.ok ? 'text-fd-primary' : 'text-fd-muted-foreground',
            )}
          >
            {de.display}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {isAmbiguous && (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Both parsed successfully — into two different numbers. This is the silent case.
          </span>
        )}
        {bothSucceeded && !isAmbiguous && (
          <span className="text-xs text-fd-muted-foreground">
            Both locales agree — not ambiguous for this particular value.
          </span>
        )}
        {(!us.ok || !de.ok) && (
          <span className="text-xs text-fd-muted-foreground">
            {!us.ok && !de.ok
              ? 'Neither locale can parse this as a valid number.'
              : 'Only one locale can parse this — the other fails loudly instead of guessing.'}
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain this Power Query locale-ambiguous number parsing result:\n\n',
            `Number text: "${text}"\nen-US (period = decimal): ${us.display}\nde-DE (comma = decimal): ${de.display}`,
          )}
        />
      </div>
    </div>
  );
}
