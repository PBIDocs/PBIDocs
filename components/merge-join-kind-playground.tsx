'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface SalesRow {
  customerId: number;
  amount: number;
}

interface CustomerRow {
  customerId: number;
  name: string;
}

const SALES: SalesRow[] = [
  { customerId: 1, amount: 100 },
  { customerId: 2, amount: 200 },
  { customerId: 3, amount: 150 },
];

const CUSTOMERS: CustomerRow[] = [
  { customerId: 1, name: 'Alice' },
  { customerId: 2, name: 'Bob' },
  { customerId: 4, name: 'Dana' },
];

const JOIN_KINDS = ['Left Outer', 'Right Outer', 'Full Outer', 'Inner', 'Left Anti', 'Right Anti'] as const;
type JoinKind = (typeof JOIN_KINDS)[number];

interface ResultRow {
  customerId: number;
  amount: number | null;
  name: string | null;
}

// Anti joins are a filter, not an enrichment -- no columns from the other
// table are ever added, so they're kept out of the shared ResultRow shape
// and rendered from their own source rows directly instead.
function computeMatchRows(kind: Exclude<JoinKind, 'Left Anti' | 'Right Anti'>): ResultRow[] {
  if (kind === 'Inner') {
    return SALES.filter((s) => CUSTOMERS.some((c) => c.customerId === s.customerId)).map((s) => ({
      customerId: s.customerId,
      amount: s.amount,
      name: CUSTOMERS.find((c) => c.customerId === s.customerId)?.name ?? null,
    }));
  }
  if (kind === 'Left Outer') {
    return SALES.map((s) => ({
      customerId: s.customerId,
      amount: s.amount,
      name: CUSTOMERS.find((c) => c.customerId === s.customerId)?.name ?? null,
    }));
  }
  if (kind === 'Right Outer') {
    return CUSTOMERS.map((c) => ({
      customerId: c.customerId,
      amount: SALES.find((s) => s.customerId === c.customerId)?.amount ?? null,
      name: c.name,
    }));
  }
  // Full Outer: every Sales row (matched or not) plus any Customers row
  // that Sales never reached.
  const left = computeMatchRows('Left Outer');
  const rightOnly = CUSTOMERS.filter((c) => !SALES.some((s) => s.customerId === c.customerId)).map((c) => ({
    customerId: c.customerId,
    amount: null,
    name: c.name,
  }));
  return [...left, ...rightOnly];
}

const antiRowsLeft = SALES.filter((s) => !CUSTOMERS.some((c) => c.customerId === s.customerId));
const antiRowsRight = CUSTOMERS.filter((c) => !SALES.some((s) => s.customerId === c.customerId));

const JOIN_EXPLANATIONS: Record<JoinKind, string> = {
  'Left Outer': 'every Sales row survives — CustomerID 3 has no match, so Name comes back null.',
  'Right Outer': 'every Customers row survives — CustomerID 4 has no match, so Amount comes back null.',
  'Full Outer': 'every row from both tables survives — matched, Sales-only, and Customers-only alike.',
  Inner: 'only CustomerID 1 and 2 matched in both tables — 3 and 4 are dropped entirely.',
  'Left Anti': "only Sales rows with no Customers match survive, and no Name column is added — it's a filter, not an enrichment.",
  'Right Anti': "only Customers rows with no Sales match survive, and no Amount column is added — it's a filter, not an enrichment.",
};

export function MergeJoinKindPlayground() {
  const [joinKind, setJoinKind] = useState<JoinKind>('Left Outer');

  const isAnti = joinKind === 'Left Anti' || joinKind === 'Right Anti';
  const matchRows = isAnti ? [] : computeMatchRows(joinKind);
  const rowCount = joinKind === 'Left Anti' ? antiRowsLeft.length : joinKind === 'Right Anti' ? antiRowsRight.length : matchRows.length;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — merge Sales onto Customers by CustomerID
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="overflow-x-auto rounded-lg border border-fd-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
                <th className="px-3 py-2 text-left" colSpan={2}>
                  Sales (base table)
                </th>
              </tr>
              <tr className="border-t border-fd-border text-xs uppercase text-fd-muted-foreground">
                <th className="px-3 py-1.5 text-left">CustomerID</th>
                <th className="px-3 py-1.5 text-left">Amount</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {SALES.map((row) => (
                <tr key={row.customerId} className="border-t border-fd-border">
                  <td className="px-3 py-1.5">{row.customerId}</td>
                  <td className="px-3 py-1.5">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="overflow-x-auto rounded-lg border border-fd-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
                <th className="px-3 py-2 text-left" colSpan={2}>
                  Customers (merge-with table)
                </th>
              </tr>
              <tr className="border-t border-fd-border text-xs uppercase text-fd-muted-foreground">
                <th className="px-3 py-1.5 text-left">CustomerID</th>
                <th className="px-3 py-1.5 text-left">Name</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {CUSTOMERS.map((row) => (
                <tr key={row.customerId} className="border-t border-fd-border">
                  <td className="px-3 py-1.5">{row.customerId}</td>
                  <td className="px-3 py-1.5">{row.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">Join kind</span>
        <select
          aria-label="Join kind"
          value={joinKind}
          onChange={(e) => setJoinKind(e.target.value as JoinKind)}
          className="w-fit rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        >
          {JOIN_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-fd-primary/40 bg-fd-primary/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-primary/10 text-xs uppercase text-fd-primary">
              <th className="px-3 py-2 text-left" colSpan={joinKind === 'Left Anti' || joinKind === 'Right Anti' ? 2 : 3}>
                Result — {rowCount} row{rowCount === 1 ? '' : 's'}
              </th>
            </tr>
            <tr className="border-t border-fd-border text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-1.5 text-left">CustomerID</th>
              {joinKind === 'Right Anti' ? (
                <th className="px-3 py-1.5 text-left">Name</th>
              ) : joinKind === 'Left Anti' ? (
                <th className="px-3 py-1.5 text-left">Amount</th>
              ) : (
                <>
                  <th className="px-3 py-1.5 text-left">Amount</th>
                  <th className="px-3 py-1.5 text-left">Name</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="font-mono">
            {joinKind === 'Left Anti' &&
              antiRowsLeft.map((row) => (
                <tr key={row.customerId} className="border-t border-fd-border">
                  <td className="px-3 py-1.5">{row.customerId}</td>
                  <td className="px-3 py-1.5">{row.amount}</td>
                </tr>
              ))}
            {joinKind === 'Right Anti' &&
              antiRowsRight.map((row) => (
                <tr key={row.customerId} className="border-t border-fd-border">
                  <td className="px-3 py-1.5">{row.customerId}</td>
                  <td className="px-3 py-1.5">{row.name}</td>
                </tr>
              ))}
            {!isAnti &&
              matchRows.map((row, i) => (
                <tr key={`${row.customerId}-${i}`} className="border-t border-fd-border">
                  <td className="px-3 py-1.5">{row.customerId}</td>
                  <td className={cn('px-3 py-1.5', row.amount === null && 'text-fd-muted-foreground/60')}>
                    {row.amount ?? 'null'}
                  </td>
                  <td className={cn('px-3 py-1.5', row.name === null && 'text-fd-muted-foreground/60')}>
                    {row.name ?? 'null'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">— {JOIN_EXPLANATIONS[joinKind]}</p>

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            `Explain why a ${joinKind} merge of Sales onto Customers (matched on CustomerID) produces this exact result:\n\n\`\`\`\n`,
            `Sales: (1,100), (2,200), (3,150)\nCustomers: (1,Alice), (2,Bob), (4,Dana)\nJoin kind: ${joinKind}`,
            `\n\`\`\`\nResult: ${rowCount} row(s)`,
          )}
        />
      </div>
    </div>
  );
}
