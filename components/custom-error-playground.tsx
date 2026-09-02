'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

export function CustomErrorPlayground() {
  const [value, setValue] = useState('-5');
  const [message, setMessage] = useState('Quantity cannot be negative');

  const num = Number.parseFloat(value);
  const valueIsValid = !Number.isNaN(num);
  const hasError = valueIsValid && num < 0;

  const formula = `try (if [Quantity] >= 0 then [Quantity] else error "${message}")`;

  return (
    // Distinct id: this page already has TryOtherwisePlayground using
    // id="try-it-live" -- two elements sharing an id breaks anchor
    // navigation (whichever comes first in the DOM always wins), a real
    // bug caught the last time a page ended up with two playgrounds.
    <div id="try-it-live-error" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="[Quantity]">
          <input
            type="text"
            inputMode="decimal"
            aria-label="Quantity"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={!valueIsValid}
          />
        </PlaygroundRow>
        <PlaygroundRow label="Error message">
          <input
            type="text"
            aria-label="Error message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </PlaygroundRow>
      </PlaygroundTable>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode(formula)}
      </div>

      {!valueIsValid ? (
        <p className="mt-3 text-xs text-fd-muted-foreground">Enter a number for [Quantity].</p>
      ) : (
        <div className="mt-3 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-xs">
          <div>
            [HasError] ={' '}
            <span className={hasError ? 'font-semibold text-fd-primary' : 'text-fd-muted-foreground'}>
              {hasError ? 'true' : 'false'}
            </span>
          </div>
          {hasError ? (
            <div className="mt-1">
              [Error][Message] = <span className="font-semibold text-fd-primary">&quot;{message}&quot;</span>
            </div>
          ) : (
            <div className="mt-1">
              [Value] = <span className="font-semibold text-fd-primary">{num}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {hasError && (
          <span className="text-xs text-fd-muted-foreground">
            — the message you typed above comes back verbatim in [Error][Message], not a generic
            built-in error string.
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain this Power Query error-handling result:\n\n```\n',
            formula,
            `\n\`\`\`\n[HasError] = ${hasError}${hasError ? `, [Error][Message] = "${message}"` : `, [Value] = ${num}`}`,
          )}
        />
      </div>
    </div>
  );
}
