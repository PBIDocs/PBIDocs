'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { PlaygroundRow, PlaygroundTable } from '@/components/playground-table';

export function TextContainsPlayground() {
  const [text, setText] = useState('URGENT REVIEW');
  const [substring, setSubstring] = useState('urgent');
  const [ignoreCase, setIgnoreCase] = useState(false);

  const result = ignoreCase
    ? text.toLowerCase().includes(substring.toLowerCase())
    : text.includes(substring);

  const formula = `Text.Contains("${text}", "${substring}"${
    ignoreCase ? ', Comparer.OrdinalIgnoreCase' : ''
  })`;

  return (
    <div className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <PlaygroundTable>
        <PlaygroundRow label="Text">
          <input
            type="text"
            aria-label="Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          />
        </PlaygroundRow>
        <PlaygroundRow label="Substring">
          <input
            type="text"
            aria-label="Substring"
            value={substring}
            onChange={(e) => setSubstring(e.target.value)}
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
        {highlightCode(formula)}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-fd-muted-foreground">Result:</span>
        <span
          className={
            result ? 'font-mono font-semibold text-fd-primary' : 'font-mono font-semibold text-fd-muted-foreground'
          }
        >
          {result ? 'true' : 'false'}
        </span>
        {!result && !ignoreCase && text.toLowerCase().includes(substring.toLowerCase()) && (
          <span className="text-xs text-fd-muted-foreground">
            — it&apos;s in there, just in a different case; check the comparer box above
          </span>
        )}
      </div>
    </div>
  );
}
