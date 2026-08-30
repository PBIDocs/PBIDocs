'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';

function formatNumber(n: number): string {
  // Round to 4 decimal places, then let toString() drop trailing zeros
  // (0.2400 -> "0.24"), same as how the result would actually display.
  return Number(n.toFixed(4)).toString();
}

export function DividePlayground() {
  const [numerator, setNumerator] = useState('120000');
  const [denominator, setDenominator] = useState('500000');
  const [alternateResult, setAlternateResult] = useState('');

  const num = Number.parseFloat(numerator);
  const denom = denominator.trim() === '' ? null : Number.parseFloat(denominator);
  const numIsValid = numerator.trim() === '' || !Number.isNaN(num);
  const denomIsValid = denominator.trim() === '' || (denom !== null && !Number.isNaN(denom));

  const effectiveNum = numerator.trim() === '' || Number.isNaN(num) ? 0 : num;
  const denomIsZeroOrBlank = denom === null || Number.isNaN(denom) || denom === 0;

  let resultDisplay: string;
  if (denomIsZeroOrBlank) {
    resultDisplay = alternateResult.trim() === '' ? 'BLANK()' : alternateResult.trim();
  } else {
    resultDisplay = formatNumber(effectiveNum / (denom as number));
  }

  const formula = `DIVIDE(${numerator || '0'}, ${denominator || 'BLANK()'}${
    alternateResult.trim() !== '' ? `, ${alternateResult}` : ''
  })`;

  return (
    <div className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-fd-muted-foreground">Numerator</span>
          <input
            type="text"
            inputMode="decimal"
            value={numerator}
            onChange={(e) => setNumerator(e.target.value)}
            className="rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={!numIsValid}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-fd-muted-foreground">Denominator</span>
          <input
            type="text"
            inputMode="decimal"
            value={denominator}
            onChange={(e) => setDenominator(e.target.value)}
            placeholder="0 or blank"
            className="rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            aria-invalid={!denomIsValid}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-fd-muted-foreground">Alternate result (optional)</span>
          <input
            type="text"
            inputMode="decimal"
            value={alternateResult}
            onChange={(e) => setAlternateResult(e.target.value)}
            placeholder="BLANK()"
            className="rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </label>
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode(formula)}
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
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
        {denomIsZeroOrBlank && (
          <span className="text-xs text-fd-muted-foreground">
            — denominator is {denom === null ? 'blank' : 'zero'}, so the fallback applies instead
            of dividing
          </span>
        )}
      </div>
    </div>
  );
}
