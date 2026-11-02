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
