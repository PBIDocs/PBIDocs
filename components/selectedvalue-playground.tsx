'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

const CATEGORIES = ['Bikes', 'Accessories', 'Clothing'] as const;
type Category = (typeof CATEGORIES)[number];

export function SelectedValuePlayground() {
  const [selected, setSelected] = useState<Set<Category>>(new Set(['Bikes']));
  const [fallback, setFallback] = useState('Multiple Categories');

  const toggle = (category: Category) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const selectedList = CATEGORIES.filter((c) => selected.has(c));
  const result = selectedList.length === 1 ? selectedList[0] : fallback || 'BLANK()';
  const isFallback = selectedList.length !== 1;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — check zero, one, or multiple categories, like a real slicer
      </p>

      <p className="mb-2 text-xs font-semibold text-fd-muted-foreground">Category slicer</p>
      <div className="flex flex-wrap gap-4">
        {CATEGORIES.map((category) => (
          <label key={category} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.has(category)}
              onChange={() => toggle(category)}
              className="size-4 accent-fd-primary"
            />
            <span>{category}</span>
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">Fallback value (second argument)</span>
        <input
          type="text"
          aria-label="Fallback value"
          value={fallback}
          onChange={(e) => setFallback(e.target.value)}
          className="w-fit rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </div>

      <div className="mt-4">
        <div className="font-mono text-sm break-words">
          {highlightCode(`SELECTEDVALUE(DimProduct[Category], "${fallback}")`)}
        </div>
      </div>

      <div
        className={cn(
          'mt-3 rounded-lg border p-3',
          isFallback ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
        )}
      >
        <p className="text-xs text-fd-muted-foreground">
          {selectedList.length} categor{selectedList.length === 1 ? 'y' : 'ies'} selected
          {selectedList.length > 0 ? `: ${selectedList.join(', ')}` : ''}
        </p>
        <p
          className={cn(
            'mt-1 font-mono text-lg font-semibold',
            isFallback ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
          )}
        >
          &quot;{result}&quot;
        </p>
      </div>

      {isFallback ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — {selectedList.length === 0 ? 'nothing is checked' : `${selectedList.length} categories are checked at once`},
          so SELECTEDVALUE() can&apos;t name one specific value — it returns the fallback instead of guessing or
          combining them. Check exactly one box to see it return that category&apos;s actual name.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — exactly one category is checked, so SELECTEDVALUE() returns it directly. Check a second box, or
          uncheck the only one, to fall back.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain what SELECTEDVALUE returns here and why:\n\n```\n',
            `Categories checked: ${selectedList.length === 0 ? '(none)' : selectedList.join(', ')}\nFallback: "${fallback}"`,
            `\n\`\`\`\nSELECTEDVALUE(DimProduct[Category], "${fallback}") -> "${result}"`,
          )}
        />
      </div>
    </div>
  );
}
