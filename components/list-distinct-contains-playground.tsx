'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

function parseList(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function ListDistinctContainsPlayground() {
  const [listText, setListText] = useState('Apple, apple, Banana, BANANA, Cherry');
  const [search, setSearch] = useState('APPLE');
  const [ignoreCase, setIgnoreCase] = useState(false);

  const items = parseList(listText);

  const distinctKept: string[] = [];
  const seen = new Set<string>();
  const dropped: string[] = [];
  for (const item of items) {
    const key = ignoreCase ? item.toLowerCase() : item;
    if (seen.has(key)) {
      dropped.push(item);
    } else {
      seen.add(key);
      distinctKept.push(item);
    }
  }

  const contains = ignoreCase
    ? items.some((i) => i.toLowerCase() === search.toLowerCase())
    : items.includes(search);

  const listLiteral = `{${items.map((i) => `"${i}"`).join(', ')}}`;
  const comparerArg = ignoreCase ? ', Comparer.OrdinalIgnoreCase' : '';
  const distinctFormula = `List.Distinct(${listLiteral}${comparerArg})`;
  const containsFormula = `List.Contains(${listLiteral}, "${search}"${comparerArg})`;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="List">
          <input
            type="text"
            aria-label="List (comma-separated)"
            value={listText}
            onChange={(e) => setListText(e.target.value)}
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </PlaygroundRow>
        <PlaygroundRow label="Comparer">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="size-4 accent-fd-primary"
            />
            Comparer.OrdinalIgnoreCase (case-insensitive)
          </label>
        </PlaygroundRow>
      </PlaygroundTable>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        {highlightCode(distinctFormula)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">Result:</span>
        {distinctKept.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="rounded-md border border-fd-border bg-fd-secondary/50 px-2 py-0.5 font-mono text-xs font-semibold text-fd-primary"
          >
            {item}
          </span>
        ))}
        {dropped.length > 0 && (
          <span className="ml-1 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-fd-muted-foreground">dropped as duplicates:</span>
            {dropped.map((item, i) => (
              <span
                key={`${item}-dropped-${i}`}
                className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-xs text-amber-600 line-through dark:text-amber-400"
              >
                {item}
              </span>
            ))}
          </span>
        )}
      </div>

      <div className="mt-5 border-t border-fd-border pt-4">
        <PlaygroundTable>
          <PlaygroundRow label="Search value">
            <input
              type="text"
              aria-label="Search value"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
            />
          </PlaygroundRow>
        </PlaygroundTable>

        <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
          {highlightCode(containsFormula)}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-fd-muted-foreground">Result:</span>
          <span
            className={
              contains
                ? 'font-mono font-semibold text-fd-primary'
                : 'font-mono font-semibold text-fd-muted-foreground'
            }
          >
            {contains ? 'true' : 'false'}
          </span>
          {!contains &&
            !ignoreCase &&
            items.some((i) => i.toLowerCase() === search.toLowerCase()) && (
              <span className="text-xs text-fd-muted-foreground">
                — it&apos;s in the list, just in a different case; check the comparer box above
              </span>
            )}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why these Power Query M expressions return the results shown:\n\n```\n',
            `${distinctFormula}\nResult: {${distinctKept.join(', ')}}\n\n${containsFormula}`,
            `\n\`\`\`\nResult: ${contains}`,
          )}
        />
      </div>
    </div>
  );
}
