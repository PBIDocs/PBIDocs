'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const MAX_ITEMS = 30;

function generate(n: number, inclusive: boolean): number[] {
  const result: number[] = [];
  let current = 1;
  const passes = (v: number) => (inclusive ? v <= n : v < n);
  while (passes(current) && result.length < MAX_ITEMS) {
    result.push(current);
    current += 1;
  }
  return result;
}

export function ListGenerateOffByOnePlayground() {
  const [nText, setNText] = useState('10');

  const n = Number.parseInt(nText, 10) || 0;
  const exclusive = generate(n, false);
  const inclusive = generate(n, true);
  const diverges = exclusive.length !== inclusive.length;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit N and compare the two boundary conditions
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">N</span>
        <input
          type="text"
          inputMode="numeric"
          aria-label="N"
          value={nText}
          onChange={(e) => setNText(e.target.value)}
          className="w-32 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">{highlightCode(`each _ < ${n}`)}</div>
          <p className="mt-2 font-mono text-sm break-words text-fd-primary">{`{${exclusive.join(', ')}}`}</p>
          <p className="mt-1 text-xs text-fd-muted-foreground">{exclusive.length} items</p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            diverges ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-xs break-words">{highlightCode(`each _ <= ${n}`)}</div>
          <p
            className={cn(
              'mt-2 font-mono text-sm break-words',
              diverges ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {`{${inclusive.join(', ')}}`}
          </p>
          <p className="mt-1 text-xs text-fd-muted-foreground">{inclusive.length} items</p>
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — same <span className="font-mono">initial</span> and <span className="font-mono">next</span>, one
          character different in <span className="font-mono">condition</span>. <span className="font-mono">
            _ &lt; {n}
          </span>{' '}
          stops as soon as the value reaches {n}, so {n} itself never gets added — {exclusive.length} items total.{' '}
          <span className="font-mono">
            _ &lt;= {n}
          </span>{' '}
          keeps going through that final step, so {n} is included — {inclusive.length} items. Neither one is an
          error; the difference only shows up as a miscount if it isn&apos;t checked against how many results were
          actually expected.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — with N = {n}, both conditions happen to produce an empty or identical-looking result. Try a positive N
          to see the boundary difference.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why < vs <= in the condition function changes how many items List.Generate() produces here:\n\n```\n',
            `N = ${n}`,
            `\n\`\`\`\neach _ < ${n} -> {${exclusive.join(', ')}} (${exclusive.length} items)\neach _ <= ${n} -> {${inclusive.join(', ')}} (${inclusive.length} items)`,
          )}
        />
      </div>
    </div>
  );
}
