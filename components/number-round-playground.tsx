'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

// digits >= 0: round to that many decimal places. digits < 0: round to the
// nearest 10^-digits (hundreds, thousands, ...) by shifting the decimal point.
// The scaled value is snapped to 9 decimals first so float noise
// (2.675 * 100 = 267.49999...) doesn't turn an exact tie into a non-tie.
function scale(value: number, digits: number): [number, number] {
  const factor = Math.pow(10, digits);
  return [Number((value * factor).toFixed(9)), factor];
}

function isExactTie(value: number, digits: number): boolean {
  const [scaled] = scale(value, digits);
  return Math.abs(scaled - Math.trunc(scaled)) === 0.5;
}

// Number.Round's default: RoundingMode.ToEven (banker's rounding) on an exact tie.
function roundToEven(value: number, digits: number): number {
  const [scaled, factor] = scale(value, digits);
  const floor = Math.floor(scaled);
  const diff = scaled - floor;
  let rounded: number;
  if (diff > 0.5) rounded = floor + 1;
  else if (diff < 0.5) rounded = floor;
  else rounded = floor % 2 === 0 ? floor : floor + 1;
  return rounded / factor;
}

// Number.RoundUp: the next highest number (a ceiling, toward +infinity).
function roundUp(value: number, digits: number): number {
  const [scaled, factor] = scale(value, digits);
  return Math.ceil(scaled) / factor;
}

// Number.RoundDown: the next lowest number (a floor, toward -infinity).
function roundDown(value: number, digits: number): number {
  const [scaled, factor] = scale(value, digits);
  return Math.floor(scaled) / factor;
}

// Number.RoundAwayFromZero: positives up, negatives down (what Excel's ROUNDUP does).
function roundAwayFromZero(value: number, digits: number): number {
  const [scaled, factor] = scale(value, digits);
  return (scaled >= 0 ? Math.ceil(scaled) : Math.floor(scaled)) / factor;
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

  const roundResult = inputsAreValid ? roundToEven(valueNum, digitsNum) : null;
  const upResult = inputsAreValid ? roundUp(valueNum, digitsNum) : null;
  const downResult = inputsAreValid ? roundDown(valueNum, digitsNum) : null;
  const awayResult = inputsAreValid ? roundAwayFromZero(valueNum, digitsNum) : null;
  const isTie = inputsAreValid && isExactTie(valueNum, digitsNum);

  const formula = `Number.Round(${value}, ${digits})\nNumber.RoundUp(${value}, ${digits})\nNumber.RoundDown(${value}, ${digits})\nNumber.RoundAwayFromZero(${value}, ${digits})`;

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

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <p className="text-xs text-fd-muted-foreground">RoundAwayFromZero</p>
          <p className="font-mono text-lg font-semibold text-fd-primary">
            {awayResult !== null ? formatResult(awayResult) : '—'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {!inputsAreValid && (
          <span className="text-xs text-fd-muted-foreground">— enter a number and a whole number of digits</span>
        )}
        {isTie && roundResult !== null && (
          <span className="text-xs text-fd-muted-foreground">
            — an exact tie: Round went to the even neighbour ({formatResult(roundResult)}), not away from
            zero as Excel and DAX ROUND would
          </span>
        )}
        {inputsAreValid && !isTie && valueNum < 0 && upResult !== null && awayResult !== null && (
          <span className="text-xs text-fd-muted-foreground">
            — RoundUp moved toward +∞ ({formatResult(upResult)}), which for a negative number means toward
            zero. Excel&apos;s ROUNDUP matches RoundAwayFromZero ({formatResult(awayResult)}) instead
          </span>
        )}
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why this Power Query M code returns the results shown:\n\n```\n',
            formula,
            `\n\`\`\`\nRound: ${roundResult !== null ? formatResult(roundResult) : 'invalid'}, RoundUp: ${upResult !== null ? formatResult(upResult) : 'invalid'}, RoundDown: ${downResult !== null ? formatResult(downResult) : 'invalid'}, RoundAwayFromZero: ${awayResult !== null ? formatResult(awayResult) : 'invalid'}`,
          )}
        />
      </div>
    </div>
  );
}
