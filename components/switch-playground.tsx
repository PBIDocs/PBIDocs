'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface Tier {
  threshold: string;
  label: string;
}

const initialTiers: Tier[] = [
  { threshold: '100000', label: 'Gold' },
  { threshold: '50000', label: 'Silver' },
  { threshold: '0', label: 'Bronze' },
];

export function SwitchPlayground() {
  const [testValue, setTestValue] = useState('120000');
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const [elseLabel, setElseLabel] = useState('No Sales');

  const value = Number.parseFloat(testValue);
  const valueIsValid = !Number.isNaN(value);

  let matchedIndex = -1;
  if (valueIsValid) {
    matchedIndex = tiers.findIndex((tier) => {
      const threshold = Number.parseFloat(tier.threshold);
      return !Number.isNaN(threshold) && value > threshold;
    });
  }

  const matchedLabel =
    matchedIndex >= 0
      ? tiers[matchedIndex].label.trim() === ''
        ? '(blank)'
        : tiers[matchedIndex].label
      : elseLabel.trim() === ''
        ? 'BLANK()'
        : elseLabel;

  function updateTier(index: number, field: keyof Tier, value: string) {
    setTiers((prev) => prev.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier)));
  }

  const formulaLines = [
    'SWITCH(',
    '    TRUE(),',
    ...tiers.map((tier) => `    [Total Sales] > ${tier.threshold || '0'}, "${tier.label}",`),
    `    "${elseLabel}"`,
    ')',
  ];
  const formula = formulaLines.join('\n');

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
            aria-invalid={!valueIsValid}
          />
        </PlaygroundRow>
        {tiers.map((tier, i) => (
          <PlaygroundRow key={i} label={`Condition ${i + 1}`} highlight={matchedIndex === i}>
            <span className="font-mono text-sm text-fd-muted-foreground">[Total Sales] &gt;</span>
            <input
              type="text"
              inputMode="decimal"
              aria-label={`Condition ${i + 1} threshold`}
              value={tier.threshold}
              onChange={(e) => updateTier(i, 'threshold', e.target.value)}
              className="w-20 min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            />
            <span className="text-fd-muted-foreground">&rarr;</span>
            <input
              type="text"
              aria-label={`Condition ${i + 1} result`}
              value={tier.label}
              onChange={(e) => updateTier(i, 'label', e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            />
          </PlaygroundRow>
        ))}
        <PlaygroundRow label="Else" highlight={matchedIndex === -1}>
          <input
            type="text"
            aria-label="Else result"
            value={elseLabel}
            onChange={(e) => setElseLabel(e.target.value)}
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </PlaygroundRow>
      </PlaygroundTable>

      <pre className="mt-4 overflow-x-auto rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm whitespace-pre">
        {highlightCode(formula)}
      </pre>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-fd-muted-foreground">Result:</span>
        <span
          className={
            matchedLabel === 'BLANK()'
              ? 'font-mono font-semibold text-fd-muted-foreground'
              : 'font-mono font-semibold text-fd-primary'
          }
        >
          &quot;{matchedLabel}&quot;
        </span>
        {!valueIsValid && (
          <span className="text-xs text-fd-muted-foreground">— enter a number for [Total Sales]</span>
        )}
        {valueIsValid && matchedIndex === -1 && (
          <span className="text-xs text-fd-muted-foreground">
            — nothing matched, so it fell through to the else result
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why this DAX returns the result shown:\n\n```\n',
            formula,
            `\n\`\`\`\nResult: "${matchedLabel}"`,
          )}
        />
      </div>
    </div>
  );
}
