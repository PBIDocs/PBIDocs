'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

type Kind = 'column' | 'function';

export function MCaseSensitivityPlayground() {
  const [kind, setKind] = useState<Kind>('column');
  const [text, setText] = useState('Amount');

  const correct = kind === 'column' ? 'Amount' : 'Table.SelectRows';
  const matches = text === correct;

  const formula = kind === 'column' ? `each [${text}] > 100` : `${text}(Source, each [Amount] > 100)`;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit the text and change even one letter&apos;s case
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={kind === 'column'}
          onClick={() => {
            setKind('column');
            setText('Amount');
          }}
          className={cn(
            'rounded-md border px-3 py-1.5 font-mono text-xs',
            kind === 'column'
              ? 'border-fd-primary/40 bg-fd-primary/10 text-fd-primary'
              : 'border-fd-border bg-fd-background text-fd-muted-foreground',
          )}
        >
          Column reference
        </button>
        <button
          type="button"
          aria-pressed={kind === 'function'}
          onClick={() => {
            setKind('function');
            setText('Table.SelectRows');
          }}
          className={cn(
            'rounded-md border px-3 py-1.5 font-mono text-xs',
            kind === 'function'
              ? 'border-fd-primary/40 bg-fd-primary/10 text-fd-primary'
              : 'border-fd-border bg-fd-background text-fd-muted-foreground',
          )}
        >
          Function name
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">
          {kind === 'column' ? 'Column name as written in the formula' : 'Function name as written in the formula'}{' '}
          (actual: <span className="font-mono">{correct}</span>)
        </span>
        <input
          type="text"
          aria-label="Reference text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-56 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </div>

      <div className="mt-4">
        <div className="font-mono text-xs break-words">{highlightCode(formula)}</div>
      </div>

      <div
        className={cn(
          'mt-3 rounded-lg border p-3',
          matches ? 'border-fd-border bg-fd-background' : 'border-red-500/40 bg-red-500/10',
        )}
      >
        <p
          className={cn(
            'font-mono text-sm font-semibold',
            matches ? 'text-fd-primary' : 'text-red-600 dark:text-red-400',
          )}
        >
          {matches
            ? kind === 'column'
              ? 'Succeeds — matches the actual column exactly'
              : 'Succeeds — matches a real M function exactly'
            : kind === 'column'
              ? `Expression.Error: The field '${text}' of the record wasn't found.`
              : `Expression.Error: The name '${text}' wasn't recognized. Make sure it's spelled correctly.`}
        </p>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        — M treats <span className="font-mono">{correct}</span> and any differently-cased version of it as two
        completely different identifiers, not a formatting detail. This applies everywhere in M: column references,
        function names, step names — none of them are case-insensitive, unlike some other query languages where
        case is ignored or only a style convention.
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            `Explain why this ${kind === 'column' ? 'column reference' : 'function name'} ${matches ? 'works' : 'fails'} in Power Query M:\n\n\`\`\`\n`,
            formula,
            `\n\`\`\`\nActual ${kind === 'column' ? 'column name' : 'function name'}: ${correct}\nWritten as: ${text}`,
          )}
        />
      </div>
    </div>
  );
}
