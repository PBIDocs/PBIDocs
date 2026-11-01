// Pure generation logic for the Time Intelligence Generator tool. Each
// calculation is defined once and rendered two ways: as a standalone measure
// (dependencies referenced by name) or as a calculation group item (the base
// becomes SELECTEDMEASURE() and dependencies are inlined).

import { daxTableRef, fiscalYearEndArg } from './date-table';

export type CalcId =
  | 'mtd'
  | 'qtd'
  | 'ytd'
  | 'py'
  | 'pm'
  | 'pytd'
  | 'yoy'
  | 'yoyPct'
  | 'momPct'
  | 'ytdYoyPct'
  | 'r3'
  | 'r12'
  | 'rt';

export interface TiOptions {
  baseMeasure: string;
  homeTable: string;
  dateTable: string;
  dateColumn: string;
  fiscalStartMonth: number; // 1 = calendar year
  selected: Record<CalcId, boolean>;
}

interface Ctx {
  base: string; // [Total Sales] or SELECTEDMEASURE()
  dates: string; // 'Date'[Date]
  yearEnd: string; // ', "6/30"' or ''
  ref: (id: CalcId) => string;
}

export interface CalcSpec {
  id: CalcId;
  suffix: string;
  group: 'Period to date' | 'Prior period' | 'Growth' | 'Rolling';
  label: string;
  description: string;
  percent?: boolean;
  deps?: CalcId[];
  dax: (ctx: Ctx) => string;
  // Month-grain mirror of the DAX, used for the preview table.
  preview: (m: MonthSeries, i: number) => number | null;
}

export interface MonthSeries {
  values: number[];
  months: number[]; // 1-12 per index
  fiscalStartMonth: number;
}

function sum(values: number[], from: number, to: number): number | null {
  if (from < 0) return null;
  let total = 0;
  for (let i = from; i <= to; i++) total += values[i];
  return total;
}

function ytdAt(m: MonthSeries, i: number): number | null {
  if (i < 0) return null;
  return sum(m.values, i - ((m.months[i] - m.fiscalStartMonth + 12) % 12), i);
}

function growth(current: number | null, prior: number | null): number | null {
  return current === null || prior === null || prior === 0 ? null : (current - prior) / prior;
}

const changeDax = (ctx: Ctx, priorId: CalcId, currentExpr: string, percent: boolean) =>
  [
    `VAR CurrentValue = ${currentExpr}`,
    `VAR PriorValue = ${ctx.ref(priorId)}`,
    'RETURN',
    percent
      ? '    IF(NOT ISBLANK(CurrentValue), DIVIDE(CurrentValue - PriorValue, PriorValue))'
      : '    IF(NOT ISBLANK(CurrentValue) && NOT ISBLANK(PriorValue), CurrentValue - PriorValue)',
  ].join('\n');

export const CALCS: CalcSpec[] = [
  {
    id: 'mtd',
    suffix: 'MTD',
    group: 'Period to date',
    label: 'Month to date',
    description: 'From the first of the month through the last date in context.',
    dax: (c) => `CALCULATE(${c.base}, DATESMTD(${c.dates}))`,
    preview: (m, i) => m.values[i],
  },
  {
    id: 'qtd',
    suffix: 'QTD',
    group: 'Period to date',
    label: 'Quarter to date',
    description: 'From the start of the calendar quarter. DATESQTD has no fiscal option.',
    dax: (c) => `CALCULATE(${c.base}, DATESQTD(${c.dates}))`,
    preview: (m, i) => sum(m.values, i - ((m.months[i] - 1) % 3), i),
  },
  {
    id: 'ytd',
    suffix: 'YTD',
    group: 'Period to date',
    label: 'Year to date',
    description: 'From the start of the (fiscal) year, restarting every year.',
    dax: (c) => `CALCULATE(${c.base}, DATESYTD(${c.dates}${c.yearEnd}))`,
    preview: ytdAt,
  },
  {
    id: 'py',
    suffix: 'PY',
    group: 'Prior period',
    label: 'Prior year',
    description: 'The same dates shifted back one year.',
    dax: (c) => `CALCULATE(${c.base}, SAMEPERIODLASTYEAR(${c.dates}))`,
    preview: (m, i) => (i >= 12 ? m.values[i - 12] : null),
  },
  {
    id: 'pm',
    suffix: 'PM',
    group: 'Prior period',
    label: 'Prior month',
    description: 'The same dates shifted back one month.',
    dax: (c) => `CALCULATE(${c.base}, DATEADD(${c.dates}, -1, MONTH))`,
    preview: (m, i) => (i >= 1 ? m.values[i - 1] : null),
  },
  {
    id: 'pytd',
    suffix: 'PYTD',
    group: 'Prior period',
    label: 'Prior year to date',
    description: 'Last year’s YTD up to the same point, for a like-for-like comparison.',
    deps: ['ytd'],
    dax: (c) => `CALCULATE(${c.ref('ytd')}, SAMEPERIODLASTYEAR(${c.dates}))`,
    preview: (m, i) => ytdAt(m, i - 12),
  },
  {
    id: 'yoy',
    suffix: 'YoY',
    group: 'Growth',
    label: 'Year-over-year change',
    description: 'Current minus prior year, blank when either side is missing.',
    deps: ['py'],
    dax: (c) => changeDax(c, 'py', c.base, false),
    preview: (m, i) => (i >= 12 ? m.values[i] - m.values[i - 12] : null),
  },
  {
    id: 'yoyPct',
    suffix: 'YoY %',
    group: 'Growth',
    label: 'Year-over-year %',
    description: 'Growth versus the prior year. DIVIDE returns blank instead of an error on zero.',
    percent: true,
    deps: ['py'],
    dax: (c) => changeDax(c, 'py', c.base, true),
    preview: (m, i) => (i >= 12 ? growth(m.values[i], m.values[i - 12]) : null),
  },
  {
    id: 'momPct',
    suffix: 'MoM %',
    group: 'Growth',
    label: 'Month-over-month %',
    description: 'Growth versus the prior month.',
    percent: true,
    deps: ['pm'],
    dax: (c) => changeDax(c, 'pm', c.base, true),
    preview: (m, i) => (i >= 1 ? growth(m.values[i], m.values[i - 1]) : null),
  },
  {
    id: 'ytdYoyPct',
    suffix: 'YTD YoY %',
    group: 'Growth',
    label: 'YTD vs prior YTD %',
    description: 'Year-to-date growth against the same point last year.',
    percent: true,
    deps: ['ytd', 'pytd'],
    dax: (c) => changeDax(c, 'pytd', c.ref('ytd'), true),
    preview: (m, i) => growth(ytdAt(m, i), ytdAt(m, i - 12)),
  },
  {
    id: 'r3',
    suffix: 'Rolling 3M',
    group: 'Rolling',
    label: 'Rolling 3 months',
    description: 'The three months ending on the last date in context.',
    dax: (c) => `CALCULATE(${c.base}, DATESINPERIOD(${c.dates}, MAX(${c.dates}), -3, MONTH))`,
    preview: (m, i) => sum(m.values, i - 2, i),
  },
  {
    id: 'r12',
    suffix: 'Rolling 12M',
    group: 'Rolling',
    label: 'Rolling 12 months',
    description: 'The twelve months ending on the last date in context. Smooths out seasonality.',
    dax: (c) => `CALCULATE(${c.base}, DATESINPERIOD(${c.dates}, MAX(${c.dates}), -12, MONTH))`,
    preview: (m, i) => sum(m.values, i - 11, i),
  },
  {
    id: 'rt',
    suffix: 'Running Total',
    group: 'Rolling',
    label: 'Running total',
    description: 'Everything from the first date in the table up to the last date in context.',
    dax: (c) => `CALCULATE(${c.base}, FILTER(ALL(${c.dates}), ${c.dates} <= MAX(${c.dates})))`,
    preview: (m, i) => sum(m.values, 0, i),
  },
];

const BY_ID = Object.fromEntries(CALCS.map((c) => [c.id, c])) as Record<CalcId, CalcSpec>;

export function cleanMeasureName(name: string): string {
  return name.trim().replace(/^\[/, '').replace(/\]$/, '').trim() || 'Total Sales';
}

function bracket(name: string): string {
  return `[${name.replace(/]/g, ']]')}]`;
}

function datesRef(opts: TiOptions): string {
  return `${daxTableRef(opts.dateTable.trim() || 'Date')}[${(opts.dateColumn.trim() || 'Date').replace(/]/g, ']]')}]`;
}

function yearEndArg(opts: TiOptions): string {
  return opts.fiscalStartMonth > 1 ? `, "${fiscalYearEndArg(opts.fiscalStartMonth)}"` : '';
}

export function measureName(opts: TiOptions, id: CalcId): string {
  return `${cleanMeasureName(opts.baseMeasure)} ${BY_ID[id].suffix}`;
}

export interface GeneratedMeasure {
  id: CalcId;
  name: string;
  expression: string;
  percent: boolean;
  requiredBy: CalcId[]; // non-empty when it's only here because another measure needs it
}

// Selected measures plus anything they reference, in catalog order so a
// measure is always defined after the ones it depends on.
export function generateMeasures(opts: TiOptions): GeneratedMeasure[] {
  const needed = new Map<CalcId, CalcId[]>();
  const visit = (id: CalcId, by?: CalcId) => {
    if (!needed.has(id)) needed.set(id, []);
    if (by && !opts.selected[id]) needed.get(id)!.push(by);
    BY_ID[id].deps?.forEach((dep) => visit(dep, id));
  };
  CALCS.filter((c) => opts.selected[c.id]).forEach((c) => visit(c.id));

  const ctx: Ctx = {
    base: bracket(cleanMeasureName(opts.baseMeasure)),
    dates: datesRef(opts),
    yearEnd: yearEndArg(opts),
    ref: (id) => bracket(measureName(opts, id)),
  };

  return CALCS.filter((c) => needed.has(c.id)).map((c) => ({
    id: c.id,
    name: measureName(opts, c.id),
    expression: c.dax(ctx),
    percent: Boolean(c.percent),
    requiredBy: [...new Set(needed.get(c.id))],
  }));
}

export function measureText(m: GeneratedMeasure): string {
  return `${m.name} =\n${m.expression}`;
}

export function generateQueryView(opts: TiOptions, measures: GeneratedMeasure[]): string {
  const home = daxTableRef(opts.homeTable.trim() || 'Sales');
  const lines = ['DEFINE'];
  for (const m of measures) {
    const body = m.expression.split('\n');
    if (body.length === 1) {
      lines.push(`    MEASURE ${home}${bracket(m.name)} = ${body[0]}`);
    } else {
      lines.push(`    MEASURE ${home}${bracket(m.name)} =`, ...body.map((l) => `        ${l}`));
    }
  }
  const dateTable = daxTableRef(opts.dateTable.trim() || 'Date');
  const base = cleanMeasureName(opts.baseMeasure);
  lines.push(
    '',
    '-- Assumes a Year column on the date table; swap in any column you have',
    'EVALUATE',
    '    SUMMARIZECOLUMNS(',
    `        ${dateTable}[Year],`,
    [`"${base}", ${bracket(base)}`, ...measures.map((m) => `"${m.name}", ${bracket(m.name)}`)]
      .map((pair) => `        ${pair}`)
      .join(',\n'),
    '    )',
  );
  return lines.join('\n');
}

export interface CalcItem {
  name: string;
  expression: string;
  percent: boolean;
}

export function generateCalcItems(opts: TiOptions): CalcItem[] {
  const ctx: Ctx = {
    base: 'SELECTEDMEASURE()',
    dates: datesRef(opts),
    yearEnd: yearEndArg(opts),
    ref: (id) => BY_ID[id].dax(ctx),
  };
  return [
    { name: 'Current', expression: 'SELECTEDMEASURE()', percent: false },
    ...CALCS.filter((c) => opts.selected[c.id]).map((c) => ({
      name: c.suffix,
      expression: c.dax(ctx),
      percent: Boolean(c.percent),
    })),
  ];
}

// Three years of made-up monthly sales with seasonality and growth, so the
// preview has a full prior year (and prior-year YTD) behind every row shown.
export const PREVIEW_START_YEAR = 2024;
const SEASON = [0.82, 0.78, 0.95, 0.98, 1.02, 1.0, 0.92, 0.94, 1.05, 1.1, 1.18, 1.36];

export function sampleSeries(fiscalStartMonth: number): MonthSeries {
  const values: number[] = [];
  const months: number[] = [];
  for (let i = 0; i < 36; i++) {
    const month = (i % 12) + 1;
    const year = Math.floor(i / 12);
    values.push(Math.round(10000 * SEASON[month - 1] * (1 + 0.08 * year) * (1 + ((i * 7) % 5) * 0.01)));
    months.push(month);
  }
  return { values, months, fiscalStartMonth };
}
