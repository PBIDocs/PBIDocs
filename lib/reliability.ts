// Pure calculation logic for the Reliability Calculator tool. Uptime is
// measured the same way as the Build a Reliability Dashboard tutorial: from
// the previous repair (or the in-service date, for an asset's first failure)
// to the next failure. Time after an asset's last repair isn't counted.

export interface ReliabilityTotals {
  failures: number;
  uptimeHours: number;
  repairHours: number;
}

export interface ReliabilityResults {
  mtbf: number | null;
  mttr: number | null;
  availability: number | null;
  failuresPer1000h: number | null;
  downtimePerYear: number | null;
  missionReliability: number | null;
  expectedFailures: number | null;
}

const HOURS_PER_YEAR = 8760;

const divide = (a: number, b: number): number | null => (b === 0 || !Number.isFinite(a / b) ? null : a / b);

export function calculate(t: ReliabilityTotals, missionHours: number): ReliabilityResults {
  const mtbf = divide(t.uptimeHours, t.failures);
  const mttr = divide(t.repairHours, t.failures);
  const availability = mtbf === null || mttr === null ? null : divide(mtbf, mtbf + mttr);
  return {
    mtbf,
    mttr,
    availability,
    failuresPer1000h: mtbf === null ? null : divide(1000, mtbf),
    downtimePerYear: availability === null ? null : (1 - availability) * HOURS_PER_YEAR,
    // Assumes a constant failure rate (exponential model): R(t) = e^(-t / MTBF).
    missionReliability: mtbf === null || mtbf === 0 ? null : Math.exp(-missionHours / mtbf),
    expectedFailures: mtbf === null ? null : divide(missionHours, mtbf),
  };
}

export interface AssetSummary extends ReliabilityTotals {
  asset: string;
}

export interface LogParseResult {
  assets: AssetSummary[];
  totals: ReliabilityTotals;
  errors: string[];
}

function parseDateTime(text: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?$/.exec(text.trim());
  if (!m) return null;
  const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0));
  return Number.isNaN(ms) ? null : ms;
}

const HOUR_MS = 3_600_000;

// Accepts "Asset,FailureStart,RepairComplete" or "FailureStart,RepairComplete"
// per line (commas or tabs), with or without a header row.
export function parseFailureLog(text: string, inServiceSince: string): LogParseResult {
  const errors: string[] = [];
  const start = parseDateTime(inServiceSince);
  if (start === null) errors.push('The in-service date needs to look like 2026-01-01 or 2026-01-01 08:00.');

  const events: { asset: string; failure: number; repair: number }[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const cells = line.split(/[,\t]/).map((c) => c.trim());
    const [asset, failureText, repairText] = cells.length >= 3 ? cells : ['All', cells[0], cells[1]];
    const failure = parseDateTime(failureText ?? '');
    const repair = parseDateTime(repairText ?? '');
    if (failure === null || repair === null) {
      // A first line that doesn't parse is a header, not an error.
      if (i > 0 || events.length > 0 || !/[a-z]/i.test(line)) errors.push(`Line ${i + 1}: couldn't read "${line}".`);
      return;
    }
    if (repair < failure) {
      errors.push(`Line ${i + 1}: the repair finishes before the failure starts.`);
      return;
    }
    events.push({ asset, failure, repair });
  });

  const byAsset = new Map<string, typeof events>();
  for (const e of events) byAsset.set(e.asset, [...(byAsset.get(e.asset) ?? []), e]);

  const assets: AssetSummary[] = [];
  for (const [asset, list] of byAsset) {
    list.sort((a, b) => a.failure - b.failure);
    let uptimeHours = 0;
    let repairHours = 0;
    list.forEach((e, i) => {
      const from = i === 0 ? start ?? e.failure : list[i - 1].repair;
      if (e.failure < from) {
        errors.push(`${asset}: a failure at ${new Date(e.failure).toISOString().slice(0, 16).replace('T', ' ')} overlaps the previous one or starts before the in-service date.`);
      }
      uptimeHours += Math.max(0, e.failure - from) / HOUR_MS;
      repairHours += (e.repair - e.failure) / HOUR_MS;
    });
    assets.push({ asset, failures: list.length, uptimeHours, repairHours });
  }
  assets.sort((a, b) => a.asset.localeCompare(b.asset));

  const totals = assets.reduce(
    (acc, a) => ({
      failures: acc.failures + a.failures,
      uptimeHours: acc.uptimeHours + a.uptimeHours,
      repairHours: acc.repairHours + a.repairHours,
    }),
    { failures: 0, uptimeHours: 0, repairHours: 0 },
  );
  return { assets, totals, errors };
}

// The failure log from the Build a Reliability Dashboard tutorial.
export const TUTORIAL_LOG = `AssetID,FailureStart,RepairComplete
AST-01,2026-01-11 00:00,2026-01-11 12:00
AST-01,2026-01-26 12:00,2026-01-27 00:00
AST-02,2026-01-06 00:00,2026-01-06 06:00
AST-02,2026-01-16 06:00,2026-01-16 18:00
AST-02,2026-01-28 18:00,2026-01-29 02:00
AST-03,2026-01-21 00:00,2026-01-21 04:00`;

export const TUTORIAL_IN_SERVICE = '2026-01-01';

export function generateDax(missionHours: number): string {
  return [
    'MTBF (Hours) =',
    'DIVIDE([Total Uptime Hours], [Total Failures])',
    '',
    'MTTR (Hours) =',
    'DIVIDE([Total Repair Hours], [Total Failures])',
    '',
    'Availability % =',
    'DIVIDE([MTBF (Hours)], [MTBF (Hours)] + [MTTR (Hours)])',
    '',
    'Failures per 1,000 Hours =',
    'DIVIDE(1000, [MTBF (Hours)])',
    '',
    `Mission Reliability % = -- chance of no failure in ${missionHours} hours, constant failure rate`,
    `VAR MissionHours = ${missionHours}`,
    'VAR Mtbf = [MTBF (Hours)]',
    'RETURN',
    '    IF(NOT ISBLANK(Mtbf), EXP(-DIVIDE(MissionHours, Mtbf)))',
  ].join('\n');
}
