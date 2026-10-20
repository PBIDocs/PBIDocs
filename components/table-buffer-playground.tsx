'use client';

import { useState } from 'react';
import { FlaskConical, RefreshCw } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

export function TableBufferPlayground() {
  const [buffered, setBuffered] = useState(false);
  const [tick, setTick] = useState(1);

  const ref1 = tick;
  const ref2 = buffered ? tick : tick + 1;
  const diverges = ref1 !== ref2;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — toggle Table.Buffer(), then re-evaluate the query
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={buffered}
          onClick={() => setBuffered((b) => !b)}
          className={cn(
            'rounded-md border px-3 py-1.5 font-mono text-xs',
            buffered
              ? 'border-fd-primary/40 bg-fd-primary/10 text-fd-primary'
              : 'border-fd-border bg-fd-background text-fd-muted-foreground',
          )}
        >
          Table.Buffer(): {buffered ? 'On' : 'Off'}
        </button>
        <button
          type="button"
          onClick={() => setTick((t) => t + 2)}
          className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-background px-3 py-1.5 font-mono text-xs hover:border-fd-primary"
        >
          <RefreshCw className="size-3.5" />
          Re-evaluate query
        </button>
      </div>

      <div className="mt-4">
        <div className="font-mono text-xs break-words">
          {highlightCode(
            buffered
              ? 'Source = Table.Buffer(Json.Document(Web.Contents(url)))'
              : 'Source = Json.Document(Web.Contents(url))',
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">First reference to Source</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">response #{ref1}</p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            diverges ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <p className="text-xs text-fd-muted-foreground">Second reference to Source</p>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              diverges ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            response #{ref2}
          </p>
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — without <span className="font-mono">Table.Buffer()</span>, each reference to{' '}
          <span className="font-mono">Source</span> can re-trigger the underlying call independently. Against a
          volatile source (an API, a function with side effects), that means two references in the same query can
          genuinely see two different results — not an error, just a real risk for any source that isn&apos;t
          guaranteed to return the same thing twice.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — with <span className="font-mono">Table.Buffer()</span>, the source is loaded into memory on its first
          reference, and every reference after that reads the same cached result. Click{' '}
          <span className="font-mono">Re-evaluate query</span> to confirm it stays in sync across refreshes.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why two references to the same Source step can return different results without Table.Buffer(), but not with it:\n\n```\n',
            `Table.Buffer(): ${buffered ? 'On' : 'Off'}`,
            `\n\`\`\`\nFirst reference: response #${ref1}\nSecond reference: response #${ref2}`,
          )}
        />
      </div>
    </div>
  );
}
