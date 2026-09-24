'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface RankedRow {
  value: number;
  correctRank: number;
}

function computeCorrectRanks(values: number[]): RankedRow[] {
  return values.map((value) => {
    const greater = values.filter((v) => v > value).length;
    return { value, correctRank: greater + 1 };
  });
}

export function EarlierPlayground() {
  const [valuesText, setValuesText] = useState('500, 900, 300, 700');

  const parsedValues = valuesText
    .split(',')
    .map((s) => Number.parseFloat(s.trim()))
    .filter((n) => !Number.isNaN(n));

  const rows = computeCorrectRanks(parsedValues);

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit the sales values and watch the mistake ignore them
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">FactSales[SalesAmount] across rows</span>
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
              <th className="px-3 py-2 text-left">SalesAmount</th>
              <th className="px-3 py-2 text-left">With EARLIER (correct)</th>
              <th className="px-3 py-2 text-left">Without EARLIER (mistake)</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((row, i) => (
              <tr key={`${row.value}-${i}`} className="border-t border-fd-border">
                <td className="px-3 py-2">{row.value}</td>
                <td className="px-3 py-2 text-fd-primary">{row.correctRank}</td>
                <td className="px-3 py-2 font-semibold text-amber-600 dark:text-amber-400">1</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="font-mono text-xs break-words">
          {highlightCode(
            'COUNTROWS(FILTER(FactSales, FactSales[SalesAmount] > EARLIER(FactSales[SalesAmount]))) + 1',
          )}
        </div>
        <div className="font-mono text-xs break-words">
          {highlightCode('COUNTROWS(FILTER(FactSales, FactSales[SalesAmount] > FactSales[SalesAmount])) + 1')}
        </div>
      </div>

      <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
        — without <span className="font-mono">EARLIER()</span>, the bare column reference inside{' '}
        <span className="font-mono">FILTER()</span> means the inner row, so the comparison becomes{' '}
        <span className="font-mono">SalesAmount &gt; SalesAmount</span> for every row — always false, no matter what
        the values are. <span className="font-mono">COUNTROWS()</span> returns 0 every time, so every single row
        silently comes out ranked 1st. This throws no error — it just quietly produces the wrong answer, which is
        what makes it dangerous.
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why forgetting EARLIER() here makes every row rank 1st instead of throwing an error:\n\n```\n',
            `Values: ${parsedValues.join(', ')}`,
            `\n\`\`\`\nCorrect ranks (with EARLIER): ${rows.map((r) => r.correctRank).join(', ')}\nMistaken ranks (without EARLIER): ${rows.map(() => 1).join(', ')}`,
          )}
        />
      </div>
    </div>
  );
}
