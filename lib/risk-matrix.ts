// Pure logic for the Risk Matrix Builder tool. Scoring and measure names match
// the Build a Risk Register Dashboard tutorial: Risk Score = Likelihood x
// Impact, banded by SWITCH(TRUE(), ...) thresholds checked highest first.

export type Level = 'Critical' | 'High' | 'Medium' | 'Low';

export const LEVELS: Level[] = ['Critical', 'High', 'Medium', 'Low'];

export interface Thresholds {
  critical: number;
  high: number;
  medium: number;
}

export const TUTORIAL_THRESHOLDS: Thresholds = { critical: 15, high: 9, medium: 4 };

export function levelOf(score: number, t: Thresholds): Level {
  return score >= t.critical ? 'Critical' : score >= t.high ? 'High' : score >= t.medium ? 'Medium' : 'Low';
}

export function thresholdError(t: Thresholds): string | null {
  const values = [t.critical, t.high, t.medium];
  if (values.some((v) => !Number.isInteger(v) || v < 1 || v > 25)) return 'Each threshold must be a whole number from 1 to 25.';
  if (!(t.critical > t.high && t.high > t.medium)) return 'Thresholds must go down: Critical above High above Medium.';
  return null;
}

export interface Risk {
  id: string;
  title: string;
  likelihood: number;
  impact: number;
}

export interface ParseResult {
  risks: Risk[];
  errors: string[];
}

const isRating = (text: string | undefined) => /^[1-5]$/.test((text ?? '').trim());

// One risk per line: ID, title, likelihood, impact. Tabs (a paste from Excel)
// or commas; with commas, anything between the ID and the last two numbers is
// the title, so titles can contain commas. The title is optional.
export function parseRisks(text: string): ParseResult {
  const risks: Risk[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  let firstLine = true;
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const isFirst = firstLine;
    firstLine = false;
    const cells = (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.trim());
    const impactText = cells.at(-1);
    const likelihoodText = cells.at(-2);
    if (cells.length < 3 || !isRating(likelihoodText) || !isRating(impactText)) {
      // An unreadable first line with words in it is a header row.
      if (!(isFirst && /[a-z]/i.test(line))) {
        errors.push(`Line ${i + 1}: needs an ID, then likelihood and impact from 1 to 5.`);
      }
      return;
    }
    const id = cells[0];
    if (seen.has(id)) errors.push(`Line ${i + 1}: ${id} appears more than once; both rows are shown.`);
    seen.add(id);
    risks.push({
      id,
      title: cells.slice(1, -2).join(', '),
      likelihood: Number(likelihoodText),
      impact: Number(impactText),
    });
  });
  return { risks, errors };
}

// Current likelihood and impact for each risk in the tutorial's register
// (each risk's latest assessment).
export const TUTORIAL_RISKS = `RiskID,Description,Likelihood,Impact
RISK-01,Key supplier delivery delay,4,4
RISK-02,Requirements change after design freeze,1,3
RISK-03,Budget overrun on subsystem integration,2,3
RISK-04,Single point of failure in power supply,2,5
RISK-05,Test facility unavailable during critical window,4,2
RISK-06,Software defect rate exceeds threshold,3,3
RISK-07,Key personnel attrition,2,4
RISK-08,Regulatory approval delay,3,5`;

// Light tints that keep black cell text readable in a Power BI matrix.
export const LEVEL_HEX: Record<Level, string> = {
  Critical: '#FCA5A5',
  High: '#FDBA74',
  Medium: '#FDE68A',
  Low: '#BBF7D0',
};

export function generateDax(t: Thresholds): string {
  return [
    'Risk Score =',
    '[Current Likelihood] * [Current Impact]',
    '',
    'Risk Level =',
    'SWITCH(',
    '    TRUE(),',
    `    [Risk Score] >= ${t.critical}, "Critical",`,
    `    [Risk Score] >= ${t.high}, "High",`,
    `    [Risk Score] >= ${t.medium}, "Medium",`,
    '    "Low"',
    ')',
    '',
    '-- Background color for each cell of the 5x5 matrix visual:',
    '-- Format > Cell elements > Background color > fx > Format style: Field value',
    'Matrix Cell Color =',
    'VAR CellScore =',
    '    SELECTEDVALUE(DimLikelihood[Likelihood]) * SELECTEDVALUE(DimImpact[Impact])',
    'RETURN',
    '    SWITCH(',
    '        TRUE(),',
    `        CellScore >= ${t.critical}, "${LEVEL_HEX.Critical}",`,
    `        CellScore >= ${t.high}, "${LEVEL_HEX.High}",`,
    `        CellScore >= ${t.medium}, "${LEVEL_HEX.Medium}",`,
    `        "${LEVEL_HEX.Low}"`,
    '    )',
  ].join('\n');
}
