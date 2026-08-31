'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

export function TextSplitPlayground() {
  const [text, setText] = useState('A,,B');
  const [separator, setSeparator] = useState(',');

  const separatorIsValid = separator !== '';
  const parts = separatorIsValid ? text.split(separator) : [];

  const formula = `Text.Split("${text}", "${separator}")`;
  const resultLiteral = separatorIsValid
    ? `{${parts.map((p) => `"${p}"`).join(', ')}}`
    : '';

  return (
    <div className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="Text">
          <input
            type="text"
            aria-label="Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </PlaygroundRow>
        <PlaygroundRow label="Separator">
          <input
            type="text"
            aria-label="Separator"
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="w-24 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={!separatorIsValid}
          />
        </PlaygroundRow>
      </PlaygroundTable>

      <div className="mt-4 flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-fd-border bg-fd-background p-3">
        {!separatorIsValid && (
          <span className="text-sm text-fd-muted-foreground">Separator can&apos;t be empty</span>
        )}
        {separatorIsValid &&
          parts.map((part, i) => (
            <span
              key={i}
              className={cn(
                'rounded-md border px-2.5 py-1 font-mono text-sm',
                part === ''
                  ? 'border-dashed border-fd-primary/40 text-fd-muted-foreground italic'
                  : 'border-fd-border bg-fd-secondary/50 text-fd-foreground',
              )}
            >
              {part === '' ? '(empty)' : part}
            </span>
          ))}
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode(formula)}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-fd-muted-foreground">Result:</span>
        <span className="font-mono font-semibold text-fd-primary">{resultLiteral}</span>
        {separatorIsValid && (
          <span className="text-xs text-fd-muted-foreground">
            — {parts.length} {parts.length === 1 ? 'item' : 'items'}
            {parts.some((p) => p === '') ? ', including at least one empty string' : ''}
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why this Power Query M code returns the result shown:\n\n```\n',
            formula,
            `\n\`\`\`\nResult: ${resultLiteral}`,
          )}
        />
      </div>
    </div>
  );
}
