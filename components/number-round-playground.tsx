'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

// digits >= 0: round to that many decimal places. digits < 0: round to the
// nearest 10^-digits (hundreds, thousands, ...) by shifting the decimal
// point before and after -- same idea Number.Round(value, -2) documents.
//
// Deliberately not JS's native Math.round(): it breaks an exact tie by
// rounding toward positive infinity (Math.round(-2.5) === -2), which
// contradicts the page's own documented "round half away from zero"
// behavior (Number.Round(-2.5, 0) -> -3). floor(x+0.5)/ceil(x-0.5) instead
// breaks the tie away from zero on both sides, matching that documented
// behavior rather than JS's built-in convention.
function roundTo(value: number, digits: number): number {
  const factor = Math.pow(10, digits);
  const scaled = value * factor;
  const rounded = value >= 0 ? Math.floor(scaled + 0.5) : Math.ceil(scaled - 0.5);
  return rounded / factor;
}

function roundUp(value: number, digits: number): number {
  const factor = Math.pow(10, digits);
  const scaled = value * factor;
  const away = value >= 0 ? Math.ceil(scaled) : Math.floor(scaled);
  return away / factor;
}

function roundDown(value: number, digits: number): number {
  const factor = Math.pow(10, digits);
  const scaled = value * factor;
  const toward = value >= 0 ? Math.floor(scaled) : Math.ceil(scaled);
  return toward / factor;
}

function formatResult(n: number): string {
  if (!Number.isFinite(n)) return 'N/A';
  return Number(n.toFixed(10)).toString();
}

export function NumberRoundPlayground() {
  const [value, setValue] = useState('-2.1');
  const [digits, setDigits] = useState('0');

  const valueNum = Number.parseFloat(value);
  const digitsNum = Number.parseInt(digits, 10);
  const inputsAreValid = !Number.isNaN(valueNum) && !Number.isNaN(digitsNum);

  const roundResult = inputsAreValid ? roundTo(valueNum, digitsNum) : null;
  const upResult = inputsAreValid ? roundUp(valueNum, digitsNum) : null;
  const downResult = inputsAreValid ? roundDown(valueNum, digitsNum) : null;

  const formula = `Number.Round(${value}, ${digits})\nNumber.RoundUp(${value}, ${digits})\nNumber.RoundDown(${value}, ${digits})`;

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
            aria-invalid={Number.isNaN(valueNum)}
          />
        </PlaygroundRow>
        <PlaygroundRow label="Digits">
          <input
            type="text"
            inputMode="numeric"
            aria-label="Digits"
            value={digits}
            onChange={(e) => setDigits(e.target.value)}
            placeholder="negative rounds to tens/hundreds/..."
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={Number.isNaN(digitsNum)}
          />
        </PlaygroundRow>
      </PlaygroundTable>

      <pre className="mt-4 overflow-x-auto rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm whitespace-pre">
        {highlightCode(formula)}
      </pre>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">Round</p>
          <p className="font-mono text-lg font-semibold text-fd-primary">
            {roundResult !== null ? formatResult(roundResult) : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">RoundUp</p>
          <p className="font-mono text-lg font-semibold text-fd-primary">
            {upResult !== null ? formatResult(upResult) : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">RoundDown</p>
          <p className="font-mono text-lg font-semibold text-fd-primary">
            {downResult !== null ? formatResult(downResult) : '—'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {!inputsAreValid && (
          <span className="text-xs text-fd-muted-foreground">— enter a number and a whole number of digits</span>
        )}
        {inputsAreValid && valueNum < 0 && upResult !== null && downResult !== null && (
          <span className="text-xs text-fd-muted-foreground">
            — RoundUp moved further from zero ({formatResult(upResult)}), RoundDown moved closer to
            zero ({formatResult(downResult)}) — &quot;up&quot; means away from zero, not toward +∞
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why this Power Query M code returns the results shown:\n\n```\n',
            formula,
            `\n\`\`\`\nRound: ${roundResult !== null ? formatResult(roundResult) : 'invalid'}, RoundUp: ${upResult !== null ? formatResult(upResult) : 'invalid'}, RoundDown: ${downResult !== null ? formatResult(downResult) : 'invalid'}`,
          )}
        />
      </div>
    </div>
  );
}
