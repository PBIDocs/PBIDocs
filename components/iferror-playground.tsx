'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

type Scenario = 'error' | 'divzero' | 'blank';

export function IfErrorPlayground() {
  const [scenario, setScenario] = useState<Scenario>('error');

  const SCENARIOS: Record<Scenario, { expression: string; raw: string; wrapped: string; note: string }> = {
    error: {
      expression: 'VALUE("A-17")',
      raw: "Error: cannot convert value 'A-17' of type Text to type Number",
      wrapped: '"N/A"',
      note: '— IFERROR caught the real error and substituted the fallback "N/A".',
    },
    divzero: {
      expression: '[Total Sales] / 0',
      raw: 'Infinity',
      wrapped: 'Infinity',
      note: "— IFERROR did NOT touch this. Dividing by zero isn't an error in DAX: it returns Infinity. Use DIVIDE() to get BLANK (or a fallback) instead.",
    },
    blank: {
      expression: 'SUM(Sales[Amount])  -- 0 matching rows',
      raw: 'BLANK()',
      wrapped: 'BLANK()',
      note: '— IFERROR did NOT touch this. BLANK() is a valid value, not an error, so it passes straight through unchanged — the fallback "N/A" is never used.',
    },
  };
  const { expression, raw: rawResult, wrapped: iferrorResult, note } = SCENARIOS[scenario];

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">Scenario</span>
        <div className="flex flex-wrap gap-2">
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
            A real error (text to number)
          </button>
          <button
            type="button"
            onClick={() => setScenario('divzero')}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-semibold',
              scenario === 'divzero'
                ? 'border-fd-primary bg-fd-primary/10 text-fd-primary'
                : 'border-fd-border text-fd-muted-foreground hover:bg-fd-muted',
            )}
          >
            Divide by zero
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
        {note}
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
