'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

export function DaxMidPlayground() {
  const [text, setText] = useState('INV-2026-0042');
  const [start, setStart] = useState('5');
  const [count, setCount] = useState('4');

  const startNum = Number.parseInt(start, 10);
  const startIsValid = !Number.isNaN(startNum) && startNum >= 1;
  const countNum = Number.parseInt(count, 10);
  const countIsValid = !Number.isNaN(countNum) && countNum >= 0;

  // MID() is 1-indexed: start = 1 means the first character.
  const zeroBasedStart = startIsValid ? startNum - 1 : 0;
  const clampedStart = startIsValid ? Math.min(zeroBasedStart, text.length) : 0;
  const rangeEnd = countIsValid ? Math.min(clampedStart + countNum, text.length) : clampedStart;

  const result = startIsValid && countIsValid ? text.slice(clampedStart, rangeEnd) : '';

  const daxFormula = `MID("${text}", ${start || '1'}, ${count || '0'})`;
  const mFormula = `Text.Middle("${text}", ${zeroBasedStart}, ${count || '0'})`;

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
        <PlaygroundRow label="Start (1-indexed)">
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
        <PlaygroundRow label="Num Chars">
          <input
            type="text"
            inputMode="numeric"
            aria-label="Number of characters"
            value={count}
            onChange={(e) => setCount(e.target.value)}
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
              <span className="text-[10px] text-fd-muted-foreground/60">{i + 1}</span>
            </div>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-fd-muted-foreground/60">
          Numbers below the ruler are 1-indexed, the way MID() counts positions.
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode(daxFormula)}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-fd-muted-foreground">Result:</span>
        <span className="font-mono font-semibold text-fd-primary">&quot;{result}&quot;</span>
        {(!startIsValid || !countIsValid) && (
          <span className="text-xs text-fd-muted-foreground">
            — Start needs to be 1 or greater, Num Chars needs to be 0 or greater
          </span>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-fd-border bg-fd-background/50 p-3">
        <p className="mb-2 text-xs text-fd-muted-foreground">
          The identical substring, extracted in Power Query M instead — note the start argument:
        </p>
        <div className="font-mono text-sm">{highlightCode(mFormula)}</div>
        <p className="mt-2 text-xs text-fd-muted-foreground">
          Same result, different start number: MID() start <span className="font-mono font-semibold">{start || '1'}</span>{' '}
          means the same character as Text.Middle() start{' '}
          <span className="font-mono font-semibold">{zeroBasedStart}</span> — MID() counts the first character as{' '}
          <span className="font-mono">1</span>, Text.Middle() counts it as <span className="font-mono">0</span>.
        </p>
      </div>

      <div className="mt-4 flex justify-end">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why MID() in DAX and Text.Middle() in Power Query M need different start numbers to extract the same substring:\n\n```\n',
            `${daxFormula}\n${mFormula}`,
            `\n\`\`\`\nBoth results: "${result}"`,
          )}
        />
      </div>
    </div>
  );
}
