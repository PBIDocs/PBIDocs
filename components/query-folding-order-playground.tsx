'use client';

import { useState } from 'react';
import { FlaskConical, Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const BASE_STEPS = ['Filter Rows', 'Remove Columns', 'Group By'] as const;
const POSITIONS = [1, 2, 3, 4] as const;

function buildStepList(customColumnPosition: number): string[] {
  const steps = [...BASE_STEPS] as string[];
  steps.splice(customColumnPosition - 1, 0, 'Custom Column');
  return steps;
}

export function QueryFoldingOrderPlayground() {
  const [position, setPosition] = useState(4);

  const steps = buildStepList(position);
  const statuses = steps.reduce<{ step: string; folds: boolean }[]>((acc, step) => {
    const brokenYet = acc.some((s) => !s.folds);
    const folds = step === 'Custom Column' ? false : !brokenYet;
    return [...acc, { step, folds }];
  }, []);

  const firstLocalIndex = statuses.findIndex((s) => !s.folds);

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — move Custom Column earlier or later in the step order
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">Custom Column position</span>
        <select
          aria-label="Custom Column position"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="w-40 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        >
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p === 1 ? '1st (before everything)' : p === 4 ? '4th (last)' : `${p}${p === 2 ? 'nd' : 'rd'}`}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Applied Step</th>
              <th className="px-3 py-2 text-left">Query Folding</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {statuses.map((s, i) => (
              <tr
                key={i}
                className={cn(
                  'border-t border-fd-border',
                  i === firstLocalIndex && s.step === 'Custom Column' && 'bg-amber-500/10',
                )}
              >
                <td className="px-3 py-2">{s.step}</td>
                <td className="px-3 py-2">
                  {s.folds ? (
                    <span className="inline-flex items-center gap-1 text-fd-primary">
                      <Check className="size-3.5" /> folds at source
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <X className="size-3.5" /> runs locally
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        {position === 4 ? (
          <>
            — with <span className="font-mono">Custom Column</span> last, every foldable step before it still folds
            at the source. Only the custom column itself runs locally.
          </>
        ) : (
          <>
            — the moment <span className="font-mono">Custom Column</span> appears in position {position}, folding
            stops for good — every step after it runs locally too, even though{' '}
            {steps
              .slice(position)
              .map((s) => `"${s}"`)
              .join(' and ')}{' '}
            could have folded perfectly well on {steps.slice(position).length === 1 ? 'its' : 'their'} own in a
            different order.
          </>
        )}
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why moving Custom Column earlier in the step order breaks folding for every step after it, not just that one step:\n\n```\n',
            `Step order: ${steps.join(' -> ')}`,
            `\n\`\`\`\nFolding status: ${statuses.map((s) => `${s.step}=${s.folds ? 'folds' : 'local'}`).join(', ')}`,
          )}
        />
      </div>
    </div>
  );
}
