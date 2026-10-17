'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const MAX_N = 10;

export function RecursiveFactorialPlayground() {
  const [nText, setNText] = useState('5');

  const parsed = Number.parseInt(nText, 10);
  const n = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(MAX_N, parsed));

  const terms = n <= 1 ? [1] : Array.from({ length: n }, (_, i) => n - i);
  let result = 1;
  const runningFactors = terms.map((t) => {
    result *= t;
    return result;
  });
  const final = runningFactors.length > 0 ? runningFactors[runningFactors.length - 1] : 1;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit n and watch the recursion unwind, one call at a time
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">n (0–{MAX_N})</span>
        <input
          type="text"
          inputMode="numeric"
          aria-label="n"
          value={nText}
          onChange={(e) => setNText(e.target.value)}
          className="w-24 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </div>

      <div className="mt-4 font-mono text-xs break-words">
        {highlightCode('Factorial = (n as number) as number => if n <= 1 then 1 else n * @Factorial(n - 1)')}
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        <p className="text-fd-muted-foreground">Factorial({n})</p>
        {terms.length <= 1 ? (
          <p className="mt-1 break-words">= 1 (base case: n &lt;= 1)</p>
        ) : (
          <>
            {terms.map((t, i) => (
              <p key={i} className="mt-1 break-words">
                {'= '}
                {terms.slice(0, i + 1).join(' * ')}
                {i < terms.length - 1 ? ' * @Factorial(' + (t - 1) + ')' : ''}
              </p>
            ))}
            <p className="mt-2 font-semibold text-fd-primary">= {final.toLocaleString()}</p>
          </>
        )}
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        — each call multiplies <span className="font-mono">n</span> by the result of{' '}
        <span className="font-mono">@Factorial(n - 1)</span>, which can&apos;t resolve until the call inside *it*
        resolves, and so on down to <span className="font-mono">Factorial(1)</span>, the base case that finally
        returns a value without recursing further. The multiplications only actually happen on the way back out,
        last call first.
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain how this recursive M function unwinds step by step, and why the @ prefix is needed:\n\n```\n',
            `Factorial(${n})`,
            `\n\`\`\`\nResult: ${final}`,
          )}
        />
      </div>
    </div>
  );
}
