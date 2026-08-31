'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const NBSP = ' ';

const presets = [
  { id: 'normal', label: 'Trailing normal space', text: `1234 ` },
  { id: 'nbsp', label: `Trailing non-breaking space (U+00A0)`, text: `1234${NBSP}` },
];

// Matches Power Query's default Text.Trim character set: regular space,
// tab, CR, LF -- deliberately NOT U+00A0, which is the whole point here.
// (JS's own String.trim() strips U+00A0 too, so it can't be reused as-is
// without silently misrepresenting what Text.Trim actually does.)
function mTrim(text: string): string {
  return text.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
}

export function TextTrimPlayground() {
  const [text, setText] = useState(presets[0].text);

  const trimmed = mTrim(text);
  const formula = `Text.Trim("${text.replace(NBSP, '\\u00A0')}")`;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setText(preset.text)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-semibold',
              text === preset.text
                ? 'border-fd-primary bg-fd-primary/10 text-fd-primary'
                : 'border-fd-border text-fd-muted-foreground hover:bg-fd-muted',
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-fd-border bg-fd-background p-3">
        <div className="flex w-max gap-0.5 font-mono text-sm">
          {text.split('').map((ch, i) => {
            const isNbsp = ch === NBSP;
            const isNormalSpace = ch === ' ';
            return (
              <div key={i} className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex h-6 w-5 items-center justify-center rounded text-center',
                    isNbsp && 'bg-amber-500/20 font-semibold text-amber-600 dark:text-amber-400',
                    isNormalSpace && 'text-fd-muted-foreground/50',
                  )}
                >
                  {isNbsp ? '·' : isNormalSpace ? '·' : ch}
                </span>
                <span className="text-[9px] text-fd-muted-foreground/60">
                  {isNbsp ? 'nbsp' : isNormalSpace ? 'sp' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode(formula)}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-fd-muted-foreground">Result:</span>
        <span className="font-mono font-semibold text-fd-primary">
          &quot;{trimmed.replace(NBSP, '·')}&quot;
        </span>
        <span className="text-xs text-fd-muted-foreground">
          — {text.length} characters in, {trimmed.length} characters out
        </span>
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why this Power Query M code returns the result shown:\n\n```\n',
            formula,
            `\n\`\`\`\nResult: "${trimmed.replace(NBSP, '\\u00A0')}" (${trimmed.length} characters)`,
          )}
        />
      </div>
      {trimmed.includes(NBSP) && (
        <p className="mt-1 text-xs text-fd-muted-foreground">
          The non-breaking space is still there after trimming — it doesn&apos;t count as
          whitespace to <code className="rounded bg-fd-secondary px-1 py-0.5">Text.Trim()</code>.
        </p>
      )}
    </div>
  );
}
