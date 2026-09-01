'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

const DEFAULT_NAMES = 'Alice Chen\nBob Diaz\nMadonna';

export function TableSplitColumnPlayground() {
  const [namesText, setNamesText] = useState(DEFAULT_NAMES);

  const names = namesText
    .split('\n')
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  const rows = names.map((name) => {
    const parts = name.split(' ').filter((p) => p.length > 0);
    return {
      fullName: name,
      first: parts[0] ?? null,
      last: parts[1] ?? null,
      // Extra words beyond the 2 declared columns -- deliberately NOT given a
      // fixed fate here (dropped, merged, etc.). The page itself says this
      // depends on the splitter/configuration, not one universal rule, so
      // the playground flags it explicitly instead of picking a behavior
      // that would silently assert more confidence than the text does.
      extra: parts.slice(2),
    };
  });

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live
      </p>

      <label className="mb-4 flex flex-col gap-1 text-sm">
        <span className="text-fd-muted-foreground">Full Name column (one per line)</span>
        <textarea
          value={namesText}
          onChange={(e) => setNamesText(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </label>

      <p className="mb-2 font-mono text-xs text-fd-muted-foreground">
        Table.SplitColumn(Source, &quot;Full Name&quot;, Splitter.SplitTextByDelimiter(&quot; &quot;), {'{'}
        &quot;First Name&quot;, &quot;Last Name&quot;{'}'})
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-fd-muted-foreground">Enter at least one name above.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-fd-border">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="bg-fd-secondary/50 text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">
                <th className="px-3 py-2 text-left">First Name</th>
                <th className="px-3 py-2 text-left">Last Name</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-fd-border">
                  <td className="px-3 py-1.5 font-mono text-fd-foreground">{row.first}</td>
                  <td
                    className={cn(
                      'px-3 py-1.5 font-mono',
                      row.last === null
                        ? 'italic text-fd-muted-foreground'
                        : row.extra.length > 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-fd-foreground',
                    )}
                  >
                    {row.last === null ? 'null' : row.last}
                    {row.extra.length > 0 && (
                      <span className="ml-1 text-xs italic text-fd-muted-foreground">
                        (+&quot;{row.extra.join(' ')}&quot; not placed anywhere)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-1 text-sm">
        {rows.some((r) => r.last === null) && (
          <span className="text-xs text-fd-muted-foreground">
            — a row with only one word gets <code className="rounded bg-fd-secondary px-1 py-0.5">null</code> in
            Last Name, not an error and not a shifted row.
          </span>
        )}
        {rows.some((r) => r.extra.length > 0) && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            — a row with more than 2 words has leftover text this playground doesn&apos;t place
            anywhere on purpose: real Table.SplitColumn behavior for extra parts depends on the
            splitter/configuration used, not one fixed rule (see the section below).
          </span>
        )}
        <div className="mt-1">
          <AskAiInlineButton
            prompt={buildAskAiPrompt(
              'Explain this Table.SplitColumn() result, especially any null values or extra unplaced words:\n\n',
              `Full Name values: ${names.join(', ')}\nSplit into First Name / Last Name:\n${rows.map((r) => `${r.fullName} -> ${r.first}, ${r.last ?? 'null'}${r.extra.length > 0 ? ` (extra: ${r.extra.join(' ')})` : ''}`).join('\n')}`,
            )}
          />
        </div>
      </div>
    </div>
  );
}
