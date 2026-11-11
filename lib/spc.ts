// Pure logic for the SPC Control Chart Builder tool: I-MR, X-bar R, and p
// charts, Western Electric run rules, and Cp/Cpk. The rules run on z-scores
// (distance from the center line in sigmas), so one rule engine covers all
// three chart types, including the p chart's per-sample limits. The DAX that
// generateDax returns uses the same windows and conventions, so a point the
// tool flags is the point Power BI flags.

import { daxTableRef } from '@/lib/date-table';

export type ChartType = 'imr' | 'xbar-r' | 'p';
export type RuleId = 1 | 2 | 3 | 4;

export const RULES: { id: RuleId; short: string; text: string }[] = [
  { id: 1, short: 'Beyond a limit', text: 'one point beyond a control limit (3σ)' },
  { id: 2, short: '2 of 3 beyond 2σ', text: '2 of 3 points in a row beyond 2σ on the same side' },
  { id: 3, short: '4 of 5 beyond 1σ', text: '4 of 5 points in a row beyond 1σ on the same side' },
  { id: 4, short: '8 in a row', text: '8 points in a row on the same side of the center line' },
];

// Control chart constants by subgroup size. d2 converts an average range into
// a standard deviation; D3 and D4 set the range chart's limits.
export const CONSTANTS: Record<number, { d2: number; D3: number; D4: number }> = {
  2: { d2: 1.128, D3: 0, D4: 3.267 },
  3: { d2: 1.693, D3: 0, D4: 2.574 },
  4: { d2: 2.059, D3: 0, D4: 2.282 },
  5: { d2: 2.326, D3: 0, D4: 2.114 },
  6: { d2: 2.534, D3: 0, D4: 2.004 },
  7: { d2: 2.704, D3: 0.076, D4: 1.924 },
  8: { d2: 2.847, D3: 0.136, D4: 1.864 },
  9: { d2: 2.97, D3: 0.184, D4: 1.816 },
  10: { d2: 3.078, D3: 0.223, D4: 1.777 },
};

export interface ChartPoint {
  label: string;
  value: number;
  center: number;
  ucl: number;
  lcl: number;
  sigma: number;
  rules: RuleId[];
  n?: number; // p chart: inspected
  count?: number; // p chart: defectives
}

export interface ChartSeries {
  points: ChartPoint[];
  center: number;
  ucl: number;
  lcl: number;
}

export interface SpcResult {
  type: ChartType;
  main: ChartSeries;
  range?: ChartSeries; // MR or R chart
  baseline: number; // points the limits were calculated from
  subgroupSize?: number;
  sigmaWithin?: number; // variables charts: process sigma for capability
  decimals: number;
}

export interface Capability {
  cp: number | null;
  cpk: number;
  cpu: number | null;
  cpl: number | null;
}

// ---------- Parsing ----------

export interface Subgroup {
  label: string;
  values: number[];
}

export interface Attribute {
  label: string;
  defectives: number;
  inspected: number;
}

const splitCells = (line: string) => (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.trim());
const isNumber = (s: string) => s !== '' && /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s);

// Variables data, one line per measurement or per subgroup: a label, then one
// or more values. Consecutive lines with the same label join one subgroup, so
// both the long shape of a Power BI table (Subgroup, Value) and a wide copy
// from Excel (Subgroup, v1, v2, v3...) work. A line that's just a number gets
// its line number as the label.
export function parseVariables(text: string): { groups: Subgroup[]; errors: string[]; decimals: number } {
  const groups: Subgroup[] = [];
  const errors: string[] = [];
  let decimals = 0;
  let first = true;
  let row = 0;
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const isFirst = first;
    first = false;
    const cells = splitCells(line).filter((c, j, all) => c !== '' || j < all.length - 1);
    let label: string;
    let valueCells: string[];
    if (cells.length === 1) {
      label = String(++row);
      valueCells = cells;
    } else {
      label = cells[0];
      valueCells = cells.slice(1).filter((c) => c !== '');
    }
    if (valueCells.length === 0 || !valueCells.every(isNumber)) {
      // An unreadable first line with words in it is a header row.
      if (!(isFirst && /[a-z]/i.test(line))) errors.push(`Line ${i + 1}: needs a label and then one or more numbers.`);
      return;
    }
    for (const c of valueCells) {
      const dot = c.replace(/e.*$/i, '').split('.')[1];
      if (dot) decimals = Math.max(decimals, dot.length);
    }
    const values = valueCells.map(Number);
    const last = groups[groups.length - 1];
    if (last && last.label === label && cells.length > 1) last.values.push(...values);
    else groups.push({ label, values });
  });
  return { groups, errors, decimals: Math.min(decimals, 6) };
}

// Attribute data: label, defectives, inspected.
export function parseAttributes(text: string): { samples: Attribute[]; errors: string[] } {
  const samples: Attribute[] = [];
  const errors: string[] = [];
  let first = true;
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const isFirst = first;
    first = false;
    const cells = splitCells(line);
    const [d, n] = cells.slice(-2);
    const ok = cells.length >= 3 && /^\d+$/.test(d ?? '') && /^\d+$/.test(n ?? '');
    if (!ok) {
      if (!(isFirst && /[a-z]/i.test(line))) {
        errors.push(`Line ${i + 1}: needs a label, the number defective, and the number inspected.`);
      }
      return;
    }
    const defectives = Number(d);
    const inspected = Number(n);
    if (inspected === 0 || defectives > inspected) {
      errors.push(`Line ${i + 1}: defectives must be between 0 and the number inspected, which can't be 0.`);
      return;
    }
    samples.push({ label: cells.slice(0, -2).join(', '), defectives, inspected });
  });
  return { samples, errors };
}

// ---------- Run rules ----------

// Each rule is checked at the point that completes the pattern, looking back
// over a window that ends there. Rules 2 and 3 also need that last point to be
// in the zone, so the flag lands on a point that's actually out there.
export function applyRules(z: number[], enabled: RuleId[]): RuleId[][] {
  const on = new Set(enabled);
  return z.map((zk, k) => {
    const out: RuleId[] = [];
    const win = (len: number) => z.slice(Math.max(0, k - len + 1), k + 1);
    if (on.has(1) && Math.abs(zk) > 3) out.push(1);
    if (on.has(2)) {
      const w = win(3);
      if ((zk > 2 && w.filter((v) => v > 2).length >= 2) || (zk < -2 && w.filter((v) => v < -2).length >= 2)) out.push(2);
    }
    if (on.has(3)) {
      const w = win(5);
      if ((zk > 1 && w.filter((v) => v > 1).length >= 4) || (zk < -1 && w.filter((v) => v < -1).length >= 4)) out.push(3);
    }
    if (on.has(4) && k >= 7) {
      const w = win(8);
      if (w.every((v) => v > 0) || w.every((v) => v < 0)) out.push(4);
    }
    return out;
  });
}

// ---------- Limits ----------

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function baselineCount(requested: number | null, total: number): number {
  return requested === null || requested >= total ? total : requested;
}

function series(
  labels: string[],
  values: number[],
  center: (i: number) => number,
  sigma: (i: number) => number,
  lclFloor: number | null,
  rules: RuleId[],
): ChartSeries {
  const z = values.map((v, i) => (sigma(i) > 0 ? (v - center(i)) / sigma(i) : 0));
  const fired = applyRules(z, rules);
  const points = values.map((v, i) => {
    const s = sigma(i);
    const lcl = center(i) - 3 * s;
    return {
      label: labels[i],
      value: v,
      center: center(i),
      ucl: center(i) + 3 * s,
      lcl: lclFloor === null ? lcl : Math.max(lclFloor, lcl),
      sigma: s,
      rules: fired[i],
    };
  });
  return { points, center: points[0]?.center ?? 0, ucl: points[0]?.ucl ?? 0, lcl: points[0]?.lcl ?? 0 };
}

// A range chart only uses rule 1 (beyond its limits); its limits come from
// constants rather than a symmetric 3 sigma, so it's built directly.
function rangeSeries(labels: string[], values: (number | null)[], center: number, ucl: number, lcl: number): ChartSeries {
  const points: ChartPoint[] = [];
  values.forEach((v, i) => {
    if (v === null) return;
    points.push({ label: labels[i], value: v, center, ucl, lcl, sigma: 0, rules: v > ucl || v < lcl ? [1] : [] });
  });
  return { points, center, ucl, lcl };
}

export type SpcInput =
  | { type: 'imr'; groups: Subgroup[]; decimals: number }
  | { type: 'xbar-r'; groups: Subgroup[]; decimals: number }
  | { type: 'p'; samples: Attribute[] };

export function compute(input: SpcInput, baselineRequested: number | null, rules: RuleId[]): SpcResult | { error: string } {
  if (input.type === 'imr') {
    const labels: string[] = [];
    const xs: number[] = [];
    for (const g of input.groups) {
      g.values.forEach((v, j) => {
        labels.push(g.values.length > 1 ? `${g.label} #${j + 1}` : g.label);
        xs.push(v);
      });
    }
    if (xs.length < 3) return { error: 'An I-MR chart needs at least 3 values.' };
    const b = baselineCount(baselineRequested, xs.length);
    if (b < 3) return { error: 'The baseline needs at least 3 points.' };
    const mr: (number | null)[] = xs.map((x, i) => (i === 0 ? null : Math.abs(x - xs[i - 1])));
    const center = mean(xs.slice(0, b));
    const mrBar = mean(mr.slice(1, b) as number[]);
    const sigma = mrBar / CONSTANTS[2].d2;
    const main = series(labels, xs, () => center, () => sigma, null, rules);
    const range = rangeSeries(labels, mr, mrBar, CONSTANTS[2].D4 * mrBar, 0);
    return { type: 'imr', main, range, baseline: b, sigmaWithin: sigma, decimals: input.decimals };
  }

  if (input.type === 'xbar-r') {
    const groups = input.groups;
    if (groups.length < 3) return { error: 'An X̄-R chart needs at least 3 subgroups.' };
    const n = groups[0].values.length;
    const uneven = groups.find((g) => g.values.length !== n);
    if (uneven) {
      return {
        error: `Every subgroup needs the same number of values: "${groups[0].label}" has ${n} and "${uneven.label}" has ${uneven.values.length}.`,
      };
    }
    if (n < 2 || n > 10) {
      return {
        error:
          n === 1
            ? 'Each subgroup has one value. Switch to the I-MR chart for individual measurements.'
            : 'Subgroups need 2 to 10 values for an X̄-R chart.',
      };
    }
    const b = baselineCount(baselineRequested, groups.length);
    if (b < 3) return { error: 'The baseline needs at least 3 subgroups.' };
    const labels = groups.map((g) => g.label);
    const means = groups.map((g) => mean(g.values));
    const ranges = groups.map((g) => Math.max(...g.values) - Math.min(...g.values));
    const k = CONSTANTS[n];
    const grand = mean(means.slice(0, b));
    const rBar = mean(ranges.slice(0, b));
    const sigmaWithin = rBar / k.d2;
    const sigmaMean = sigmaWithin / Math.sqrt(n);
    const main = series(labels, means, () => grand, () => sigmaMean, null, rules);
    const range = rangeSeries(labels, ranges, rBar, k.D4 * rBar, k.D3 * rBar);
    return { type: 'xbar-r', main, range, baseline: b, subgroupSize: n, sigmaWithin, decimals: input.decimals };
  }

  const s = input.samples;
  if (s.length < 3) return { error: 'A p chart needs at least 3 samples.' };
  const b = baselineCount(baselineRequested, s.length);
  if (b < 3) return { error: 'The baseline needs at least 3 samples.' };
  const base = s.slice(0, b);
  const pBar = base.reduce((a, x) => a + x.defectives, 0) / base.reduce((a, x) => a + x.inspected, 0);
  if (pBar === 0) return { error: 'The baseline has no defectives, so there is no variation to set limits from.' };
  if (pBar === 1) return { error: 'Every unit in the baseline is defective, so there is no variation to set limits from.' };
  const main = series(
    s.map((x) => x.label),
    s.map((x) => x.defectives / x.inspected),
    () => pBar,
    (i) => Math.sqrt((pBar * (1 - pBar)) / s[i].inspected),
    0,
    rules,
  );
  main.points.forEach((p, i) => {
    p.n = s[i].inspected;
    p.count = s[i].defectives;
  });
  return { type: 'p', main, baseline: b, decimals: 2 };
}

export function capability(center: number, sigmaWithin: number, lsl: number | null, usl: number | null): Capability | null {
  if (sigmaWithin <= 0 || (lsl === null && usl === null)) return null;
  const cpu = usl === null ? null : (usl - center) / (3 * sigmaWithin);
  const cpl = lsl === null ? null : (center - lsl) / (3 * sigmaWithin);
  const cp = usl !== null && lsl !== null ? (usl - lsl) / (6 * sigmaWithin) : null;
  const cpk = Math.min(cpu ?? Infinity, cpl ?? Infinity);
  return { cp, cpu, cpl, cpk };
}

// ---------- DAX ----------

export interface DaxOptions {
  type: ChartType;
  table: string;
  baseline: number | null; // null: limits from every point
  rules: RuleId[];
  subgroupSize?: number;
  lsl: number | null;
  usl: number | null;
}

const fmt = (v: number) => String(Number(v.toPrecision(10)));

export function generateDax(o: DaxOptions): string {
  const t = daxTableRef(o.table);
  const idx = o.type === 'xbar-r' ? 'SubgroupNo' : 'SampleNo';
  const col = (c: string) => `${t}[${c}]`;
  const baseFilter = o.baseline === null ? [] : [`    ${col(idx)} <= ${o.baseline} -- limits from the baseline only`];
  const limitsFrom = (expr: string) => [
    'CALCULATE(',
    `    ${expr},`,
    `    REMOVEFILTERS( ${t} )${baseFilter.length ? ',' : ''}`,
    ...baseFilter,
    ')',
  ];

  const lines: string[] = [];
  const plotted = o.type === 'imr' ? 'Sample Value' : o.type === 'xbar-r' ? 'Subgroup Mean' : 'Proportion Defective';
  const centerName = o.type === 'xbar-r' ? 'Grand Mean' : 'Center Line';

  lines.push(
    `-- ${o.table} needs a ${idx} column numbered 1, 2, 3… in time order.`,
    '-- In Power Query: Add Column > Index Column > From 1.',
  );
  if (o.type === 'xbar-r') {
    lines.push('-- One row per measurement, with every row in a subgroup sharing its SubgroupNo.');
  }
  lines.push(
    `-- One table, several machines or characteristics? Swap REMOVEFILTERS( ${t} )`,
    `-- for ALLEXCEPT( ${t}, ${col('Machine')} ) so each gets its own limits${o.type === 'imr' ? ',' : '.'}`,
    ...(o.type === 'imr' ? [`-- and add && ${col('Machine')} = EARLIER( ${col('Machine')} ) to the Moving Range FILTER.`] : []),
    '',
  );

  if (o.type === 'imr') {
    lines.push(
      '-- Calculated column (Table tools > New column)',
      'Moving Range =',
      `VAR ThisSample = ${col('SampleNo')}`,
      'VAR PrevValue =',
      `    MAXX( FILTER( ${t}, ${col('SampleNo')} = ThisSample - 1 ), ${col('Value')} )`,
      'RETURN',
      `    IF( NOT ISBLANK( PrevValue ), ABS( ${col('Value')} - PrevValue ) )`,
      '',
      `Sample Value = AVERAGE( ${col('Value')} )`,
      '',
      'Center Line =',
      ...limitsFrom(`AVERAGE( ${col('Value')} )`),
      '',
      'Average Moving Range =',
      ...limitsFrom(`AVERAGE( ${col('Moving Range')} )`),
      '',
      '-- 1.128 is d2 for a moving range of 2 points, so 3 sigma = 2.66 x MR-bar',
      'Sigma = [Average Moving Range] / 1.128',
      '',
      'UCL = [Center Line] + 3 * [Sigma]',
      'LCL = [Center Line] - 3 * [Sigma]',
      '',
      '-- Moving range chart',
      `Moving Range Value = AVERAGE( ${col('Moving Range')} )`,
      `MR UCL = ${CONSTANTS[2].D4} * [Average Moving Range]`,
    );
  } else if (o.type === 'xbar-r') {
    const n = o.subgroupSize ?? 5;
    const k = CONSTANTS[n];
    const a2 = 3 / (k.d2 * Math.sqrt(n));
    lines.push(
      `Subgroup Mean = AVERAGE( ${col('Value')} )`,
      `Subgroup Range = MAX( ${col('Value')} ) - MIN( ${col('Value')} )`,
      '',
      'Grand Mean =',
      ...limitsFrom(`AVERAGEX( VALUES( ${col('SubgroupNo')} ), [Subgroup Mean] )`),
      '',
      'Average Range =',
      ...limitsFrom(`AVERAGEX( VALUES( ${col('SubgroupNo')} ), [Subgroup Range] )`),
      '',
      `-- ${k.d2} is d2 for subgroups of ${n}`,
      `Sigma Within = [Average Range] / ${k.d2}`,
      '',
      `-- Sigma of a subgroup mean, so 3 sigma = A2 x R-bar (A2 = ${a2.toFixed(3)})`,
      `Sigma = [Sigma Within] / SQRT( ${n} )`,
      '',
      'UCL = [Grand Mean] + 3 * [Sigma]',
      'LCL = [Grand Mean] - 3 * [Sigma]',
      '',
      `-- Range chart: D3 = ${k.D3}, D4 = ${k.D4} for subgroups of ${n}`,
      `Range UCL = ${k.D4} * [Average Range]`,
      k.D3 === 0 ? 'Range LCL = 0 -- D3 is 0 below subgroups of 7' : `Range LCL = ${k.D3} * [Average Range]`,
    );
  } else {
    lines.push(
      `Proportion Defective = DIVIDE( SUM( ${col('Defectives')} ), SUM( ${col('Inspected')} ) )`,
      '',
      'Center Line =',
      ...limitsFrom('[Proportion Defective]'),
      '',
      '-- Limits widen for small samples, so they step from point to point',
      `Sigma = SQRT( DIVIDE( [Center Line] * ( 1 - [Center Line] ), SUM( ${col('Inspected')} ) ) )`,
      '',
      'UCL = [Center Line] + 3 * [Sigma]',
      'LCL = MAX( 0, [Center Line] - 3 * [Sigma] )',
    );
  }

  if (o.rules.length > 0) {
    const on = (r: RuleId) => o.rules.includes(r);
    const look = on(4) ? 8 : on(3) ? 5 : on(2) ? 3 : 1;
    const ix = col(idx);
    lines.push(
      '',
      '-- Distance from the center line in sigmas; the run rules work on this',
      `Z Score = DIVIDE( [${plotted}] - [${centerName}], [Sigma] )`,
      '',
      '-- Which Western Electric rules this point completes, e.g. "Rule 1, 4"',
      'Signal Rules =',
      `VAR k = MAX( ${ix} )`,
      'VAR Pts =',
      '    ADDCOLUMNS(',
      `        FILTER( ALL( ${ix} ), ${ix} > k - ${look} && ${ix} <= k ),`,
      '        "@z", CALCULATE( [Z Score] )',
      '    )',
      `VAR z = MAXX( FILTER( Pts, ${ix} = k ), [@z] )`,
    );
    if (on(2)) lines.push(`VAR Last3 = FILTER( Pts, ${ix} > k - 3 )`);
    if (on(3)) lines.push(`VAR Last5 = FILTER( Pts, ${ix} > k - 5 )`);
    const fired: string[] = [];
    if (on(1)) {
      lines.push('VAR R1 = ABS( z ) > 3');
      fired.push('IF( R1, "1 " )');
    }
    if (on(2)) {
      lines.push(
        'VAR R2 =',
        '    ( z > 2 && COUNTROWS( FILTER( Last3, [@z] > 2 ) ) >= 2 )',
        '        || ( z < -2 && COUNTROWS( FILTER( Last3, [@z] < -2 ) ) >= 2 )',
      );
      fired.push('IF( R2, "2 " )');
    }
    if (on(3)) {
      lines.push(
        'VAR R3 =',
        '    ( z > 1 && COUNTROWS( FILTER( Last5, [@z] > 1 ) ) >= 4 )',
        '        || ( z < -1 && COUNTROWS( FILTER( Last5, [@z] < -1 ) ) >= 4 )',
      );
      fired.push('IF( R3, "3 " )');
    }
    if (on(4)) {
      lines.push(
        'VAR R4 =',
        `    k >= 8`,
        '        && ( COUNTROWS( FILTER( Pts, [@z] > 0 ) ) = 8 || COUNTROWS( FILTER( Pts, [@z] < 0 ) ) = 8 )',
      );
      fired.push('IF( R4, "4 " )');
    }
    lines.push(
      'VAR Fired =',
      `    SUBSTITUTE( TRIM( ${fired.join(' & ')} ), " ", ", " )`,
      'RETURN',
      `    IF( HASONEVALUE( ${ix} ) && NOT ISBLANK( z ) && Fired <> "", "Rule " & Fired )`,
      '',
      '-- Plot as a second line with markers only, to put a red dot on each signal',
      `Signal Point = IF( NOT ISBLANK( [Signal Rules] ), [${plotted}] )`,
    );
  }

  if (o.type !== 'p' && (o.lsl !== null || o.usl !== null)) {
    const sw = o.type === 'imr' ? '[Sigma]' : '[Sigma Within]';
    lines.push('', '-- Process capability: only meaningful once the chart shows no signals');
    if (o.usl !== null) lines.push(`Cpu = DIVIDE( ${fmt(o.usl)} - [${centerName}], 3 * ${sw} )`);
    if (o.lsl !== null) lines.push(`Cpl = DIVIDE( [${centerName}] - ${fmt(o.lsl)}, 3 * ${sw} )`);
    if (o.usl !== null && o.lsl !== null) {
      lines.push(`Cp = DIVIDE( ${fmt(o.usl)} - ${fmt(o.lsl)}, 6 * ${sw} )`, 'Cpk = MIN( [Cpu], [Cpl] )');
    } else {
      lines.push(`Cpk = ${o.usl !== null ? '[Cpu]' : '[Cpl]'}`);
    }
  }
  return lines.join('\n');
}

// ---------- Example data ----------
// Generated once from a seeded generator and frozen: 20 stable baseline points,
// then a shift (I-MR from S21, X̄-R at G23, p on Sep 22) for the rules to catch.

export const EXAMPLES: Record<ChartType, string> = {
  imr: `Sample,Torque (N·m)
S01,24.02
S02,23.87
S03,23.85
S04,24.01
S05,23.98
S06,24.06
S07,23.75
S08,23.93
S09,23.88
S10,24.12
S11,24.08
S12,24.06
S13,23.98
S14,24.01
S15,24.05
S16,23.86
S17,24.22
S18,24.18
S19,24.27
S20,23.94
S21,24.38
S22,24.23
S23,24.09
S24,24.38
S25,24.13
S26,24.14
S27,24.27
S28,24.07
S29,24.15
S30,24.35`,
  'xbar-r': `Subgroup,D1,D2,D3,D4,D5
G01,12.008,12.003,12.008,11.997,12.007
G02,12.008,12.008,11.985,12.011,11.997
G03,11.991,12.010,12.003,11.996,11.991
G04,12.000,12.001,12.007,12.008,11.993
G05,12.010,12.005,12.003,12.004,12.003
G06,11.993,11.997,12.002,11.999,12.009
G07,11.999,11.985,11.996,12.006,11.996
G08,11.993,12.000,11.994,12.004,12.004
G09,12.002,12.016,11.997,11.999,11.996
G10,11.997,11.989,11.991,11.998,12.001
G11,12.000,12.005,11.991,12.005,11.997
G12,12.003,12.006,11.993,11.995,12.004
G13,12.008,11.988,11.998,11.987,12.005
G14,11.993,12.005,11.998,11.999,12.009
G15,12.000,12.000,12.003,12.011,12.004
G16,11.995,11.999,11.993,11.993,11.999
G17,11.989,11.999,11.994,12.006,12.008
G18,11.999,11.994,12.008,12.006,11.995
G19,11.994,11.995,12.013,12.012,12.000
G20,12.002,11.998,11.999,11.998,11.998
G21,12.019,12.002,12.000,11.999,12.001
G22,11.998,12.005,12.002,12.015,12.003
G23,12.009,12.005,12.016,12.015,12.012
G24,12.011,11.998,12.009,12.009,12.005
G25,12.016,12.005,11.991,12.002,12.000`,
  p: `Date,Defective,Inspected
2026-09-01,6,185
2026-09-02,2,184
2026-09-03,7,256
2026-09-04,5,193
2026-09-05,5,225
2026-09-06,4,242
2026-09-07,7,183
2026-09-08,3,180
2026-09-09,6,247
2026-09-10,7,252
2026-09-11,9,234
2026-09-12,7,231
2026-09-13,5,234
2026-09-14,8,211
2026-09-15,8,251
2026-09-16,10,227
2026-09-17,2,219
2026-09-18,7,235
2026-09-19,3,189
2026-09-20,9,218
2026-09-21,5,252
2026-09-22,19,244
2026-09-23,7,230
2026-09-24,6,215
2026-09-25,9,207`,
};

export const EXAMPLE_SETTINGS: Record<ChartType, { baseline: string; lsl: string; usl: string; table: string }> = {
  imr: { baseline: '20', lsl: '23.5', usl: '24.5', table: 'Measurements' },
  'xbar-r': { baseline: '20', lsl: '11.98', usl: '12.02', table: 'Measurements' },
  p: { baseline: '20', lsl: '', usl: '', table: 'Inspections' },
};
