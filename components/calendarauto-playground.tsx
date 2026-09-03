'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';
import { cn } from '@/lib/cn';

interface ColumnRow {
  id: string;
  table: string;
  column: string;
  min: string;
  max: string;
}

const initialRows: ColumnRow[] = [
  { id: '1', table: 'Sales', column: 'OrderDate', min: '2024-01-01', max: '2026-06-30' },
  { id: '2', table: 'Sales', column: 'ShipDate', min: '2024-01-03', max: '2026-07-05' },
  { id: '3', table: 'AuditLog', column: 'CreatedDate', min: '1900-01-01', max: '2026-08-01' },
];

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());
}

export function CalendarAutoPlayground() {
  const [rows, setRows] = useState<ColumnRow[]>(initialRows);

  const updateRow = (id: string, field: 'min' | 'max', value: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const validRows = rows.filter((r) => isValidDate(r.min) && isValidDate(r.max));
  const allValid = validRows.length === rows.length;

  const overallMin = allValid ? validRows.reduce((m, r) => (r.min < m ? r.min : m), validRows[0].min) : null;
  const overallMax = allValid ? validRows.reduce((m, r) => (r.max > m ? r.max : m), validRows[0].max) : null;

  const factRow = rows[0];
  const intendedMin = factRow.min;
  const intendedMax = factRow.max;

  const widened = allValid && (overallMin !== intendedMin || overallMax !== intendedMax);

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — every date/datetime column in this made-up model
      </p>

      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">Table.Column</th>
              <th className="px-3 py-2 text-left">Min Date</th>
              <th className="px-3 py-2 text-left">Max Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-fd-border">
                <td className="px-3 py-2 font-mono text-xs text-fd-muted-foreground">
                  {row.table}[{row.column}]
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`${row.table} ${row.column} min date`}
                    value={row.min}
                    onChange={(e) => updateRow(row.id, 'min', e.target.value)}
                    className="w-32 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                    aria-invalid={!isValidDate(row.min)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    aria-label={`${row.table} ${row.column} max date`}
                    value={row.max}
                    onChange={(e) => updateRow(row.id, 'max', e.target.value)}
                    className="w-32 min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
                    aria-invalid={!isValidDate(row.max)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!allValid ? (
        <p className="mt-3 text-xs text-fd-muted-foreground">Enter valid dates (YYYY-MM-DD) for every row.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-fd-border bg-fd-background p-3">
            <div className="font-mono text-sm">
              {highlightCode(`CALENDAR(MIN(Sales[OrderDate]), MAX(Sales[OrderDate]))`)}
            </div>
            <p className="mt-2 font-mono text-sm font-semibold text-fd-primary">
              {intendedMin} … {intendedMax}
            </p>
            <p className="mt-1 text-xs text-fd-muted-foreground">scoped to the one column you actually meant</p>
          </div>
          <div
            className={cn(
              'rounded-lg border p-3',
              widened ? 'border-amber-500/40 bg-amber-500/10' : 'border-fd-border bg-fd-background',
            )}
          >
            <div className="font-mono text-sm">{highlightCode('CALENDARAUTO()')}</div>
            <p
              className={cn(
                'mt-1 font-mono text-sm font-semibold',
                widened ? 'text-amber-600 dark:text-amber-400' : 'text-fd-primary',
              )}
            >
              {overallMin} … {overallMax}
            </p>
            <p className="mt-1 text-xs text-fd-muted-foreground">scanned every date column in the whole model</p>
          </div>
        </div>
      )}

      {widened &&
        (() => {
          const minSource = validRows.find((r) => r.min === overallMin && r.id !== factRow.id);
          const maxSource = validRows.find((r) => r.max === overallMax && r.id !== factRow.id);
          const culprits = [minSource, maxSource]
            .filter((r): r is ColumnRow => Boolean(r))
            .filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i)
            .map((r) => `${r.table}[${r.column}]`);
          return (
            <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
              — CALENDARAUTO() widened the range to match{' '}
              {culprits.length > 0 ? culprits.join(' and ') : 'a column'}, which has nothing to do with sales
              reporting.
            </p>
          );
        })()}

      <div className="mt-3">
        <AskAiInlineButton
          prompt={buildAskAiPrompt(
            'Explain why CALENDARAUTO() produced a wider date range than CALENDAR() scoped to one column:\n\n```\n',
            rows.map((r) => `${r.table}[${r.column}]: ${r.min} to ${r.max}`).join('\n'),
            `\n\`\`\`\nCALENDAR() scoped: ${intendedMin} to ${intendedMax}\nCALENDARAUTO(): ${overallMin} to ${overallMax}`,
          )}
        />
      </div>
    </div>
  );
}
