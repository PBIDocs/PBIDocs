// Pure logic for the Pareto Chart Builder tool and the Pareto tutorial. The
// ranking rules match the generated DAX exactly: an optional "Other" bucket
// always sorts last, then larger values first, then ties broken by name (A to
// Z, ignoring case, the way DAX compares text). The cumulative share of each
// bar is everything ranked at or above it, so the line steps up once per bar.

export type Metric = 'count' | 'cost';

export interface ParetoItem {
  cause: string;
  count: number;
  cost: number | null;
}

export interface ParetoSettings {
  metric: Metric;
  threshold: number; // percent, e.g. 80
  otherLast: boolean;
}

export const DEFAULT_SETTINGS: ParetoSettings = { metric: 'count', threshold: 80, otherLast: true };

export interface ParetoRow {
  rank: number;
  cause: string;
  value: number;
  share: number; // 0..1
  cumulative: number;
  cumShare: number; // 0..1
  vital: boolean;
  isOther: boolean;
  tied: boolean;
}

export interface ParetoResult {
  rows: ParetoRow[];
  total: number;
  vitalCount: number;
  vitalShare: number; // cumulative share of the last vital cause
}

export const isOtherCause = (cause: string) => cause.trim().toLowerCase() === 'other';

const compareNames = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' });

const NUMBER = /^-?\$?\d+(\.\d+)?$/;
const toNumber = (text: string) => Number(text.replace('$', ''));
const HEADER = /^(cause|causes|category|categories|defect|defects|defect type|reason|reasons|type|issue|failure)$/i;

// One line per cause ("Cause, Count" or "Cause, Count, Cost"), or one line per
// defect (just the cause, counted once). Tabs or commas. Repeated causes are
// added together, matching case-insensitively the way a DAX column groups them.
export function parseItems(text: string): { items: ParetoItem[]; hasCost: boolean; errors: string[] } {
  const byKey = new Map<string, ParetoItem>();
  const errors: string[] = [];
  let firstLine = true;
  let withCost = 0;
  let withoutCost = 0;
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const isFirst = firstLine;
    firstLine = false;
    const cells = (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.trim());
    const cause = cells[0];
    let count = 1;
    let cost: number | null = null;
    if (cells.length === 1) {
      if (isFirst && HEADER.test(cause)) return;
    } else {
      if (!NUMBER.test(cells[1]) || toNumber(cells[1]) < 0) {
        if (!isFirst) errors.push(`Line ${i + 1}: the count after the cause name needs to be a number.`);
        return;
      }
      count = toNumber(cells[1]);
      if (cells.length > 2 && cells[2] !== '') {
        if (!NUMBER.test(cells[2]) || toNumber(cells[2]) < 0) {
          errors.push(`Line ${i + 1}: the cost needs to be a number.`);
          return;
        }
        cost = toNumber(cells[2]);
      }
    }
    if (!cause) {
      errors.push(`Line ${i + 1}: needs a cause name first.`);
      return;
    }
    if (cost === null) withoutCost++;
    else withCost++;
    const key = cause.toLowerCase();
    const existing = byKey.get(key);
    if (existing) {
      existing.count += count;
      existing.cost = existing.cost === null || cost === null ? null : existing.cost + cost;
    } else {
      byKey.set(key, { cause, count, cost });
    }
  });
  const hasCost = withCost > 0 && withoutCost === 0;
  if (withCost > 0 && withoutCost > 0) {
    errors.push('Some lines have a cost and some don’t, so ranking by cost is off until every line has one.');
  }
  return { items: [...byKey.values()], hasCost, errors };
}

export function compute(items: ParetoItem[], s: ParetoSettings): ParetoResult {
  const valued = items
    .map((it) => ({ cause: it.cause, value: s.metric === 'cost' ? (it.cost ?? 0) : it.count, isOther: s.otherLast && isOtherCause(it.cause) }))
    .filter((it) => it.value > 0);
  valued.sort(
    (a, b) => Number(a.isOther) - Number(b.isOther) || b.value - a.value || compareNames(a.cause, b.cause),
  );
  const total = valued.reduce((a, it) => a + it.value, 0);
  const t = s.threshold / 100;
  let running = 0;
  const rows: ParetoRow[] = valued.map((it, i) => {
    const before = running;
    running += it.value;
    return {
      rank: i + 1,
      cause: it.cause,
      value: it.value,
      share: total ? it.value / total : 0,
      cumulative: running,
      cumShare: total ? running / total : 0,
      // In the vital few if the causes ranked above it haven't reached the threshold yet,
      // so the cause that crosses the line is included.
      vital: total > 0 && before / total < t - 1e-12,
      isOther: it.isOther,
      tied: valued.some((o) => o !== it && !o.isOther && !it.isOther && o.value === it.value),
    };
  });
  const vital = rows.filter((r) => r.vital);
  return { rows, total, vitalCount: vital.length, vitalShare: vital.length ? vital[vital.length - 1].cumShare : 0 };
}

export function settingsError(threshold: number): string | null {
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold >= 100) {
    return 'The threshold needs to be a percentage between 0 and 100.';
  }
  return null;
}

// The tutorial's October defect log, summarized: cause, defects, rework cost.
export const TUTORIAL_ITEMS = `Cause,Defects,Cost
Solder bridge,68,272
Insufficient solder,47,188
Solder balls,29,29
Missing component,17,374
Tombstoning,12,72
Lifted lead,8,64
Wrong polarity,8,480
Scratched board,4,60
Other,7,56`;

export const VITAL_HEX = '#0284C7';
export const TRIVIAL_HEX = '#94A3B8';

export interface DaxNames {
  table: string;
  column: string;
  costColumn: string;
}

export const DEFAULT_NAMES: DaxNames = { table: 'Defects', column: 'Cause', costColumn: 'Cost' };

export function quoteTable(name: string): string {
  const n = name.trim() || 'Defects';
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(n) ? n : `'${n.replace(/'/g, "''")}'`;
}

export function quoteColumn(name: string): string {
  return `[${(name.trim() || 'Cause').replace(/\]/g, ']]')}]`;
}

export function measureNames(metric: Metric) {
  return metric === 'cost'
    ? { base: 'Defect Cost', rank: 'Cost Pareto Rank', cum: 'Cumulative Cost', pct: 'Cumulative Cost %', vital: 'Cost Vital Few', color: 'Cost Bar Color' }
    : { base: 'Defect Count', rank: 'Pareto Rank', cum: 'Cumulative Count', pct: 'Cumulative %', vital: 'Vital Few', color: 'Pareto Bar Color' };
}

// The VAR block shared by the rank and cumulative measures: every cause ranked
// at or above the current one, among the causes the report currently shows.
function atOrAboveBlock(col: string, base: string, otherLast: boolean): string[] {
  const order = otherLast
    ? [
        `        VAR IsOther = ${col} = "Other"`,
        '        RETURN',
        '            NOT ISBLANK ( [@Value] )',
        `                && ( ${col} = CurrentCause`,
        '                    || ( CurrentIsOther && NOT IsOther )',
        '                    || ( IsOther = CurrentIsOther',
        '                        && ( [@Value] > CurrentValue',
        `                            || ( [@Value] = CurrentValue && ${col} < CurrentCause ) ) ) )`,
      ]
    : [
        '        NOT ISBLANK ( [@Value] )',
        `            && ( ${col} = CurrentCause`,
        '                || [@Value] > CurrentValue',
        `                || ( [@Value] = CurrentValue && ${col} < CurrentCause ) )`,
      ];
  return [
    `VAR CurrentCause = SELECTEDVALUE ( ${col} )`,
    `VAR CurrentValue = [${base}]`,
    ...(otherLast ? ['VAR CurrentIsOther = CurrentCause = "Other"'] : []),
    'VAR AtOrAbove =',
    '    FILTER (',
    `        ADDCOLUMNS ( ALLSELECTED ( ${col} ), "@Value", [${base}] ),`,
    ...order,
    '    )',
  ];
}

export function generateDax(s: ParetoSettings, names: DaxNames): string {
  const table = quoteTable(names.table);
  const col = `${table}${quoteColumn(names.column)}`;
  const m = measureNames(s.metric);
  const t = +(s.threshold / 100).toFixed(4);
  const baseDef =
    s.metric === 'cost'
      ? `${m.base} = SUM ( ${table}${quoteColumn(names.costColumn || 'Cost')} )`
      : `${m.base} = COUNTROWS ( ${table} )`;
  const guard = `HASONEVALUE ( ${col} ) && NOT ISBLANK ( CurrentValue )`;
  return [
    baseDef,
    '',
    `-- Sort the chart's axis by this: put it in Tooltips, then Sort axis > ${m.rank}, ascending`,
    `${m.rank} =`,
    ...atOrAboveBlock(col, m.base, s.otherLast),
    'RETURN',
    `    IF ( ${guard}, COUNTROWS ( AtOrAbove ) )`,
    '',
    `${m.cum} =`,
    ...atOrAboveBlock(col, m.base, s.otherLast),
    'RETURN',
    `    IF ( ${guard}, SUMX ( AtOrAbove, [@Value] ) )`,
    '',
    `${m.pct} =`,
    `DIVIDE ( [${m.cum}], CALCULATE ( [${m.base}], ALLSELECTED ( ${col} ) ) )`,
    '',
    `-- 1 for the causes it takes to reach ${s.threshold}%, including the one that crosses it`,
    `${m.vital} =`,
    `VAR Before = [${m.cum}] - [${m.base}]`,
    `VAR AllCauses = CALCULATE ( [${m.base}], ALLSELECTED ( ${col} ) )`,
    'RETURN',
    `    IF ( NOT ISBLANK ( [${m.cum}] ), IF ( DIVIDE ( Before, AllCauses ) < ${t}, 1, 0 ) )`,
    '',
    '-- Column color: Format > Columns > Color > fx > Format style: Field value',
    `${m.color} = IF ( [${m.vital}] = 1, "${VITAL_HEX}", "${TRIVIAL_HEX}" )`,
    '',
    '-- A second line on the secondary axis, so the threshold shows on the chart',
    `Pareto Threshold = ${t}`,
  ].join('\n');
}
