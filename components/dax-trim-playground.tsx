'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

// DAX's TRIM() mirrors Excel's TRIM(): strip leading/trailing spaces AND
// collapse any run of internal spaces down to a single space.
function daxTrim(text: string): string {
  return text.replace(/^ +| +$/g, '').replace(/ {2,}/g, ' ');
}

// Power Query's Text.Trim() default character set: only strips leading and
// trailing whitespace -- internal runs of spaces are left completely alone.
function mTrim(text: string): string {
  return text.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
}

function DotText({ text }: { text: string }) {
  return (
    <span className="font-mono text-sm">
      {text.split('').map((ch, i) =>
        ch === ' ' ? (
          <span key={i} className="text-amber-600 dark:text-amber-400">
            ·
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  );
}

export function DaxTrimPlayground() {
  const [text, setText] = useState('  Widget   Sales  ');

  const daxResult = daxTrim(text);
  const mResult = mTrim(text);

  const daxFormula = `TRIM("${text}")`;
  const mFormula = `Text.Trim("${text}")`;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — dots mark spaces
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">Text</span>
        <input
          type="text"
          aria-label="Text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
        <div className="rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5">
          <DotText text={text} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-sm">{highlightCode(daxFormula)}</div>
          <div className="mt-2 rounded-md border border-fd-border bg-fd-secondary/30 px-2.5 py-1.5">
            <DotText text={daxResult} />
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            {daxResult.length} character{daxResult.length === 1 ? '' : 's'} — internal spaces collapsed
          </p>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-sm">{highlightCode(mFormula)}</div>
          <div className="mt-2 rounded-md border border-fd-border bg-fd-secondary/30 px-2.5 py-1.5">
            <DotText text={mResult} />
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            {mResult.length} character{mResult.length === 1 ? '' : 's'} — internal spaces untouched
          </p>
        </div>
      </div>

      {daxResult !== mResult && (
        <p className={cn('mt-3 text-xs font-medium text-amber-600 dark:text-amber-400')}>
          — same input, {mResult.length - daxResult.length} more character
          {mResult.length - daxResult.length === 1 ? '' : 's'} survive Text.Trim() than TRIM(), all of them
          internal spaces.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            "Explain why DAX's TRIM() and Power Query's Text.Trim() produce different-length results for the same text:\n\n```\n",
            `${daxFormula} -> "${daxResult}" (${daxResult.length} chars)\n${mFormula} -> "${mResult}" (${mResult.length} chars)`,
            '\n```',
          )}
        />
      </div>
    </div>
  );
}
