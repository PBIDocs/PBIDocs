'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

// The columns the fixed-list query was written against, back when the
// source table only had Jan/Feb/Mar. This list is frozen forever -- editing
// the "current" columns below never changes it, exactly like a real
// Table.Unpivot(Source, {"Jan","Feb","Mar"}, ...) step that was written once
// and never touched again.
const KEEP_COLUMN = 'Region';
const ORIGINAL_MONTH_COLUMNS = ['Jan', 'Feb', 'Mar'];

function parseColumns(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function UnpivotOtherColumnsPlayground() {
  const [columnsText, setColumnsText] = useState('Region, Jan, Feb, Mar, Apr');

  const currentColumns = parseColumns(columnsText);
  const currentMonthColumns = currentColumns.filter((c) => c !== KEEP_COLUMN);

  // Table.Unpivot(Source, {"Jan","Feb","Mar"}, "Month", "Sales") -- the
  // fixed list only ever unpivots columns it was literally told about,
  // whether or not they still exist or new ones have appeared since.
  const fixedListUnpivoted = ORIGINAL_MONTH_COLUMNS.filter((c) => currentColumns.includes(c));
  const missedByFixedList = currentMonthColumns.filter((c) => !ORIGINAL_MONTH_COLUMNS.includes(c));

  // Table.UnpivotOtherColumns(Source, {"Region"}, "Month", "Sales") --
  // recomputed from whatever the table's columns actually are right now.
  const otherColumnsUnpivoted = currentMonthColumns;

  const diverges = missedByFixedList.length > 0;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — add a new month column and see which query catches it
      </p>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-fd-muted-foreground">
          Source table&apos;s current columns (this quarter&apos;s export)
        </span>
        <input
          type="text"
          aria-label="Source table columns"
          value={columnsText}
          onChange={(e) => setColumnsText(e.target.value)}
          className="w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
        />
      </div>

      <p className="mt-2 text-xs text-fd-muted-foreground">
        This query was originally written when the source only had{' '}
        <span className="font-mono">{ORIGINAL_MONTH_COLUMNS.join(', ')}</span>. Try adding{' '}
        <span className="font-mono">Apr</span> (or removing it) to simulate a new month showing up later.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          className={cn(
            'rounded-lg border p-3',
            diverges ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
          )}
        >
          <div className="font-mono text-xs break-words">
            {highlightCode('Table.Unpivot(Source, {"Jan", "Feb", "Mar"}, "Month", "Sales")')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">&quot;Unpivot Columns&quot; — a fixed list, frozen at authoring time</p>
          <p className="mt-2 text-xs">
            Unpivots: <span className="font-mono">{fixedListUnpivoted.join(', ') || '(none)'}</span>
          </p>
          {missedByFixedList.length > 0 && (
            <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              Still sitting there as its own wide column: <span className="font-mono">{missedByFixedList.join(', ')}</span>
            </p>
          )}
        </div>

        <div className="rounded-lg border border-fd-border bg-fd-background p-3">
          <div className="font-mono text-xs break-words">
            {highlightCode('Table.UnpivotOtherColumns(Source, {"Region"}, "Month", "Sales")')}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            &quot;Unpivot Other Columns&quot; — recalculated from the table&apos;s actual current columns
          </p>
          <p className="mt-2 text-xs">
            Unpivots: <span className="font-mono">{otherColumnsUnpivoted.join(', ') || '(none)'}</span>
          </p>
        </div>
      </div>

      {diverges ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — {missedByFixedList.join(', ')} showed up in the source after this query was written. The fixed-list
          version never mentions it, so it&apos;s silently left as its own wide column instead of becoming{' '}
          {missedByFixedList.length === 1 ? 'a row' : 'rows'} in Month/Sales — no error, just quietly wrong
          output. UnpivotOtherColumns re-reads the table&apos;s actual columns every refresh, so it picks up{' '}
          {missedByFixedList.join(', ')} automatically.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — the source&apos;s current columns exactly match what the query was originally written for, so
          both versions agree. Add a new month column (or rename one of Jan/Feb/Mar) to see them diverge.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why Table.Unpivot with a fixed column list and Table.UnpivotOtherColumns produce different results here, once the source table gains a new column:\n\n```\n',
            `Source table's current columns: ${currentColumns.join(', ')}\nQuery originally written for: Region, ${ORIGINAL_MONTH_COLUMNS.join(', ')}\nTable.Unpivot(Source, {"Jan","Feb","Mar"}, "Month", "Sales") -> unpivots ${fixedListUnpivoted.join(', ') || '(none)'}`,
            `\n\`\`\`\nTable.UnpivotOtherColumns(Source, {"Region"}, "Month", "Sales") -> unpivots ${otherColumnsUnpivoted.join(', ') || '(none)'}`,
          )}
        />
      </div>
    </div>
  );
}
