'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

function Operand({
  label,
  value,
  onValueChange,
  isNull,
  onNullChange,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  isNull: boolean;
  onNullChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span className="text-fd-muted-foreground">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        aria-label={label}
        value={value}
        disabled={isNull}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary disabled:opacity-50"
      />
      <label className="flex items-center gap-2 text-xs text-fd-muted-foreground">
        <input
          type="checkbox"
          checked={isNull}
          onChange={(e) => onNullChange(e.target.checked)}
          className="size-3.5 accent-fd-primary"
        />
        treat as null
      </label>
    </div>
  );
}

export function NullEqualityPlayground() {
  const [leftValue, setLeftValue] = useState('5');
  const [leftIsNull, setLeftIsNull] = useState(true);
  const [rightValue, setRightValue] = useState('5');
  const [rightIsNull, setRightIsNull] = useState(true);

  const leftNum = Number.parseFloat(leftValue);
  const rightNum = Number.parseFloat(rightValue);
  const leftValid = leftIsNull || !Number.isNaN(leftNum);
  const rightValid = rightIsNull || !Number.isNaN(rightNum);

  const leftDisplay = leftIsNull ? 'null' : leftValue;
  const rightDisplay = rightIsNull ? 'null' : rightValue;

  const areEqual = leftIsNull && rightIsNull ? true : leftIsNull !== rightIsNull ? false : leftNum === rightNum;

  const formula = `${leftDisplay} = ${rightDisplay}`;
  const bothNull = leftIsNull && rightIsNull;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Operand
          label="Left"
          value={leftValue}
          onValueChange={setLeftValue}
          isNull={leftIsNull}
          onNullChange={setLeftIsNull}
        />
        <Operand
          label="Right"
          value={rightValue}
          onValueChange={setRightValue}
          isNull={rightIsNull}
          onNullChange={setRightIsNull}
        />
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode(formula)}
      </div>

      {!leftValid || !rightValid ? (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          Enter numbers, or check &quot;treat as null&quot;.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-fd-muted-foreground">Result:</span>
          <span className={cn('font-mono font-semibold', areEqual ? 'text-fd-primary' : 'text-fd-muted-foreground')}>
            {areEqual ? 'true' : 'false'}
          </span>
          {bothNull && (
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              — both sides are null, and M says they&apos;re equal. SQL&apos;s NULL = NULL would be
              UNKNOWN, not TRUE.
            </span>
          )}
        </div>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain this Power Query M equality comparison result, especially involving null:\n\n```\n',
            formula,
            `\n\`\`\`\nResult: ${areEqual ? 'true' : 'false'}`,
          )}
        />
      </div>
    </div>
  );
}
