'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, Check, Copy, Plus, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import {
  DEFAULT_ROWS,
  generateDax,
  generateTitleMeasure,
  isComplete,
  parameterName,
  parsePastedFields,
  type FieldKind,
  type FieldRow,
} from '@/lib/field-parameters';

const inputClass =
  'w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

const iconButton =
  'flex size-7 shrink-0 items-center justify-center rounded-md border border-fd-border text-fd-muted-foreground transition-colors hover:bg-fd-accent disabled:opacity-40';

function CopyBlock({ title, help, code }: { title: string; help?: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold">{title}</p>
          {help && <p className="text-sm text-fd-muted-foreground">{help}</p>}
        </div>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
        <code>{highlightCode(code)}</code>
      </pre>
    </div>
  );
}

export function FieldParameterGenerator() {
  const [name, setName] = useState('Metric');
  const [rows, setRows] = useState<FieldRow[]>(DEFAULT_ROWS);
  const [useGroups, setUseGroups] = useState(false);
  const [paste, setPaste] = useState('');
  const [pasteErrors, setPasteErrors] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const nextKey = () => Math.max(0, ...rows.map((r) => r.key)) + 1;
  const updateRow = (key: number, patch: Partial<FieldRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const move = (index: number, by: number) =>
    setRows((rs) => {
      const next = [...rs];
      const [row] = next.splice(index, 1);
      next.splice(index + by, 0, row);
      return next;
    });

  function addPasted() {
    const { rows: added, errors } = parsePastedFields(paste, nextKey());
    setPasteErrors(errors);
    if (added.length) {
      setRows((rs) => [...rs.filter(isComplete), ...added]);
      if (added.some((r) => r.group)) setUseGroups(true);
      if (!errors.length) setPaste('');
    }
  }

  const opts = { name, rows, useGroups };
  const pName = parameterName(opts);
  const complete = rows.filter(isComplete);
  const dax = generateDax(opts);
  const titleMeasure = generateTitleMeasure(opts);

  const kinds = new Set(complete.map((r) => r.kind));
  const labels = complete.map((r) => r.label.trim() || r.field.trim());
  const duplicate = labels.find((l, i) => labels.indexOf(l) !== i);
  const warnings = [
    kinds.size > 1 &&
      'This mixes measures and columns. A visual can only use the parameter in one well (values or axis), so keep measures and columns in separate parameters.',
    complete.length > 10 && `${complete.length} options is a long slicer. Consider splitting it into two parameters.`,
    duplicate && `"${duplicate}" appears twice, so the slicer would show two identical options.`,
    rows.length > complete.length && 'Rows without both a table and a field are left out.',
  ].filter(Boolean) as string[];

  const groups = useGroups
    ? [...new Set(complete.map((r) => r.group.trim() || 'Other'))]
    : [null];
  const selectedRow = complete.find((r) => r.key === selected) ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-xl border border-fd-border p-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex w-48 flex-col gap-1.5 text-sm font-medium">
            Parameter name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className={cn(inputClass, 'px-3 py-2')}
            />
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={useGroups}
              onChange={(e) => setUseGroups(e.target.checked)}
              className="size-4 accent-fd-primary"
            />
            Group the options
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <div
            className={cn(
              'hidden gap-2 px-1 text-xs font-medium text-fd-muted-foreground sm:grid',
              useGroups ? 'sm:grid-cols-[1fr_1fr_1fr_6rem_6rem_5.5rem]' : 'sm:grid-cols-[1fr_1fr_1fr_6rem_5.5rem]',
            )}
          >
            <span>Shown as</span>
            <span>Table</span>
            <span>Measure or column</span>
            <span>Type</span>
            {useGroups && <span>Group</span>}
            <span />
          </div>
          {rows.map((row, i) => (
            <div
              key={row.key}
              className={cn(
                'grid grid-cols-2 gap-2 rounded-lg border border-fd-border p-2 sm:border-0 sm:p-0',
                useGroups ? 'sm:grid-cols-[1fr_1fr_1fr_6rem_6rem_5.5rem]' : 'sm:grid-cols-[1fr_1fr_1fr_6rem_5.5rem]',
              )}
            >
              <input
                aria-label="Shown as"
                placeholder="Shown as"
                value={row.label}
                onChange={(e) => updateRow(row.key, { label: e.target.value })}
                className={cn(inputClass, 'col-span-2 sm:col-span-1')}
              />
              <input
                aria-label="Table"
                placeholder="Table"
                value={row.table}
                onChange={(e) => updateRow(row.key, { table: e.target.value })}
                className={cn(inputClass, 'font-mono')}
              />
              <input
                aria-label="Measure or column"
                placeholder="Measure or column"
                value={row.field}
                onChange={(e) => updateRow(row.key, { field: e.target.value })}
                className={cn(inputClass, 'font-mono')}
              />
              <select
                aria-label="Type"
                value={row.kind}
                onChange={(e) => updateRow(row.key, { kind: e.target.value as FieldKind })}
                className={inputClass}
              >
                <option value="measure">Measure</option>
                <option value="column">Column</option>
              </select>
              {useGroups && (
                <input
                  aria-label="Group"
                  placeholder="Group"
                  value={row.group}
                  onChange={(e) => updateRow(row.key, { group: e.target.value })}
                  className={inputClass}
                />
              )}
              <div className="flex items-center justify-end gap-1">
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className={iconButton}>
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={i === rows.length - 1}
                  onClick={() => move(i, 1)}
                  className={iconButton}
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => setRows((rs) => rs.filter((r) => r.key !== row.key))}
                  className={iconButton}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setRows((rs) => [
                ...rs,
                { key: nextKey(), label: '', table: rs.at(-1)?.table ?? '', field: '', kind: rs.at(-1)?.kind ?? 'measure', group: '' },
              ])
            }
            className="flex w-fit items-center gap-1.5 rounded-md border border-fd-border px-3 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent"
          >
            <Plus className="size-3.5" />
            Add a field
          </button>
          <p className="text-xs text-fd-muted-foreground">
            The order here becomes the parameter&apos;s Order column, which is the order the slicer lists them in.
          </p>
        </div>

        <details className="rounded-lg border border-fd-border px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">Paste a list of fields</summary>
          <div className="mt-3 flex flex-col gap-2">
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              rows={4}
              spellCheck={false}
              placeholder={"FactSales[Total Cost]\nMargin %, FactSales[Margin Pct], Sales"}
              className={cn(inputClass, 'resize-y px-3 py-2 font-mono text-xs')}
            />
            <p className="text-xs text-fd-muted-foreground">
              One per line: <code>Table[Field]</code>, or <code>Label, Table[Field]</code>, optionally followed by{' '}
              <code>, Group</code>.
            </p>
            {pasteErrors.length > 0 && (
              <ul className="text-xs text-amber-700 dark:text-amber-300">
                {pasteErrors.slice(0, 4).map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={addPasted}
              disabled={!paste.trim()}
              className="w-fit rounded-md bg-fd-primary px-3 py-1.5 text-sm font-semibold text-fd-primary-foreground disabled:opacity-50"
            >
              Add these
            </button>
          </div>
        </details>

        {warnings.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
      </div>

      {complete.length > 0 && (
        <>
          <div className="grid items-start gap-6 md:grid-cols-[14rem_1fr]">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Slicer preview</h2>
              <div className="rounded-lg border border-fd-border bg-fd-card p-3">
                <p className="mb-2 text-xs font-semibold">{pName}</p>
                <div className="flex flex-col gap-1">
                  {groups.map((group) => (
                    <div key={group ?? 'all'} className="flex flex-col gap-1">
                      {group !== null && (
                        <p className="mt-1 text-[0.7rem] font-semibold tracking-wide text-fd-muted-foreground uppercase">
                          {group}
                        </p>
                      )}
                      {complete
                        .filter((r) => group === null || (r.group.trim() || 'Other') === group)
                        .map((r) => (
                          <button
                            key={r.key}
                            type="button"
                            onClick={() => setSelected(r.key === selected ? null : r.key)}
                            className={cn(
                              'flex items-center gap-2 rounded px-2 py-1 text-left text-sm transition-colors',
                              r.key === selected ? 'bg-fd-primary/10 font-medium' : 'hover:bg-fd-accent',
                            )}
                          >
                            <span
                              className={cn(
                                'size-3.5 shrink-0 rounded-sm border',
                                r.key === selected ? 'border-fd-primary bg-fd-primary' : 'border-fd-muted-foreground/50',
                              )}
                            />
                            {r.label.trim() || r.field.trim()}
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-fd-muted-foreground">
                {selectedRow ? (
                  <>
                    The visual now shows <code className="text-fd-foreground">{selectedRow.field.trim()}</code>, and{' '}
                    <code className="text-fd-foreground">Selected {pName}</code> returns &ldquo;
                    {selectedRow.label.trim() || selectedRow.field.trim()}&rdquo;.
                  </>
                ) : (
                  'Click an option to see what the visual swaps to.'
                )}
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-5 rounded-xl border border-fd-border p-5">
              <CopyBlock title="Field parameter table" code={dax} />
              <div className="flex flex-col gap-2 text-sm text-fd-muted-foreground">
                <p className="font-semibold text-fd-foreground">How to apply it</p>
                <ol className="flex list-decimal flex-col gap-1.5 pl-5">
                  <li>
                    <strong className="text-fd-foreground">Modeling → New parameter → Fields</strong>. Name it{' '}
                    <code className="text-fd-foreground">{pName}</code>, add any one field, and select Create.
                  </li>
                  <li>
                    Select the new <code className="text-fd-foreground">{pName}</code> table and replace its formula with
                    the DAX above.
                  </li>
                  {useGroups && (
                    <li>
                      A new column called <code className="text-fd-foreground">Value4</code> appears. Rename it to{' '}
                      <code className="text-fd-foreground">{pName} Group</code> and put it above{' '}
                      <code className="text-fd-foreground">{pName}</code> in the slicer to get the headings.
                    </li>
                  )}
                </ol>
                <p className="text-xs">
                  Pasting this into <em>New table</em> instead makes an ordinary table: Desktop only treats it as a field
                  parameter when it was created through the dialog.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-fd-border p-5">
            <CopyBlock
              title="Dynamic title measure (optional)"
              help={`Returns the option picked in the ${pName} slicer, or a list when several are picked. Use it with a visual's title fx button.`}
              code={titleMeasure}
            />
          </div>
        </>
      )}

      <p className="text-sm text-fd-muted-foreground">
        How field parameters work under the hood:{' '}
        <Link href="/docs/visuals/field-parameters" className="text-fd-primary hover:underline">
          Field Parameters
        </Link>
        .
      </p>
    </div>
  );
}
