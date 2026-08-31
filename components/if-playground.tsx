'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const OPERATORS = ['>', '>=', '<', '<=', '=', '<>'] as const;
type Operator = (typeof OPERATORS)[number];

function compare(value: number, operator: Operator, threshold: number): boolean {
  switch (operator) {
    case '>':
      return value > threshold;
    case '>=':
      return value >= threshold;
    case '<':
      return value < threshold;
    case '<=':
      return value <= threshold;
    case '=':
      return value === threshold;
    case '<>':
      return value !== threshold;
  }
}

export function IfPlayground() {
  const [testValue, setTestValue] = useState('150000');
  const [operator, setOperator] = useState<Operator>('>');
  const [threshold, setThreshold] = useState('100000');
  const [resultIfTrue, setResultIfTrue] = useState('On Target');
  const [resultIfFalse, setResultIfFalse] = useState('Below Target');

  const value = Number.parseFloat(testValue);
  const thresholdValue = Number.parseFloat(threshold);
  const valuesAreValid = !Number.isNaN(value) && !Number.isNaN(thresholdValue);
  const conditionIsTrue = valuesAreValid && compare(value, operator, thresholdValue);

  const resultDisplay = conditionIsTrue
    ? resultIfTrue.trim() === ''
      ? '""'
      : `"${resultIfTrue.trim()}"`
    : resultIfFalse.trim() === ''
      ? 'BLANK()'
      : `"${resultIfFalse.trim()}"`;

  const formula = `IF([Total Sales] ${operator} ${threshold || '0'}, "${resultIfTrue}"${
    resultIfFalse.trim() !== '' ? `, "${resultIfFalse}"` : ''
  })`;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="[Total Sales]">
          <input
            type="text"
            inputMode="decimal"
            aria-label="Total Sales"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={Number.isNaN(value)}
          />
        </PlaygroundRow>
        <PlaygroundRow label="Condition">
          <select
            value={operator}
            aria-label="Comparison operator"
            onChange={(e) => setOperator(e.target.value as Operator)}
            className="rounded-md border border-fd-border bg-fd-background px-2 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          >
            {OPERATORS.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
          <input
            type="text"
            inputMode="decimal"
            aria-label="Threshold"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-24 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={Number.isNaN(thresholdValue)}
          />
        </PlaygroundRow>
        <PlaygroundRow label="Result if true">
          <input
            type="text"
            aria-label="Result if true"
            value={resultIfTrue}
            onChange={(e) => setResultIfTrue(e.target.value)}
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </PlaygroundRow>
        <PlaygroundRow label="Result if false (optional)">
          <input
            type="text"
            aria-label="Result if false"
            value={resultIfFalse}
            onChange={(e) => setResultIfFalse(e.target.value)}
            placeholder="leave blank for BLANK()"
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </PlaygroundRow>
      </PlaygroundTable>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode(formula)}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-fd-muted-foreground">Result:</span>
        <span
          className={
            resultDisplay === 'BLANK()'
              ? 'font-mono font-semibold text-fd-muted-foreground'
              : 'font-mono font-semibold text-fd-primary'
          }
        >
          {resultDisplay}
        </span>
        {!valuesAreValid && (
          <span className="text-xs text-fd-muted-foreground">
            — enter numbers for [Total Sales] and the threshold
          </span>
        )}
        {valuesAreValid && !conditionIsTrue && resultIfFalse.trim() === '' && (
          <span className="text-xs text-fd-muted-foreground">
            — the third argument was left out, so the false case returns BLANK()
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why this DAX returns the result shown:\n\n```\n',
            formula,
            `\n\`\`\`\nResult: ${resultDisplay}`,
          )}
        />
      </div>
    </div>
  );
}
