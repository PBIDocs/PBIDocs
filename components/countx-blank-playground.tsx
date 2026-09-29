'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

export function CountXBlankPlayground() {
  const [valuesText, setValuesText] = useState('500, , 300, , 700');

  const rawValues = valuesText.split(',').map((s) => s.trim());
  const countRows = rawValues.length;
  const countX = rawValues.filter((v) => v !== '').length;
  const diverges = countRows !== countX;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — leave a value blank between commas to see it get skipped
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">FactSales[SalesAmount] across rows (leave blank between commas for a blank row)</span>
        <input
          type="text"
          aria-label="Sales values"
          value={valuesText}
          onChange={(e) => setValuesText(e.target.value)}
          className="w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Row</th>
              <th className="px-3 py-2 text-left">SalesAmount</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rawValues.map((v, i) => (
              <tr key={i} className="border-t border-fd-border">
                <td className="px-3 py-2 text-fd-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2">
                  {v === '' ? <span className="italic text-fd-muted-foreground">(blank)</span> : v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">{highlightCode('COUNTROWS(FactSales)')}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">counts every row, blank or not</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fd-primary">{countRows}</p>
        </div>
        <div
          className={cn(
            'rounded-lg border p-3',
            diverges ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-xs break-words">{highlightCode('COUNTX(FactSales, FactSales[SalesAmount])')}</div>
          <p className="mt-2 text-xs text-fd-muted-foreground">only counts rows where the expression isn&apos;t blank</p>
          <p
            className={cn(
              'mt-1 font-mono text-lg font-semibold',
              diverges ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {countX}
          </p>
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — <span className="font-mono">COUNTX()</span> doesn&apos;t count rows the way{' '}
          <span className="font-mono">COUNTROWS()</span> does; it evaluates the expression for every row and counts
          only the results that aren&apos;t blank. Here, {countRows - countX} row
          {countRows - countX === 1 ? '' : 's'} with a blank <span className="font-mono">SalesAmount</span>{' '}
          silently drop out of the <span className="font-mono">COUNTX()</span> total, with no error or warning.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — with no blank rows in this list, both functions agree. Leave a value empty between two commas to see
          them diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why COUNTX() returns a lower count than COUNTROWS() here, with no error:\n\n```\n',
            `Rows: ${rawValues.map((v) => (v === '' ? '(blank)' : v)).join(', ')}`,
            `\n\`\`\`\nCOUNTROWS(FactSales): ${countRows}\nCOUNTX(FactSales, FactSales[SalesAmount]): ${countX}`,
          )}
        />
      </div>
    </div>
  );
}
