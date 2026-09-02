'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

type FormatCode = 'none' | 'P' | 'N2' | 'F2';

const FORMAT_LABELS: Record<FormatCode, string> = {
  none: '(none)',
  P: '"P" (Percent)',
  N2: '"N2" (Number, grouped)',
  F2: '"F2" (Fixed, 2 decimals)',
};

function formatNumber(value: number, format: FormatCode): string {
  switch (format) {
    case 'none':
      return value.toString();
    case 'P':
      return `${(value * 100).toFixed(2)}%`;
    case 'N2':
      return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'F2':
      return value.toFixed(2);
  }
}

export function NumberToTextPlayground() {
  const [value, setValue] = useState('0.5');
  const [format, setFormat] = useState<FormatCode>('P');

  const num = Number.parseFloat(value);
  const valueIsValid = !Number.isNaN(num);
  const result = valueIsValid ? formatNumber(num, format) : null;

  const formula =
    format === 'none'
      ? `Number.ToText(${value || '0'})`
      : `Number.ToText(${value || '0'}, "${format}")`;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="Number">
          <input
            type="text"
            inputMode="decimal"
            aria-label="Number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={!valueIsValid}
          />
        </PlaygroundRow>
        <PlaygroundRow label="Format">
          <select
            value={format}
            aria-label="Format code"
            onChange={(e) => setFormat(e.target.value as FormatCode)}
            className="rounded-md border border-fd-border bg-fd-background px-2 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          >
            {(Object.keys(FORMAT_LABELS) as FormatCode[]).map((code) => (
              <option key={code} value={code}>
                {FORMAT_LABELS[code]}
              </option>
            ))}
          </select>
        </PlaygroundRow>
      </PlaygroundTable>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode(formula)}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-fd-muted-foreground">Result:</span>
        <span className="font-mono font-semibold text-fd-primary">
          {result !== null ? `"${result}"` : '—'}
        </span>
        {valueIsValid && format === 'P' && (
          <span className="text-xs text-fd-muted-foreground">
            — {num} × 100, not just {num} with a % sign appended.
          </span>
        )}
        {!valueIsValid && (
          <span className="text-xs text-fd-muted-foreground">— enter a number</span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain this Number.ToText() formatting result:\n\n```\n',
            formula,
            `\n\`\`\`\nResult: ${result !== null ? `"${result}"` : 'invalid input'}`,
          )}
        />
      </div>
    </div>
  );
}
