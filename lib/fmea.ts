// Pure logic for the FMEA / RPN Calculator tool. Scoring and measure names
// match the Build an FMEA Dashboard tutorial: RPN = Severity x Occurrence x
// Detection, and Action Priority checks the severity override before the RPN
// thresholds, so a severe but rare, well-detected failure mode isn't buried.

export type Priority = 'High' | 'Medium' | 'Low';

export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

export interface FmeaSettings {
  severityOverride: boolean;
  severityAt: number;
  high: number;
  medium: number;
}

export const TUTORIAL_SETTINGS: FmeaSettings = { severityOverride: true, severityAt: 9, high: 100, medium: 50 };

export function settingsError(s: FmeaSettings): string | null {
  if (!Number.isInteger(s.severityAt) || s.severityAt < 1 || s.severityAt > 10) {
    return 'The severity override needs a whole number from 1 to 10.';
  }
  if (![s.high, s.medium].every((v) => Number.isInteger(v) && v >= 1 && v <= 1000)) {
    return 'RPN thresholds must be whole numbers from 1 to 1,000.';
  }
  if (s.high <= s.medium) return 'The High threshold must be above the Medium threshold.';
  return null;
}

export interface FailureMode {
  id: string;
  description: string;
  severity: number;
  occurrence: number;
  detection: number;
}

export interface ScoredMode extends FailureMode {
  rpn: number;
  rpnOnly: Priority;
  priority: Priority;
  raisedBySeverity: boolean;
}

export function rpnPriority(rpn: number, s: FmeaSettings): Priority {
  return rpn >= s.high ? 'High' : rpn >= s.medium ? 'Medium' : 'Low';
}

export function score(mode: FailureMode, s: FmeaSettings): ScoredMode {
  const rpn = mode.severity * mode.occurrence * mode.detection;
  const rpnOnly = rpnPriority(rpn, s);
  const severe = s.severityOverride && mode.severity >= s.severityAt;
  return { ...mode, rpn, rpnOnly, priority: severe ? 'High' : rpnOnly, raisedBySeverity: severe && rpnOnly !== 'High' };
}

const isRating = (text: string | undefined) => /^(10|[1-9])$/.test((text ?? '').trim());

// One failure mode per line: ID, description, severity, occurrence, detection.
// Tabs or commas; with commas, everything between the ID and the last three
// numbers is the description, so descriptions can contain commas.
export function parseModes(text: string): { modes: FailureMode[]; errors: string[] } {
  const modes: FailureMode[] = [];
  const errors: string[] = [];
  let firstLine = true;
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const isFirst = firstLine;
    firstLine = false;
    const cells = (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.trim());
    const [sev, occ, det] = cells.slice(-3);
    if (cells.length < 4 || ![sev, occ, det].every(isRating)) {
      // An unreadable first line with words in it is a header row.
      if (!(isFirst && /[a-z]/i.test(line))) {
        errors.push(`Line ${i + 1}: needs an ID, then severity, occurrence, and detection from 1 to 10.`);
      }
      return;
    }
    modes.push({
      id: cells[0],
      description: cells.slice(1, -3).join(', '),
      severity: Number(sev),
      occurrence: Number(occ),
      detection: Number(det),
    });
  });
  return { modes, errors };
}

// Each failure mode's current (latest) assessment in the tutorial's register.
export const TUTORIAL_MODES = `FailureModeID,Description,Severity,Occurrence,Detection
FM-01,Bearing seizure from inadequate lubrication,7,2,5
FM-02,Firmware crash on invalid sensor input,6,3,7
FM-03,Weld corrosion undetected between inspections,9,1,3
FM-04,Short circuit from chafed insulation,8,4,4
FM-05,Calibration drift over time,5,4,3
FM-06,Update failure under low battery,4,5,5
FM-07,Fitting leak under vibration,6,3,4
FM-08,Voltage spike on startup,7,2,2`;

export const PRIORITY_HEX: Record<Priority, string> = { High: '#F87171', Medium: '#FBBF24', Low: '#34D399' };

export function generateDax(s: FmeaSettings): string {
  return [
    'Current RPN =',
    '[Current Severity] * [Current Occurrence] * [Current Detection]',
    '',
    'Action Priority =',
    'SWITCH(',
    '    TRUE(),',
    ...(s.severityOverride
      ? [`    [Current Severity] >= ${s.severityAt}, "High", -- severity override: checked before RPN`]
      : []),
    `    [Current RPN] >= ${s.high}, "High",`,
    `    [Current RPN] >= ${s.medium}, "Medium",`,
    '    [Current RPN] > 0, "Low",',
    '    BLANK()',
    ')',
    '',
    '-- Bar color for an RPN chart: Format > Bars > Color > fx > Format style: Field value',
    'Priority Color =',
    'SWITCH(',
    '    [Action Priority],',
    `    "High", "${PRIORITY_HEX.High}",`,
    `    "Medium", "${PRIORITY_HEX.Medium}",`,
    `    "Low", "${PRIORITY_HEX.Low}"`,
    ')',
  ].join('\n');
}
