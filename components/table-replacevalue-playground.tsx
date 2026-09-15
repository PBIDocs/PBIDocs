'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface Row {
  id: string;
  notes: string;
  status: string;
}

const initialRows: Row[] = [
  { id: '1', notes: 'N/A', status: 'N/A' },
  { id: '2', notes: 'Status: N/A for now', status: 'Active' },
  { id: '3', notes: 'Complete', status: 'N/A' },
];

type Replacer = 'Replacer.ReplaceValue' | 'Replacer.ReplaceText';

function applyReplace(cell: string, searched: boolean, replacer: Replacer): string {
  if (!searched) return cell;
  if (replacer === 'Replacer.ReplaceValue') {
    return cell === 'N/A' ? '' : cell;
  }
  return cell.split('N/A').join('');
}

function stillHasPlaceholder(cell: string): boolean {
  return cell.includes('N/A');
}

export function TableReplaceValuePlayground() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [searchNotes, setSearchNotes] = useState(true);
  const [searchStatus, setSearchStatus] = useState(false);
  const [replacer, setReplacer] = useState<Replacer>('Replacer.ReplaceValue');

  const updateRow = (id: string, field: 'notes' | 'status', value: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const columnList = [searchNotes && '"Notes"', searchStatus && '"Status"'].filter(Boolean).join(', ') || '(none)';

  const computed = rows.map((r) => ({
    ...r,
    notesOut: applyReplace(r.notes, searchNotes, replacer),
    statusOut: applyReplace(r.status, searchStatus, replacer),
  }));

  const missedCount = computed.filter((r) => stillHasPlaceholder(r.notesOut) || stillHasPlaceholder(r.statusOut)).length;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — check both columns and switch the replacer to catch everything
      </p>

      <p className="mb-2 text-xs font-semibold text-fd-muted-foreground">Source table</p>
      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Notes</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`Row ${row.id} notes`}
                    value={row.notes}
                    onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                    className="w-48 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`Row ${row.id} status`}
                    value={row.status}
                    onChange={(e) => updateRow(row.id, 'status', e.target.value)}
                    className="w-28 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2 text-sm">
          <span className="text-fd-muted-foreground">columnsToSearch</span>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={searchNotes}
              onChange={(e) => setSearchNotes(e.target.checked)}
              className="size-4 accent-fd-primary"
            />
            <span>&quot;Notes&quot;</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={searchStatus}
              onChange={(e) => setSearchStatus(e.target.checked)}
              className="size-4 accent-fd-primary"
            />
            <span>&quot;Status&quot;</span>
          </label>
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-fd-muted-foreground">replacer</span>
          <select
            aria-label="Replacer function"
            value={replacer}
            onChange={(e) => setReplacer(e.target.value as Replacer)}
            className="rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-fd-primary"
          >
            <option value="Replacer.ReplaceValue">Replacer.ReplaceValue</option>
            <option value="Replacer.ReplaceText">Replacer.ReplaceText</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <div className="font-mono text-xs break-words">
          {highlightCode(`Table.ReplaceValue(Source, "N/A", "", ${replacer}, {${columnList}})`)}
        </div>
      </div>

      <p className="mb-2 mt-3 text-xs font-semibold text-fd-muted-foreground">Result</p>
      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Notes</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {computed.map((row) => (
              <tr key={row.id} className="border-t border-fd-border">
                <td
                  className={cn(
                    'px-3 py-2',
                    stillHasPlaceholder(row.notesOut) && 'bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400',
                  )}
                >
                  {row.notesOut || <span className="text-fd-muted-foreground/50">(empty)</span>}
                </td>
                <td
                  className={cn(
                    'px-3 py-2',
                    stillHasPlaceholder(row.statusOut) && 'bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400',
                  )}
                >
                  {row.statusOut || <span className="text-fd-muted-foreground/50">(empty)</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {missedCount > 0 ? (
        <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
          — {missedCount} row{missedCount === 1 ? ' still has' : 's still have'} an untouched &quot;N/A&quot;,
          highlighted above. No error, no warning — either the column holding it isn&apos;t in{' '}
          <span className="font-mono">columnsToSearch</span>, or it&apos;s sitting inside a longer string that{' '}
          <span className="font-mono">Replacer.ReplaceValue</span>&apos;s exact-match check doesn&apos;t catch.
          Check both columns and switch to <span className="font-mono">Replacer.ReplaceText</span> to catch every
          case.
        </p>
      ) : (
        <p className="mt-3 text-xs text-fd-muted-foreground">
          — every placeholder is gone. Uncheck a column, or switch back to{' '}
          <span className="font-mono">Replacer.ReplaceValue</span>, to see one get silently missed again.
        </p>
      )}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why some "N/A" placeholders are still present in the result here:\n\n```\n',
            `Source Notes: ${rows.map((r) => `"${r.notes}"`).join(', ')}\nSource Status: ${rows.map((r) => `"${r.status}"`).join(', ')}\nTable.ReplaceValue(Source, "N/A", "", ${replacer}, {${columnList}})`,
            `\n\`\`\`\nResult still contains "N/A" in ${missedCount} row(s)`,
          )}
        />
      </div>
    </div>
  );
}
