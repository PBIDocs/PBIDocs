// Pure calculation logic for the EVM Calculator tool. Formulas and measure
// names match the Build an EVM Dashboard tutorial and the EVM Metrics pattern.

export type EacMethod = 'cpi' | 'atypical' | 'cpiSpi';

export interface EvmInputs {
  bac: number;
  pv: number;
  ev: number;
  ac: number;
}

// Status-date numbers from the Build an EVM Dashboard tutorial dataset.
export const TUTORIAL_INPUTS: EvmInputs = { bac: 525000, pv: 378390, ev: 241500, ac: 268000 };

export const EAC_METHODS: { id: EacMethod; label: string; formula: string; assumption: string }[] = [
  {
    id: 'cpi',
    label: 'BAC ÷ CPI',
    formula: 'BAC / CPI',
    assumption: 'Cost efficiency so far continues for the remaining work.',
  },
  {
    id: 'atypical',
    label: 'AC + (BAC − EV)',
    formula: 'AC + (BAC − EV)',
    assumption: 'The overrun so far was a one-off; the rest goes to plan.',
  },
  {
    id: 'cpiSpi',
    label: 'AC + (BAC − EV) ÷ (CPI × SPI)',
    formula: 'AC + (BAC − EV) / (CPI × SPI)',
    assumption: 'Being behind schedule also drives up the cost of the remaining work.',
  },
];

const divide = (a: number, b: number): number | null => (b === 0 || !Number.isFinite(a / b) ? null : a / b);

export interface EvmResults {
  cv: number;
  sv: number;
  cpi: number | null;
  spi: number | null;
  eac: Record<EacMethod, number | null>;
  etc: number | null;
  vac: number | null;
  tcpi: number | null;
}

export function calculate(inputs: EvmInputs, method: EacMethod): EvmResults {
  const { bac, pv, ev, ac } = inputs;
  const cpi = divide(ev, ac);
  const spi = divide(ev, pv);
  const eac: Record<EacMethod, number | null> = {
    cpi: cpi === null ? null : divide(bac, cpi),
    atypical: ac + (bac - ev),
    cpiSpi: cpi === null || spi === null ? null : (() => {
      const remaining = divide(bac - ev, cpi * spi);
      return remaining === null ? null : ac + remaining;
    })(),
  };
  const chosen = eac[method];
  return {
    cv: ev - ac,
    sv: ev - pv,
    cpi,
    spi,
    eac,
    etc: chosen === null ? null : chosen - ac,
    vac: chosen === null ? null : bac - chosen,
    tcpi: divide(bac - ev, bac - ac),
  };
}

export type Health = 'good' | 'watch' | 'poor';

// A common reporting convention: at or above 1.0 is on track, within 10% is
// worth watching, more than 10% off is a problem.
export function indexHealth(value: number | null): Health | null {
  if (value === null) return null;
  return value >= 1 ? 'good' : value >= 0.9 ? 'watch' : 'poor';
}

export function statusSummary(cpi: number | null, spi: number | null): string {
  if (cpi === null || spi === null) return 'Enter actual cost and planned value to see where the program stands.';
  const cost = cpi >= 1 ? 'under budget' : 'over budget';
  const schedule = spi >= 1 ? 'ahead of schedule' : 'behind schedule';
  return `${cost[0].toUpperCase()}${cost.slice(1)} and ${schedule} for the work completed so far.`;
}

const EAC_DAX: Record<EacMethod, string> = {
  cpi: 'DIVIDE([BAC (Budget at Completion)], [CPI (Cost Performance Index)])',
  atypical: '[AC (Actual Cost)] + ([BAC (Budget at Completion)] - [EV (Earned Value)])',
  cpiSpi: [
    '[AC (Actual Cost)]',
    '    + DIVIDE(',
    '        [BAC (Budget at Completion)] - [EV (Earned Value)],',
    '        [CPI (Cost Performance Index)] * [SPI (Schedule Performance Index)]',
    '    )',
  ].join('\n'),
};

// The derived measures, built on the PV/EV/AC/BAC base measures from the tutorial.
export function generateDax(method: EacMethod): string {
  return [
    'CV (Cost Variance) =',
    '[EV (Earned Value)] - [AC (Actual Cost)]',
    '',
    'SV (Schedule Variance) =',
    '[EV (Earned Value)] - [PV (Planned Value)]',
    '',
    'CPI (Cost Performance Index) =',
    'DIVIDE([EV (Earned Value)], [AC (Actual Cost)])',
    '',
    'SPI (Schedule Performance Index) =',
    'DIVIDE([EV (Earned Value)], [PV (Planned Value)])',
    '',
    `EAC (Estimate at Completion) = -- ${EAC_METHODS.find((m) => m.id === method)!.formula}`,
    EAC_DAX[method],
    '',
    'ETC (Estimate to Complete) =',
    '[EAC (Estimate at Completion)] - [AC (Actual Cost)]',
    '',
    'VAC (Variance at Completion) =',
    '[BAC (Budget at Completion)] - [EAC (Estimate at Completion)]',
    '',
    'TCPI (To-Complete Performance Index) =',
    'DIVIDE(',
    '    [BAC (Budget at Completion)] - [EV (Earned Value)],',
    '    [BAC (Budget at Completion)] - [AC (Actual Cost)]',
    ')',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Earned Schedule: schedule performance measured in time instead of money.
// ES is the point on the baseline PV curve where planned value equals today's
// EV; SPI(t) = ES / AT. Unlike SPI, it doesn't drift back to 1.0 at the end of
// a late program. Dates are day serials (days since 1970-01-01, UTC).

export interface PvPoint {
  day: number;
  pv: number;
}

export const toDay = (iso: string): number => Math.round(Date.parse(`${iso}T00:00:00Z`) / 86400000);
export const fromDay = (day: number): string => new Date(Math.round(day) * 86400000).toISOString().slice(0, 10);

// Cumulative PV at month ends from the tutorial's baseline (its PV measure evaluated on each date).
export const TUTORIAL_PV_CURVE_TEXT = [
  '2026-01-01, 0',
  '2026-01-31, 49826',
  '2026-02-28, 123848',
  '2026-03-31, 227707',
  '2026-04-30, 342766',
  '2026-05-31, 417443',
  '2026-06-30, 490668',
  '2026-07-31, 525000',
].join('\n');
export const TUTORIAL_STATUS_DATE = '2026-05-15';

export function parsePvCurve(text: string): { points: PvPoint[]; error: string | null } {
  const points: PvPoint[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const [i, line] of lines.entries()) {
    const m = line.match(/^(\d{4}-\d{2}-\d{2})\s*[,;\t ]\s*\$?([\d,.]+)$/);
    if (!m) return { points: [], error: `Line ${i + 1}: expected "YYYY-MM-DD, cumulative PV".` };
    const day = toDay(m[1]);
    const pv = Number(m[2].replace(/,/g, ''));
    if (!Number.isFinite(day) || !Number.isFinite(pv)) return { points: [], error: `Line ${i + 1}: couldn't read that date or amount.` };
    points.push({ day, pv });
  }
  if (points.length < 2) return { points: [], error: 'Enter at least a start date (PV 0) and one later date.' };
  points.sort((a, b) => a.day - b.day);
  for (let i = 1; i < points.length; i++) {
    if (points[i].day === points[i - 1].day) return { points: [], error: `${fromDay(points[i].day)} appears twice.` };
    if (points[i].pv < points[i - 1].pv) {
      return { points: [], error: `PV falls at ${fromDay(points[i].day)}. Enter cumulative PV, which never goes down.` };
    }
  }
  return { points, error: null };
}

export interface EsResults {
  start: number;
  plannedFinish: number;
  esDay: number; // the date the earned work was planned to be done by
  es: number; // days from start
  at: number; // days from start to the status date
  pd: number; // planned duration, days
  spiT: number | null;
  svT: number; // days, negative = behind
  ieacT: number | null; // forecast duration, days
  forecastFinish: number | null;
}

export function earnedSchedule(points: PvPoint[], ev: number, statusDay: number): EsResults {
  const start = points[0].day;
  const last = points[points.length - 1];
  // The last point whose PV doesn't exceed EV, then interpolate to the next one.
  let i = 0;
  for (let k = 0; k < points.length; k++) if (points[k].pv <= ev) i = k;
  let esDay = points[i].day;
  if (i < points.length - 1) {
    const a = points[i];
    const b = points[i + 1];
    const frac = b.pv === a.pv ? 0 : Math.min(1, Math.max(0, (ev - a.pv) / (b.pv - a.pv)));
    esDay = a.day + frac * (b.day - a.day);
  }
  const es = esDay - start;
  const at = statusDay - start;
  const pd = last.day - start;
  const spiT = at > 0 ? es / at : null;
  const ieacT = spiT && spiT > 0 ? pd / spiT : null;
  return {
    start,
    plannedFinish: last.day,
    esDay,
    es,
    at,
    pd,
    spiT,
    svT: es - at,
    ieacT,
    forecastFinish: ieacT === null ? null : start + ieacT,
  };
}

// The Earned Schedule measures, on the tutorial's daily PV measure and disconnected DimDate.
export const EARNED_SCHEDULE_DAX = [
  'ES Date =',
  'VAR EarnedValue = [EV (Earned Value)]',
  'VAR Curve =',
  '    ADDCOLUMNS(ALL(DimDate[Date]), "@PV", [PV (Planned Value)])',
  'VAR LastDate =',
  '    MAXX(FILTER(Curve, [@PV] <= EarnedValue), DimDate[Date])',
  'VAR PVAtLast =',
  '    MAXX(FILTER(Curve, DimDate[Date] = LastDate), [@PV])',
  'VAR PVNext =',
  '    MAXX(FILTER(Curve, DimDate[Date] = LastDate + 1), [@PV])',
  'RETURN',
  '    LastDate',
  '        + IF(',
  '            ISBLANK(PVNext),',
  '            0,',
  '            DIVIDE(EarnedValue - PVAtLast, PVNext - PVAtLast, 0)',
  '        )',
  '',
  'Project Start =',
  'MIN(Tasks[PlannedStart])',
  '',
  'Planned Finish =',
  'MAX(Tasks[PlannedEnd])',
  '',
  'ES (Days) =',
  'CONVERT([ES Date] - [Project Start], DOUBLE)',
  '',
  'AT (Days) =',
  'CONVERT(MAX(DimDate[Date]) - [Project Start], DOUBLE)',
  '',
  'SPI(t) =',
  'DIVIDE([ES (Days)], [AT (Days)])',
  '',
  'SV(t) (Days) =',
  '[ES (Days)] - [AT (Days)]',
  '',
  'IEAC(t) (Days) =',
  'DIVIDE(CONVERT([Planned Finish] - [Project Start], DOUBLE), [SPI(t)])',
  '',
  'Forecast Finish =',
  '[Project Start] + [IEAC(t) (Days)]',
].join('\n');
