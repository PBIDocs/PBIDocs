'use client';

import { useState } from 'react';
import { FlaskConical, Check, X } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

export function FilterAboveAveragePlayground() {
  const [valuesText, setValuesText] = useState('1200, 800, 2500, 400, 1600');

  const parsedValues = valuesText
    .split(',')
    .map((s) => Number.parseFloat(s.trim()))
    .filter((n) => !Number.isNaN(n));

  const average = parsedValues.length === 0 ? 0 : parsedValues.reduce((a, b) => a + b, 0) / parsedValues.length;
  const aboveAverageTotal = parsedValues.filter((v) => v > average).reduce((a, b) => a + b, 0);

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit the sales values and watch the threshold move with them
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
              <th className="px-3 py-2 text-left">
                &gt; AVERAGE({average.toFixed(0)})?
              </th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {parsedValues.map((value, i) => {
              const passes = value > average;
              return (
                <tr key={`${value}-${i}`} className="border-t border-fd-border">
                  <td className="px-3 py-2">{value}</td>
                  <td className="px-3 py-2">
                    {passes ? (
                      <span className="inline-flex items-center gap-1 text-fd-primary">
                        <Check className="size-3.5" /> included
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-fd-muted-foreground">
                        <X className="size-3.5" /> excluded
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <div className="font-mono text-xs break-words">
          {highlightCode(
            'CALCULATE([Total Sales], FILTER(FactSales, FactSales[SalesAmount] > AVERAGE(FactSales[SalesAmount])))',
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        — <span className="font-mono">AVERAGE()</span> is recalculated from the same values every time one changes,
        so the threshold isn&apos;t a fixed number like {'"'}1000{'"'} — it moves with the data. Right now the average
        is <span className="font-mono">{average.toFixed(1)}</span>, and{' '}
        <span className="font-mono">Above Average Sales</span> totals{' '}
        <span className="font-semibold text-fd-primary">{aboveAverageTotal}</span>. Edit a value enough to cross the
        average and watch it flip between included and excluded — and watch the average itself shift too.
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why the average threshold moves every time a value changes, and why FILTER() is what makes this dynamic comparison possible:\n\n```\n',
            `Values: ${parsedValues.join(', ')}`,
            `\n\`\`\`\nAverage: ${average.toFixed(1)}\nAbove Average Sales total: ${aboveAverageTotal}`,
          )}
        />
      </div>
    </div>
  );
}
