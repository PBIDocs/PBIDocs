'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface RankedRow {
  value: number;
  skip: number;
  dense: number;
}

function computeRanks(values: number[]): RankedRow[] {
  const sorted = [...values].sort((a, b) => b - a);
  return sorted.map((value) => {
    const greater = sorted.filter((v) => v > value);
    const skip = greater.length + 1;
    const dense = new Set(greater).size + 1;
    return { value, skip, dense };
  });
}

export function RankxTiesPlayground() {
  const [valuesText, setValuesText] = useState('50000, 50000, 18000, 12000');

  const parsedValues = valuesText
    .split(',')
    .map((s) => Number.parseFloat(s.trim()))
    .filter((n) => !Number.isNaN(n));

  const rows = computeRanks(parsedValues);
  const firstDivergeIndex = rows.findIndex((r) => r.skip !== r.dense);
  const diverges = firstDivergeIndex !== -1;
  const tiedRank = diverges && firstDivergeIndex > 0 ? rows[firstDivergeIndex - 1].skip : null;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit the sales values to create or remove ties
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">[Total Sales] across products</span>
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
              <th className="px-3 py-2 text-left">Total Sales</th>
              <th className="px-3 py-2 text-left">
                RANKX(..., , DESC, <span className="font-mono">Skip</span>)
              </th>
              <th className="px-3 py-2 text-left">
                RANKX(..., , DESC, <span className="font-mono">Dense</span>)
              </th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((row, i) => (
              <tr key={`${row.value}-${i}`} className="border-t border-fd-border">
                <td className="px-3 py-2">{row.value}</td>
                <td className="px-3 py-2 text-fd-primary">{row.skip}</td>
                <td
                  className={cn(
                    'px-3 py-2',
                    row.skip !== row.dense ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-fd-primary',
                  )}
                >
                  {row.dense}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <div className="font-mono text-xs break-words">
          {highlightCode('RANKX(ALL(DimProduct), [Total Sales], , DESC, Skip | Dense)')}
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — {tiedRank !== null ? (
            <>
              the tied rows above share rank {tiedRank} under both options.
            </>
          ) : (
            <>The very first rows above are already tied.</>
          )}{' '}
          Right after that tie, <span className="font-mono">Skip</span> jumps ahead by however many rows were tied
          for it, while <span className="font-mono">Dense</span> moves to the very next rank with no gap — the two
          columns stay apart for the rest of the list from that point on.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — no ties in this list, so <span className="font-mono">Skip</span> and <span className="font-mono">
            Dense
          </span>{' '}
          produce identical ranks. Give two values the exact same number to see them diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why RANKX with Skip and Dense produce different ranks after a tie here:\n\n```\n',
            `Values: ${parsedValues.join(', ')}`,
            `\n\`\`\`\nSkip ranks: ${rows.map((r) => r.skip).join(', ')}\nDense ranks: ${rows.map((r) => r.dense).join(', ')}`,
          )}
        />
      </div>
    </div>
  );
}
