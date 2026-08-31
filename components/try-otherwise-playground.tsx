'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

// Deliberately narrow: this parses only strict YYYY-MM-DD text, not the
// full breadth of formats Date.From() actually accepts. That's enough to
// demonstrate try...otherwise honestly without overclaiming fidelity to
// Date.From's real (locale-dependent) parsing behavior.
function parseDate(text: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `#date(${year}, ${month}, ${day})`;
}

export function TryOtherwisePlayground() {
  const [text, setText] = useState('2026-01-15');
  const [fallback, setFallback] = useState('null');

  const parsed = parseDate(text);
  const succeeded = parsed !== null;
  const resultDisplay = succeeded ? (parsed as string) : fallback.trim() === '' ? 'null' : fallback;

  const formula = `try Date.From("${text}") otherwise ${fallback.trim() === '' ? 'null' : fallback}`;

  return (
    <div className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="[OrderDate]">
          <input
            type="text"
            aria-label="OrderDate text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. 2026-01-15, or anything else"
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </PlaygroundRow>
        <PlaygroundRow label="otherwise value">
          <input
            type="text"
            aria-label="Otherwise fallback"
            value={fallback}
            onChange={(e) => setFallback(e.target.value)}
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </PlaygroundRow>
      </PlaygroundTable>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode(formula)}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-fd-muted-foreground">Result:</span>
        <span
          className={
            succeeded
              ? 'font-mono font-semibold text-fd-primary'
              : 'font-mono font-semibold text-fd-muted-foreground'
          }
        >
          {resultDisplay}
        </span>
        {!succeeded && (
          <span className="text-xs text-fd-muted-foreground">
            — Date.From() couldn&apos;t parse that, so the otherwise value was returned instead of
            erroring the whole step
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why this Power Query M code returns the result shown:\n\n```\n',
            formula,
            `\n\`\`\`\nResult: ${resultDisplay}`,
          )}
        />
      </div>
      <p className="mt-2 text-xs text-fd-muted-foreground/70">
        This playground parses strict YYYY-MM-DD text, not the full range of formats Date.From()
        actually accepts — enough to show try...otherwise itself, not a full date parser.
      </p>
    </div>
  );
}
