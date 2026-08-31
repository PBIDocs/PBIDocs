'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

export function TextMiddlePlayground() {
  const [text, setText] = useState('INV-2026-0042');
  const [start, setStart] = useState('4');
  const [count, setCount] = useState('4');

  const startNum = Number.parseInt(start, 10);
  const startIsValid = !Number.isNaN(startNum) && startNum >= 0;
  const countNum = count.trim() === '' ? null : Number.parseInt(count, 10);
  const countIsValid = count.trim() === '' || (countNum !== null && !Number.isNaN(countNum) && countNum >= 0);

  const clampedStart = startIsValid ? Math.min(startNum, text.length) : 0;
  const rangeEnd = countIsValid
    ? countNum === null
      ? text.length
      : Math.min(clampedStart + countNum, text.length)
    : clampedStart;

  const result = startIsValid && countIsValid ? text.slice(clampedStart, rangeEnd) : '';

  const formula = `Text.Middle("${text}", ${start || '0'}${count.trim() !== '' ? `, ${count}` : ''})`;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
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
        <PlaygroundRow label="Start (zero-indexed)">
          <input
            type="text"
            inputMode="numeric"
            aria-label="Start position"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-24 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={!startIsValid}
          />
        </PlaygroundRow>
        <PlaygroundRow label="Count (optional)">
          <input
            type="text"
            inputMode="numeric"
            aria-label="Count"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="to end if blank"
            className="w-24 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={!countIsValid}
          />
        </PlaygroundRow>
      </PlaygroundTable>

      <div className="mt-4 overflow-x-auto rounded-lg border border-fd-border bg-fd-background p-3">
        <div className="flex w-max gap-0.5 font-mono text-sm">
          {text.split('').map((ch, i) => (
            <div key={i} className="flex flex-col items-center">
              <span
                className={cn(
                  'w-5 rounded text-center',
                  startIsValid && countIsValid && i >= clampedStart && i < rangeEnd
                    ? 'bg-fd-primary/20 font-semibold text-fd-primary'
                    : 'text-fd-foreground',
                )}
              >
                {ch}
              </span>
              <span className="text-[10px] text-fd-muted-foreground/60">{i}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode(formula)}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-fd-muted-foreground">Result:</span>
        <span className="font-mono font-semibold text-fd-primary">&quot;{result}&quot;</span>
        {(!startIsValid || !countIsValid) && (
          <span className="text-xs text-fd-muted-foreground">
            — Start and Count need to be non-negative whole numbers
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why this Power Query M code returns the result shown:\n\n```\n',
            formula,
            `\n\`\`\`\nResult: "${result}"`,
          )}
        />
      </div>
    </div>
  );
}
