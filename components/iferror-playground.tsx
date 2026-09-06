'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

type Scenario = 'error' | 'blank';

export function IfErrorPlayground() {
  const [scenario, setScenario] = useState<Scenario>('error');

  const expression = scenario === 'error' ? '[Total Sales] / 0' : 'SUM(Sales[Amount])  -- 0 matching rows';
  const rawResult = scenario === 'error' ? 'Error: division by zero' : 'BLANK()';
  const iferrorResult = scenario === 'error' ? '"N/A"' : 'BLANK()';
  const caught = scenario === 'error';

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">Scenario</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setScenario('error')}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-semibold',
              scenario === 'error'
                ? 'border-fd-primary bg-fd-primary/10 text-fd-primary'
                : 'border-fd-border text-fd-muted-foreground hover:bg-fd-muted',
            )}
          >
            A real error (divide by zero)
          </button>
          <button
            type="button"
            onClick={() => setScenario('blank')}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-semibold',
              scenario === 'blank'
                ? 'border-fd-primary bg-fd-primary/10 text-fd-primary'
                : 'border-fd-border text-fd-muted-foreground hover:bg-fd-muted',
            )}
          >
            A blank result (no matching rows)
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">Raw expression, no IFERROR</p>
        <div className="mt-1 font-mono text-sm">{highlightCode(expression)}</div>
        <p
          className={cn(
            'mt-2 font-mono text-sm font-semibold',
            scenario === 'error' ? 'text-red-500' : 'text-fd-muted-foreground',
          )}
        >
          {rawResult}
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">Wrapped in IFERROR</p>
        <div className="mt-1 font-mono text-sm">{highlightCode(`IFERROR(${expression}, "N/A")`)}</div>
        <p className="mt-2 font-mono text-sm font-semibold text-fd-primary">{iferrorResult}</p>
      </div>

      <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
        {caught
          ? '— IFERROR caught the real error and substituted the fallback "N/A".'
          : '— IFERROR did NOT touch this. BLANK() is a valid value, not an error, so it passes straight through unchanged — the fallback "N/A" is never used.'}
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why IFERROR behaves differently for these two cases:\n\n```\n',
            `${expression} -> ${rawResult}\nIFERROR(${expression}, "N/A")`,
            `\n\`\`\`\nResult: ${iferrorResult}`,
          )}
        />
      </div>
    </div>
  );
}
