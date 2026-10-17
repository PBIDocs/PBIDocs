'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

type ExprKind = 'table' | 'scalar';

export function CalculateVsCalculateTablePlayground() {
  const [expr, setExpr] = useState<ExprKind>('table');

  const exprCode = expr === 'table' ? 'VALUES(DimProduct[Category])' : 'SUM(FactSales[SalesAmount])';
  const calculateTableSucceeds = expr === 'table';

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — pick what gets passed as the first argument
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={expr === 'table'}
          onClick={() => setExpr('table')}
          className={cn(
            'rounded-md border px-3 py-1.5 font-mono text-xs',
            expr === 'table'
              ? 'border-fd-primary/40 bg-fd-primary/10 text-fd-primary'
              : 'border-fd-border bg-fd-background text-fd-muted-foreground',
          )}
        >
          VALUES(DimProduct[Category]) — a table
        </button>
        <button
          type="button"
          aria-pressed={expr === 'scalar'}
          onClick={() => setExpr('scalar')}
          className={cn(
            'rounded-md border px-3 py-1.5 font-mono text-xs',
            expr === 'scalar'
              ? 'border-fd-primary/40 bg-fd-primary/10 text-fd-primary'
              : 'border-fd-border bg-fd-background text-fd-muted-foreground',
          )}
        >
          SUM(FactSales[SalesAmount]) — a scalar
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">
            {highlightCode(`CALCULATE(${exprCode}, DimProduct[Category] = "Bikes")`)}
          </div>
          <p className="mt-2 font-mono text-sm font-semibold text-fd-primary">
            {expr === 'table' ? 'Succeeds — returns a table' : 'Succeeds — returns a scalar'}
          </p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            calculateTableSucceeds ? 'border-fd-border bg-fd-background' : 'border-red-500/40 bg-red-500/10',
          )}
        >
          <div className="font-mono text-xs break-words">
            {highlightCode(`CALCULATETABLE(${exprCode}, DimProduct[Category] = "Bikes")`)}
          </div>
          <p
            className={cn(
              'mt-2 font-mono text-sm font-semibold',
              calculateTableSucceeds ? 'text-fd-primary' : 'text-red-600 dark:text-red-400',
            )}
          >
            {calculateTableSucceeds ? 'Succeeds — returns a table' : "Error — SUM() isn't a table expression"}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        {expr === 'table' ? (
          <>
            — with a table expression, <span className="font-mono">CALCULATE()</span> and{' '}
            <span className="font-mono">CALCULATETABLE()</span> return the identical result. The only difference
            between them is which argument types each one accepts, not how filter context gets modified.
          </>
        ) : (
          <>
            — <span className="font-mono">CALCULATE()</span> adapts to whatever its first argument returns, so a
            scalar expression gives back a scalar. <span className="font-mono">CALCULATETABLE()</span> only accepts
            a table expression — passing it a scalar is a genuine error, not a silent one-row-table conversion.
          </>
        )}
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why CALCULATETABLE() fails here with a scalar expression while CALCULATE() succeeds with both:\n\n```\n',
            `First argument: ${exprCode}`,
            `\n\`\`\`\nCALCULATE: succeeds\nCALCULATETABLE: ${calculateTableSucceeds ? 'succeeds' : 'errors'}`,
          )}
        />
      </div>
    </div>
  );
}
