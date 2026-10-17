'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

type ArgKind = 'type' | 'function';

export function TransformColumnTypesVsTransformColumnsPlayground() {
  const [arg, setArg] = useState<ArgKind>('type');

  const argCode = arg === 'type' ? 'type number' : 'each Number.Round(_, 2)';
  const typesSucceeds = arg === 'type';
  const columnsSucceeds = arg === 'function';

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — pick what gets passed as the second argument
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={arg === 'type'}
          onClick={() => setArg('type')}
          className={cn(
            'rounded-md border px-3 py-1.5 font-mono text-xs',
            arg === 'type'
              ? 'border-fd-primary/40 bg-fd-primary/10 text-fd-primary'
              : 'border-fd-border bg-fd-background text-fd-muted-foreground',
          )}
        >
          {'{{"Amount", type number}}'}
        </button>
        <button
          type="button"
          aria-pressed={arg === 'function'}
          onClick={() => setArg('function')}
          className={cn(
            'rounded-md border px-3 py-1.5 font-mono text-xs',
            arg === 'function'
              ? 'border-fd-primary/40 bg-fd-primary/10 text-fd-primary'
              : 'border-fd-border bg-fd-background text-fd-muted-foreground',
          )}
        >
          {'{{"Amount", each Number.Round(_, 2)}}'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          className={cn(
            'rounded-lg border p-3',
            typesSucceeds ? 'border-fd-border bg-fd-background' : 'border-red-500/40 bg-red-500/10',
          )}
        >
          <div className="font-mono text-xs break-words">
            {highlightCode(`Table.TransformColumnTypes(Source, {{"Amount", ${argCode}}})`)}
          </div>
          <p
            className={cn(
              'mt-2 font-mono text-sm font-semibold',
              typesSucceeds ? 'text-fd-primary' : 'text-red-600 dark:text-red-400',
            )}
          >
            {typesSucceeds ? 'Succeeds — sets the column to a number type' : "Expression.Error — a function isn't a valid type"}
          </p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            columnsSucceeds ? 'border-fd-border bg-fd-background' : 'border-red-500/40 bg-red-500/10',
          )}
        >
          <div className="font-mono text-xs break-words">
            {highlightCode(`Table.TransformColumns(Source, {{"Amount", ${argCode}}})`)}
          </div>
          <p
            className={cn(
              'mt-2 font-mono text-sm font-semibold',
              columnsSucceeds ? 'text-fd-primary' : 'text-red-600 dark:text-red-400',
            )}
          >
            {columnsSucceeds ? 'Succeeds — rounds every value in the column' : 'Expression.Error — a type literal isn’t callable as a function'}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        {arg === 'type' ? (
          <>
            — <span className="font-mono">type number</span> is a valid type literal, exactly what{' '}
            <span className="font-mono">Table.TransformColumnTypes()</span> expects. Passed to{' '}
            <span className="font-mono">Table.TransformColumns()</span> instead, it fails — that function tries to
            call its second argument as a function once per value, and a bare type isn&apos;t callable.
          </>
        ) : (
          <>
            — <span className="font-mono">each Number.Round(_, 2)</span> is a function, exactly what{' '}
            <span className="font-mono">Table.TransformColumns()</span> expects to call per value. Passed to{' '}
            <span className="font-mono">Table.TransformColumnTypes()</span> instead, it fails — that function
            expects a type literal to assign to the column, not something to invoke.
          </>
        )}
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why the same second argument works for one of these two functions but not the other:\n\n```\n',
            `Second argument: ${argCode}`,
            `\n\`\`\`\nTable.TransformColumnTypes: ${typesSucceeds ? 'succeeds' : 'errors'}\nTable.TransformColumns: ${columnsSucceeds ? 'succeeds' : 'errors'}`,
          )}
        />
      </div>
    </div>
  );
}
