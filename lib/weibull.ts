// Pure logic for the Weibull Analysis tool and the Weibull tutorial: median
// rank regression with Johnson's adjusted ranks for suspended (still running)
// units, regressing X on Y (rank regression on X, the usual engineering
// default). The generated DAX computes the same columns and the same fit.
//
// Johnson's adjusted rank is normally written as a recursion:
//   a(k) = a(k-1) + (N + 1 - a(k-1)) / (1 + r(k))
// which rearranges to a running product over the failures so far:
//   N + 1 - a(k) = (N + 1) * PRODUCT( r(j) / (r(j) + 1) )
// so DAX can compute it with PRODUCTX instead of recursion.

export type Status = 'F' | 'S';

export interface Unit {
  id: string;
  hours: number;
  status: Status;
}

export interface RankedUnit extends Unit {
  order: number;
  reverseRank: number;
  adjustedRank: number | null;
  medianRank: number | null;
  x: number | null; // ln(hours)
  y: number | null; // ln(-ln(1 - median rank))
}

export interface WeibullFit {
  ranked: RankedUnit[];
  beta: number;
  eta: number;
  r2: number;
  failures: number;
  suspensions: number;
}

const FAIL = /^(f|fail|failed|failure|1)$/i;
const SUSP = /^(s|susp|suspended|suspension|running|censored|c|0)$/i;
const NUMBER = /^\d+(\.\d+)?$/;

// One unit per line: ID, hours, status (F or S). The ID is optional ("hours,
// status"), and so is the status: a line with only hours counts as a failure.
export function parseUnits(text: string): { units: Unit[]; errors: string[] } {
  const units: Unit[] = [];
  const errors: string[] = [];
  let firstLine = true;
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const isFirst = firstLine;
    firstLine = false;
    const cells = (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.trim().replace(/,/g, ''));
    let id = '';
    let hoursText: string | undefined;
    let statusText: string | undefined;
    if (cells.length >= 3) [id, hoursText, statusText] = cells;
    else if (cells.length === 2) {
      if (NUMBER.test(cells[0])) [hoursText, statusText] = cells;
      else [id, hoursText] = cells;
    } else [hoursText] = cells;
    if (!hoursText || !NUMBER.test(hoursText) || Number(hoursText) <= 0) {
      if (!(isFirst && /[a-z]/i.test(line))) errors.push(`Line ${i + 1}: needs the hours (or cycles) as a positive number.`);
      return;
    }
    let status: Status = 'F';
    if (statusText) {
      if (FAIL.test(statusText)) status = 'F';
      else if (SUSP.test(statusText)) status = 'S';
      else {
        errors.push(`Line ${i + 1}: status should be F (failed) or S (suspended, still running).`);
        return;
      }
    }
    units.push({ id: id || `#${units.length + 1}`, hours: Number(hoursText), status });
  });
  return { units, errors };
}

// Order: by hours, failures before suspensions at the same hours, then input order.
export function rank(units: Unit[]): RankedUnit[] {
  const sorted = units
    .map((u, i) => ({ u, i }))
    .sort((a, b) => a.u.hours - b.u.hours || (a.u.status === 'F' ? 0 : 1) - (b.u.status === 'F' ? 0 : 1) || a.i - b.i)
    .map((e) => e.u);
  const N = sorted.length;
  let survive = 1;
  return sorted.map((u, i) => {
    const order = i + 1;
    const reverseRank = N - order + 1;
    if (u.status !== 'F') return { ...u, order, reverseRank, adjustedRank: null, medianRank: null, x: null, y: null };
    survive *= reverseRank / (reverseRank + 1);
    const adjustedRank = (N + 1) * (1 - survive);
    const medianRank = (adjustedRank - 0.3) / (N + 0.4); // Bernard's approximation
    return { ...u, order, reverseRank, adjustedRank, medianRank, x: Math.log(u.hours), y: Math.log(-Math.log(1 - medianRank)) };
  });
}

export function fit(units: Unit[]): WeibullFit | null {
  const ranked = rank(units);
  const pts = ranked.filter((u) => u.x !== null) as (RankedUnit & { x: number; y: number })[];
  if (pts.length < 2) return null;
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p.x, 0) / n;
  const my = pts.reduce((a, p) => a + p.y, 0) / n;
  let sxy = 0;
  let syy = 0;
  let sxx = 0;
  for (const p of pts) {
    sxy += (p.x - mx) * (p.y - my);
    syy += (p.y - my) ** 2;
    sxx += (p.x - mx) ** 2;
  }
  if (sxx === 0 || syy === 0 || sxy <= 0) return null;
  // Regress X (ln hours) on Y: ln(t) = (1 / beta) * Y + ln(eta)
  const slope = sxy / syy;
  const intercept = mx - slope * my;
  return {
    ranked,
    beta: 1 / slope,
    eta: Math.exp(intercept),
    r2: (sxy * sxy) / (sxx * syy),
    failures: n,
    suspensions: ranked.length - n,
  };
}

export const reliability = (beta: number, eta: number, t: number) => Math.exp(-((t / eta) ** beta));
export const unreliability = (beta: number, eta: number, t: number) => 1 - reliability(beta, eta, t);
// Hours by which p (0..1) of the population has failed: B10 is bLife(.., 0.10).
export const bLife = (beta: number, eta: number, p: number) => eta * (-Math.log(1 - p)) ** (1 / beta);

// Lanczos approximation, accurate to ~15 digits for the arguments used here.
const G = 7;
const C = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
  12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];
export function gamma(z: number): number {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  let x = C[0];
  for (let i = 1; i < G + 2; i++) x += C[i] / (z + i);
  const t = z + G + 0.5;
  return Math.sqrt(2 * Math.PI) * t ** (z + 0.5) * Math.exp(-t) * x;
}
export const meanLife = (beta: number, eta: number) => eta * gamma(1 + 1 / beta);

// Total operating hours over failures: the "MTBF" a fleet report usually shows.
export function fleetMtbf(units: Unit[]): number | null {
  const f = units.filter((u) => u.status === 'F').length;
  return f ? units.reduce((a, u) => a + u.hours, 0) / f : null;
}

export function betaBand(beta: number): { label: string; text: string } {
  if (beta < 0.9)
    return {
      label: 'Early-life failures',
      text: 'The failure rate falls with age: units that survive the start tend to keep going. Look at manufacturing, installation, and burn-in, not wear. Replacing old units early makes it worse.',
    };
  if (beta <= 1.1)
    return {
      label: 'Random failures',
      text: 'The failure rate is roughly constant with age, so an old unit is no more likely to fail than a new one. Time-based replacement doesn’t help; condition monitoring and spares do.',
    };
  if (beta <= 4)
    return {
      label: 'Wear-out',
      text: 'The failure rate climbs with age. Time-based replacement works, but the interval has to come from the B-life, not the average life.',
    };
  return {
    label: 'Rapid wear-out',
    text: 'Failures bunch tightly around one age. Replacement just before that age is very effective, and the data is worth a second look for a single dominant cause.',
  };
}

// The tutorial's pump fleet: 20 pumps, operating hours, F = failed, S = still running.
export const TUTORIAL_UNITS = `PumpID,Hours,Status
P-01,2330,F
P-02,10120,F
P-03,8010,S
P-04,3750,S
P-05,4220,F
P-06,7490,F
P-07,5830,F
P-08,4780,F
P-09,7540,F
P-10,7290,S
P-11,7410,S
P-12,9120,S
P-13,4080,S
P-14,5100,F
P-15,6650,F
P-16,7850,F
P-17,7070,F
P-18,11200,F
P-19,8470,S
P-20,4730,S`;

export const TUTORIAL_INTERVAL = 10000;

export interface DaxNames {
  table: string;
  hours: string;
  status: string;
  failed: string;
}

export const DEFAULT_NAMES: DaxNames = { table: 'Pumps', hours: 'Hours', status: 'Status', failed: 'F' };

const quoteTable = (name: string) => {
  const n = name.trim() || 'Pumps';
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(n) ? n : `'${n.replace(/'/g, "''")}'`;
};
const col = (name: string, fallback: string) => `[${(name.trim() || fallback).replace(/\]/g, ']]')}]`;

const num = (v: number) => String(+v.toFixed(6));

export function generateDax(names: DaxNames, opts: { bPercent: number; interval: number }): string {
  const t = quoteTable(names.table);
  const h = `${t}${col(names.hours, 'Hours')}`;
  const s = `${t}${col(names.status, 'Status')}`;
  const isF = `${s} = "${(names.failed.trim() || 'F').replace(/"/g, '""')}"`;
  const p = opts.bPercent / 100;
  return [
    '-- Calculated columns. Order comes from Power Query: sort by hours (failures first on a tie), then add an index from 1.',
    `Reverse Rank = COUNTROWS ( ${t} ) - ${t}[Order] + 1`,
    '',
    'Adjusted Rank =',
    'IF (',
    `    ${isF},`,
    `    VAR N = COUNTROWS ( ${t} )`,
    `    VAR CurrentOrder = ${t}[Order]`,
    '    VAR StillSurviving =',
    '        PRODUCTX (',
    `            FILTER ( ${t}, ${isF} && ${t}[Order] <= CurrentOrder ),`,
    `            DIVIDE ( ${t}[Reverse Rank], ${t}[Reverse Rank] + 1 )`,
    '        )',
    '    RETURN',
    '        ( N + 1 ) * ( 1 - StillSurviving )',
    ')',
    '',
    `Median Rank = DIVIDE ( ${t}[Adjusted Rank] - 0.3, COUNTROWS ( ${t} ) + 0.4 )`,
    '',
    `Plot X = IF ( ${isF}, LN ( ${h} ) )`,
    '',
    `Plot Y = IF ( ${isF}, LN ( -LN ( 1 - ${t}[Median Rank] ) ) )`,
    '',
    '-- Measures. Rank regression on X: regress ln(hours) on Plot Y, so the slope is 1 / Beta.',
    'Weibull Beta =',
    'VAR Fit =',
    `    LINESTX ( FILTER ( ALL ( ${t} ), ${isF} ), ${t}[Plot X], ${t}[Plot Y] )`,
    'RETURN',
    '    DIVIDE ( 1, MAXX ( Fit, [Slope1] ) )',
    '',
    'Weibull Eta =',
    'VAR Fit =',
    `    LINESTX ( FILTER ( ALL ( ${t} ), ${isF} ), ${t}[Plot X], ${t}[Plot Y] )`,
    'RETURN',
    '    EXP ( MAXX ( Fit, [Intercept] ) )',
    '',
    'Fit R2 =',
    'VAR Fit =',
    `    LINESTX ( FILTER ( ALL ( ${t} ), ${isF} ), ${t}[Plot X], ${t}[Plot Y] )`,
    'RETURN',
    '    MAXX ( Fit, [CoefficientOfDetermination] )',
    '',
    `B${opts.bPercent} Life = [Weibull Eta] * POWER ( -LN ( 1 - ${num(p)} ), 1 / [Weibull Beta] )`,
    '',
    'Reliability at Interval =',
    `VAR IntervalHours = ${num(opts.interval)}`,
    'RETURN',
    '    EXP ( -POWER ( IntervalHours / [Weibull Eta], [Weibull Beta] ) )',
    '',
    'Fleet MTBF =',
    `DIVIDE ( SUM ( ${h} ), CALCULATE ( COUNTROWS ( ${t} ), ${isF} ) )`,
  ].join('\n');
}
