'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface SourceRow {
  id: string;
  category: string;
  amount: string;
}

const initialRows: SourceRow[] = [
  { id: '1', category: 'Bikes', amount: '500' },
  { id: '2', category: 'bikes', amount: '750' },
  { id: '3', category: 'Accessories', amount: '300' },
  { id: '4', category: ' Accessories ', amount: '200' },
];

interface Group {
  key: string;
  total: number;
  count: number;
}

function textTrim(s: string): string {
  return s.trim();
}

function textProper(s: string): string {
  return s.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function groupRows(rows: SourceRow[], keyFn: (category: string) => string): Group[] {
  const map = new Map<string, Group>();
  for (const row of rows) {
    const amount = Number.parseFloat(row.amount);
    if (Number.isNaN(amount)) continue;
    const key = keyFn(row.category);
    const existing = map.get(key);
    if (existing) {
      existing.total += amount;
      existing.count += 1;
    } else {
      map.set(key, { key, total: amount, count: 1 });
    }
  }
  return [...map.values()];
}

export function TableGroupPlayground() {
  const [rows, setRows] = useState<SourceRow[]>(initialRows);

  const updateRow = (id: string, field: 'category' | 'amount', value: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const rawGroups = groupRows(rows, (c) => c);
  const cleanGroups = groupRows(rows, (c) => textProper(textTrim(c)));

  const diverges = rawGroups.length !== cleanGroups.length;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — edit a Category cell to see it merge or split
      </p>

      <p className="mb-2 text-xs font-semibold text-fd-muted-foreground">Source (one row per order)</p>
      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">SalesAmount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`Row ${row.id} category`}
                    value={row.category}
                    onChange={(e) => updateRow(row.id, 'category', e.target.value)}
                    className="w-36 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    aria-label={`Row ${row.id} amount`}
                    value={row.amount}
                    onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                    className="w-20 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
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
            {highlightCode('Table.Group(Source, {"Category"}, {{"TotalSales", each List.Sum([SalesAmount])}})')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">grouped on the raw Category text, as typed</p>
          <div className="mt-2 overflow-x-auto rounded-md border border-fd-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-fd-secondary/50 uppercase text-fd-muted-foreground">
                  <th className="px-2 py-1 text-left">Category</th>
                  <th className="px-2 py-1 text-left">TotalSales</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {rawGroups.map((g) => (
                  <tr key={g.key} className="border-t border-fd-border">
                    <td className="px-2 py-1">&quot;{g.key}&quot;</td>
                    <td className="px-2 py-1">{g.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            {rawGroups.length} group{rawGroups.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">
            {highlightCode('Table.Group(Source, {"CategoryClean"}, {{"TotalSales", each List.Sum([SalesAmount])}})')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            grouped after adding a cleaned column: Text.Proper(Text.Trim([Category]))
          </p>
          <div className="mt-2 overflow-x-auto rounded-md border border-fd-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-fd-secondary/50 uppercase text-fd-muted-foreground">
                  <th className="px-2 py-1 text-left">Category</th>
                  <th className="px-2 py-1 text-left">TotalSales</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {cleanGroups.map((g) => (
                  <tr key={g.key} className="border-t border-fd-border">
                    <td className="px-2 py-1">&quot;{g.key}&quot;</td>
                    <td className="px-2 py-1">{g.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            {cleanGroups.length} group{cleanGroups.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — {rawGroups.length} rows above look like the same {cleanGroups.length} real-world categories, but
          differ in casing or whitespace, so <span className="font-mono">Table.Group</span> treats each exact
          string as its own group. Cleaning first (Text.Proper + Text.Trim) collapses them back down to the{' '}
          {cleanGroups.length} groups that were actually intended, and merges their totals correctly instead of
          splitting them apart.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — every Category value already matches exactly (same casing, no stray whitespace), so both versions
          land on the same {rawGroups.length} group{rawGroups.length === 1 ? '' : 's'}. Change one row&apos;s
          casing or add a leading space to see them diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why grouping on the raw Category column produces more groups than expected here, and why cleaning first fixes it:\n\n```\n',
            `Source rows: ${rows.map((r) => `"${r.category}"=${r.amount}`).join(', ')}`,
            `\n\`\`\`\nGrouped on raw Category -> ${rawGroups.length} group(s)\nGrouped on Text.Proper(Text.Trim(Category)) -> ${cleanGroups.length} group(s)`,
          )}
        />
      </div>
    </div>
  );
}
