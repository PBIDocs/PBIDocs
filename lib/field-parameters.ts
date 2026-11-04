// Pure logic for the Field Parameter Generator tool. Output matches the table
// Desktop writes for Modeling > New parameter > Fields: one tuple per field of
// (display name, NAMEOF(field), order), plus an optional group as a 4th value.

import { daxTableRef } from './date-table';

export type FieldKind = 'measure' | 'column';

export interface FieldRow {
  key: number;
  label: string;
  table: string;
  field: string;
  kind: FieldKind;
  group: string;
}

export interface ParameterOptions {
  name: string;
  rows: FieldRow[];
  useGroups: boolean;
}

function daxText(text: string): string {
  return `"${text.replace(/"/g, '""')}"`;
}

export function fieldRef(row: Pick<FieldRow, 'table' | 'field'>): string {
  return `${daxTableRef(row.table.trim())}[${row.field.trim().replace(/]/g, ']]')}]`;
}

export const isComplete = (row: FieldRow) => row.table.trim() !== '' && row.field.trim() !== '';

export function parameterName(opts: ParameterOptions): string {
  return opts.name.trim() || 'Parameter';
}

export function generateDax(opts: ParameterOptions): string {
  const rows = opts.rows.filter(isComplete);
  const tuples = rows.map((row, i) => {
    const values = [daxText(row.label.trim() || row.field.trim()), `NAMEOF(${fieldRef(row)})`, String(i)];
    if (opts.useGroups) values.push(daxText(row.group.trim() || 'Other'));
    return `    (${values.join(', ')})`;
  });
  return [`${parameterName(opts)} = {`, tuples.join(',\n'), '}'].join('\n');
}

export function generateTitleMeasure(opts: ParameterOptions): string {
  const name = parameterName(opts);
  const table = daxTableRef(name);
  return [
    `Selected ${name} =`,
    `VAR Picked = VALUES(${table}[${name.replace(/]/g, ']]')}])`,
    'RETURN',
    '    IF(',
    '        COUNTROWS(Picked) = 1,',
    '        Picked,',
    `        CONCATENATEX(Picked, ${table}[${name.replace(/]/g, ']]')}], ", ")`,
    '    )',
  ].join('\n');
}

const REF = /^'?(.+?)'?\[(.+)\]$/;

// Bulk paste: one field per line as Table[Field], or "Label, Table[Field]",
// optionally followed by ", Group". Tabs work too.
export function parsePastedFields(text: string, startKey: number): { rows: FieldRow[]; errors: string[] } {
  const rows: FieldRow[] = [];
  const errors: string[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const cells = (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.trim());
    const refIndex = cells.findIndex((c) => REF.test(c));
    if (refIndex === -1) {
      errors.push(`Line ${i + 1}: no Table[Field] reference found in "${line}".`);
      return;
    }
    const [, table, field] = REF.exec(cells[refIndex])!;
    rows.push({
      key: startKey + rows.length,
      label: refIndex > 0 ? cells.slice(0, refIndex).join(', ') : field,
      table,
      field,
      kind: 'measure',
      group: cells.slice(refIndex + 1).join(', '),
    });
  });
  return { rows, errors };
}

// The Metric parameter from the Field Parameters page, with its display renames.
export const DEFAULT_ROWS: FieldRow[] = [
  { key: 1, label: 'Revenue', table: 'FactSales', field: 'Total Sales', kind: 'measure', group: 'Sales' },
  { key: 2, label: 'Profit', table: 'FactSales', field: 'Total Profit', kind: 'measure', group: 'Sales' },
  { key: 3, label: 'Units', table: 'FactSales', field: 'Total Units', kind: 'measure', group: 'Volume' },
];
