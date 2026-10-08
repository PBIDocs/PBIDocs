'use client';

import { useState } from 'react';
import { FlaskConical, RefreshCw } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const PRODUCTS = ['Trail Runner Tire', 'Commuter Helmet', 'Repair Kit', 'Bike Lock'] as const;
type Product = (typeof PRODUCTS)[number];
type Status = 'Active' | 'Inactive';

const INITIAL_STATUS: Record<Product, Status> = {
  'Trail Runner Tire': 'Active',
  'Commuter Helmet': 'Active',
  'Repair Kit': 'Inactive',
  'Bike Lock': 'Inactive',
};

export function CalculatedTableRefreshPlayground() {
  const [status, setStatus] = useState<Record<Product, Status>>(INITIAL_STATUS);
  const [snapshot, setSnapshot] = useState<Record<Product, Status>>(INITIAL_STATUS);

  const liveActive = PRODUCTS.filter((p) => status[p] === 'Active');
  const snapshotActive = PRODUCTS.filter((p) => snapshot[p] === 'Active');
  const diverges = liveActive.join(',') !== snapshotActive.join(',');

  function toggle(p: Product) {
    setStatus((prev) => ({ ...prev, [p]: prev[p] === 'Active' ? 'Inactive' : 'Active' }));
  }

  function refresh() {
    setSnapshot(status);
  }

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit Status, then compare before and after a refresh
      </p>

      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p} className="border-t border-fd-border">
                <td className="px-3 py-2 font-mono">{p}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    aria-label={`Toggle ${p} status`}
                    onClick={() => toggle(p)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 font-mono text-xs',
                      status[p] === 'Active'
                        ? 'border-fd-primary/40 bg-fd-primary/10 text-fd-primary'
                        : 'border-fd-border bg-fd-background text-fd-muted-foreground',
                    )}
                  >
                    {status[p]}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          className={cn(
            'rounded-lg border p-3',
            diverges ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-xs break-words">
            {highlightCode('ActiveProducts = FILTER(DimProduct, DimProduct[Status] = "Active")')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">calculated table — frozen as of last refresh</p>
          <p
            className={cn(
              'mt-1 font-mono text-sm font-semibold',
              diverges ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
            )}
          >
            {snapshotActive.length === 0 ? '(none)' : snapshotActive.join(', ')}
          </p>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">
            {highlightCode('Active Count = COUNTROWS(FILTER(DimProduct, DimProduct[Status] = "Active"))')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">measure — recalculates immediately</p>
          <p className="mt-1 font-mono text-sm font-semibold text-fd-primary">{liveActive.length}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={refresh}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-background px-3 py-1.5 text-xs font-medium hover:border-fd-primary"
      >
        <RefreshCw className="size-3.5" />
        Simulate a refresh
      </button>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — the Status values above have changed since the calculated table last refreshed, but{' '}
          <span className="font-mono">ActiveProducts</span> still lists whatever was true at that last refresh. The
          measure has no such lag — it reads the current Status values every time it&apos;s evaluated. Click{' '}
          <span className="font-mono">Simulate a refresh</span> to bring the calculated table back in sync.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — right now the calculated table and the measure agree, because nothing has changed since the last
          refresh. Toggle a product&apos;s Status to see them drift apart.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why the calculated table and the measure show different results here, even though they use the same filter logic:\n\n```\n',
            `Current Status: ${PRODUCTS.map((p) => `${p}=${status[p]}`).join(', ')}`,
            `\n\`\`\`\nActiveProducts (calculated table, last refresh): ${snapshotActive.join(', ') || '(none)'}\nActive Count (measure, live): ${liveActive.length}`,
          )}
        />
      </div>
    </div>
  );
}
