'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

export function BlankEqualityPlayground() {
  const [value, setValue] = useState('0');
  const [isBlank, setIsBlank] = useState(true);

  const numValue = Number.parseFloat(value);
  const isValid = isBlank || !Number.isNaN(numValue);

  const display = isBlank ? 'BLANK()' : value;
  const isBlankResult = isBlank;
  const equalsZeroResult = isBlank ? true : numValue === 0;

  const isBlankFormula = `ISBLANK(${display})`;
  const equalsZeroFormula = `${display} = 0`;

  const tension = isValid && isBlankResult !== equalsZeroResult;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">Value</span>
        <input
          type="text"
          inputMode="decimal"
          aria-label="Value"
          value={value}
          disabled={isBlank}
          onChange={(e) => setValue(e.target.value)}
          className="w-full max-w-[10rem] rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary disabled:opacity-50"
        />
        <label className="flex items-center gap-2 text-xs text-fd-muted-foreground">
          <input
            type="checkbox"
            checked={isBlank}
            onChange={(e) => setIsBlank(e.target.checked)}
            className="size-3.5 accent-fd-primary"
          />
          treat as BLANK() (no value at all, not zero)
        </label>
      </div>

      {!isValid ? (
        <p className="mt-3 text-xs text-fd-muted-foreground">Enter a number, or check &quot;treat as BLANK()&quot;.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-fd-border bg-fd-background p-3">
            <div className="font-mono text-sm">{highlightCode(isBlankFormula)}</div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-fd-muted-foreground">Result:</span>
              <span
                className={cn(
                  'font-mono font-semibold',
                  isBlankResult ? 'text-fd-primary' : 'text-fd-muted-foreground',
                )}
              >
                {isBlankResult ? 'TRUE' : 'FALSE'}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-fd-border bg-fd-background p-3">
            <div className="font-mono text-sm">{highlightCode(equalsZeroFormula)}</div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-fd-muted-foreground">Result:</span>
              <span
                className={cn(
                  'font-mono font-semibold',
                  equalsZeroResult ? 'text-fd-primary' : 'text-fd-muted-foreground',
                )}
              >
                {equalsZeroResult ? 'TRUE' : 'FALSE'}
              </span>
            </div>
          </div>
        </div>
      )}

      {tension && (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — BLANK() = 0 is TRUE, but ISBLANK() only answers true for an actual BLANK(), never for a real zero.
          These two checks are not interchangeable.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why these two DAX expressions can return different results for the same value:\n\n```\n',
            `${isBlankFormula}\nResult: ${isBlankResult ? 'TRUE' : 'FALSE'}\n\n${equalsZeroFormula}`,
            `\n\`\`\`\nResult: ${equalsZeroResult ? 'TRUE' : 'FALSE'}`,
          )}
        />
      </div>
    </div>
  );
}
