'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const PRODUCTS = ['Product A', 'Product B', 'Product C'] as const;

export function ListTransformVsAddColumnPlayground() {
  const [amounts, setAmounts] = useState<Record<(typeof PRODUCTS)[number], string>>({
    'Product A': '10',
    'Product B': '25',
    'Product C': '40',
  });

  const parsed = PRODUCTS.map((p) => ({
    product: p,
    amount: Number.parseFloat(amounts[p]) || 0,
  }));
  const doubledList = parsed.map((r) => r.amount * 2);

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit the amounts and compare what each one hands back
      </p>

      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p} className="border-t border-fd-border">
                <td className="px-3 py-2 font-mono">{p}</td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label={`${p} amount`}
                    value={amounts[p]}
                    onChange={(e) => setAmounts((prev) => ({ ...prev, [p]: e.target.value }))}
                    className="w-24 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-sm outline-none focus:border-fd-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">
            {highlightCode('List.Transform(Source[Amount], each _ * 2)')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">returns a bare list — no product names attached</p>
          <p className="mt-1 font-mono text-sm font-semibold text-fd-primary">{`{${doubledList.join(', ')}}`}</p>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">
            {highlightCode('Table.AddColumn(Source, "Doubled", each [Amount] * 2)')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">returns a table — Doubled stays attached to its row</p>
          <table className="mt-2 w-full text-xs">
            <thead>
              <tr className="text-fd-muted-foreground">
                <th className="px-1 py-1 text-left font-normal">Product</th>
                <th className="px-1 py-1 text-left font-normal">Amount</th>
                <th className="px-1 py-1 text-left font-normal">Doubled</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {parsed.map((r) => (
                <tr key={r.product} className="border-t border-fd-border/50">
                  <td className="px-1 py-1">{r.product}</td>
                  <td className="px-1 py-1">{r.amount}</td>
                  <td className="px-1 py-1 font-semibold text-fd-primary">{r.amount * 2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        — both sides compute the same doubled values, in the same order. The difference is what each one hands
        back: <span className="font-mono">List.Transform()</span> is just the three numbers, with nothing saying
        which product each one belongs to — reattaching them to the right row would need a separate step.{' '}
        <span className="font-mono">Table.AddColumn()</span> never detaches the result from its row in the first
        place.
      </p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why List.Transform() and Table.AddColumn() return such differently-shaped results here, even though the underlying math is identical:\n\n```\n',
            `Amounts: ${parsed.map((r) => `${r.product}=${r.amount}`).join(', ')}`,
            `\n\`\`\`\nList.Transform result: {${doubledList.join(', ')}}\nTable.AddColumn result: a table with Product, Amount, and Doubled columns`,
          )}
        />
      </div>
    </div>
  );
}
