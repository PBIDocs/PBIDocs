'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface StepRow {
  item: number;
  correctState: number;
  mistakeState: number;
}

function computeSteps(seed: number, values: number[]): StepRow[] {
  let correctState = seed;
  let mistakeState = seed;
  return values.map((item) => {
    // Correct: (state, current) => state - current
    correctState = correctState - item;
    // Mistake: (current, state) => state - current, called positionally as
    // (actualState, actualItem) -- so "current" is bound to actualState and
    // "state" is bound to actualItem, making the expression actualItem - actualState.
    mistakeState = item - mistakeState;
    return { item, correctState, mistakeState };
  });
}

export function ListAccumulatePlayground() {
  const [seedText, setSeedText] = useState('100');
  const [valuesText, setValuesText] = useState('20, 5, 3, 2');

  const seed = Number.parseFloat(seedText) || 0;
  const parsedValues = valuesText
    .split(',')
    .map((s) => Number.parseFloat(s.trim()))
    .filter((n) => !Number.isNaN(n));

  const steps = computeSteps(seed, parsedValues);
  const finalCorrect = steps.length > 0 ? steps[steps.length - 1].correctState : seed;
  const finalMistake = steps.length > 0 ? steps[steps.length - 1].mistakeState : seed;
  const diverges = finalCorrect !== finalMistake;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit the seed and list, then compare the two argument orders
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="text-fd-muted-foreground">Seed</span>
          <input
            type="text"
            aria-label="Seed"
            value={seedText}
            onChange={(e) => setSeedText(e.target.value)}
            className="w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </div>
        <div className="flex flex-[2] flex-col gap-1.5 text-sm">
          <span className="text-fd-muted-foreground">List values</span>
          <input
            type="text"
            aria-label="List values"
            value={valuesText}
            onChange={(e) => setValuesText(e.target.value)}
            className="w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">List item</th>
              <th className="px-3 py-2 text-left">(state, current) =&gt; state - current</th>
              <th className="px-3 py-2 text-left">(current, state) =&gt; state - current</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-t border-fd-border text-fd-muted-foreground">
              <td className="px-3 py-2">seed</td>
              <td className="px-3 py-2">{seed}</td>
              <td className="px-3 py-2">{seed}</td>
            </tr>
            {steps.map((row, i) => (
              <tr key={i} className="border-t border-fd-border">
                <td className="px-3 py-2">{row.item}</td>
                <td className="px-3 py-2 text-fd-primary">{row.correctState}</td>
                <td
                  className={cn(
                    'px-3 py-2',
                    diverges ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-fd-primary',
                  )}
                >
                  {row.mistakeState}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <div className="font-mono text-xs break-words">
          {highlightCode(
            `List.Accumulate({${parsedValues.join(', ')}}, ${seed}, (state, current) => state - current)`,
          )}
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — <span className="font-mono">List.Accumulate()</span> always passes the running state first and the list
          item second, no matter what the parameters are named. Writing{' '}
          <span className="font-mono">(current, state) =&gt; state - current</span> binds the actual running state
          to the name <span className="font-mono">current</span> and the actual list item to the name{' '}
          <span className="font-mono">state</span> — so the expression <span className="font-mono">state - current</span>{' '}
          really computes <span className="font-mono">item - runningState</span>, backwards, at every single step.
          The final result ({finalMistake}) lands nowhere near the correct one ({finalCorrect}), with no error at
          any point.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — with these particular values, both orderings happen to land on the same number by coincidence. Change
          the seed or values to see them diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why swapping the accumulator parameter names here silently changes the result, with no error:\n\n```\n',
            `Seed: ${seed}, Values: ${parsedValues.join(', ')}`,
            `\n\`\`\`\nCorrect final state ((state, current) => state - current): ${finalCorrect}\nMistaken final state ((current, state) => state - current): ${finalMistake}`,
          )}
        />
      </div>
    </div>
  );
}
