// Pure logic for the Requirements Traceability tool. Coverage, verification,
// and pass rate follow the Build a Requirements Traceability Matrix tutorial:
// a requirement is covered when any test case is mapped to it, verified when a
// mapped test has passed, and pass rate counts test result rows. A test with
// several results counts as passed if any of them is a Pass.

export type TestStatus = 'Pass' | 'Fail' | 'Not run';
export type ReqStatus = 'Verified' | 'Failed' | 'Not yet run' | 'No test mapped';

export const REQ_STATUSES: ReqStatus[] = ['Verified', 'Failed', 'Not yet run', 'No test mapped'];

// 'any': verified once any mapped test passes (the tutorial's rule).
// 'all': verified only when every mapped test has passed.
export type VerifiedRule = 'any' | 'all';

export interface Requirement {
  id: string;
  text: string;
}

export interface TestResult {
  testId: string;
  passed: boolean;
}

export interface RequirementRow extends Requirement {
  tests: string[];
  passed: number;
  status: ReqStatus;
}

export interface TraceAnalysis {
  rows: RequirementRow[];
  // Every test case ID mapped to a known requirement, in natural sort order: the matrix columns.
  testIds: string[];
  testStatus: Map<string, TestStatus>;
  counts: Record<ReqStatus, number>;
  total: number;
  covered: number;
  verified: number;
  executed: number;
  passedRuns: number;
  // Mapping rows whose requirement isn't in the requirements list.
  unknownRequirements: string[];
  // Tests with results that aren't mapped to any requirement: they verify nothing.
  unmappedTests: string[];
  duplicateRequirements: string[];
}

function splitCells(line: string) {
  return (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.trim());
}

// A first line whose first cell names a column, not an ID, is a header row.
function isHeader(cell: string) {
  return !/\d/.test(cell) && /id|requirement|test|case/i.test(cell);
}

function lines(text: string) {
  const out: { cells: string[]; n: number }[] = [];
  let first = true;
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const cells = splitCells(line);
    const isFirst = first;
    first = false;
    if (isFirst && isHeader(cells[0])) return;
    out.push({ cells, n: i + 1 });
  });
  return out;
}

// One requirement per line: ID, then optional text (which can contain commas).
export function parseRequirements(text: string): { requirements: Requirement[]; errors: string[] } {
  const requirements: Requirement[] = [];
  const errors: string[] = [];
  for (const { cells, n } of lines(text)) {
    if (!cells[0]) {
      errors.push(`Requirements line ${n}: starts with an empty ID.`);
      continue;
    }
    requirements.push({ id: cells[0], text: cells.slice(1).filter(Boolean).join(', ') });
  }
  return { requirements, errors };
}

// One link per line: requirement ID, then one or more test case IDs. Several
// tests can share a line, in their own cells or separated by semicolons.
export function parseLinks(text: string): { links: [string, string][]; errors: string[] } {
  const links: [string, string][] = [];
  const errors: string[] = [];
  for (const { cells, n } of lines(text)) {
    const tests = cells
      .slice(1)
      .flatMap((c) => c.split(/[;|]/))
      .map((t) => t.trim())
      .filter(Boolean);
    if (!cells[0] || tests.length === 0) {
      errors.push(`Trace links line ${n}: needs a requirement ID and at least one test case ID.`);
      continue;
    }
    for (const t of tests) links.push([cells[0], t]);
  }
  return { links, errors };
}

const STATUS_WORDS: Record<string, boolean> = { pass: true, passed: true, fail: false, failed: false };

// One result per line: test case ID, optional date, status (Pass or Fail).
export function parseResults(text: string): { results: TestResult[]; errors: string[] } {
  const results: TestResult[] = [];
  const errors: string[] = [];
  for (const { cells, n } of lines(text)) {
    const status = STATUS_WORDS[(cells.at(-1) ?? '').toLowerCase()];
    if (cells.length < 2 || !cells[0] || status === undefined) {
      errors.push(`Test results line ${n}: needs a test case ID and a status of Pass or Fail last.`);
      continue;
    }
    results.push({ testId: cells[0], passed: status });
  }
  return { results, errors };
}

export function analyze(
  requirements: Requirement[],
  links: [string, string][],
  results: TestResult[],
  rule: VerifiedRule,
): TraceAnalysis {
  const seen = new Set<string>();
  const duplicateRequirements: string[] = [];
  const reqs: Requirement[] = [];
  for (const r of requirements) {
    if (seen.has(r.id)) {
      if (!duplicateRequirements.includes(r.id)) duplicateRequirements.push(r.id);
      continue;
    }
    seen.add(r.id);
    reqs.push(r);
  }

  const testsByReq = new Map<string, string[]>();
  const testIds: string[] = [];
  const unknownRequirements: string[] = [];
  for (const [req, test] of links) {
    if (!seen.has(req)) {
      if (!unknownRequirements.includes(req)) unknownRequirements.push(req);
      continue;
    }
    const list = testsByReq.get(req) ?? [];
    if (!list.includes(test)) list.push(test);
    testsByReq.set(req, list);
    if (!testIds.includes(test)) testIds.push(test);
  }
  testIds.sort((x, y) => x.localeCompare(y, undefined, { numeric: true }));

  const testStatus = new Map<string, TestStatus>();
  for (const id of testIds) testStatus.set(id, 'Not run');
  const unmappedTests: string[] = [];
  for (const r of results) {
    if (!testStatus.has(r.testId)) {
      if (!unmappedTests.includes(r.testId)) unmappedTests.push(r.testId);
      continue;
    }
    if (r.passed) testStatus.set(r.testId, 'Pass');
    else if (testStatus.get(r.testId) !== 'Pass') testStatus.set(r.testId, 'Fail');
  }

  const rows: RequirementRow[] = reqs.map((r) => {
    const tests = testsByReq.get(r.id) ?? [];
    const statuses = tests.map((t) => testStatus.get(t));
    const passed = statuses.filter((s) => s === 'Pass').length;
    let status: ReqStatus;
    if (tests.length === 0) status = 'No test mapped';
    else if (rule === 'any' ? passed > 0 : passed === tests.length) status = 'Verified';
    else if (statuses.includes('Fail')) status = 'Failed';
    else status = 'Not yet run';
    return { ...r, tests, passed, status };
  });

  const counts = Object.fromEntries(REQ_STATUSES.map((s) => [s, rows.filter((r) => r.status === s).length])) as Record<
    ReqStatus,
    number
  >;

  return {
    rows,
    testIds,
    testStatus,
    counts,
    total: rows.length,
    covered: rows.length - counts['No test mapped'],
    verified: counts.Verified,
    executed: results.length,
    passedRuns: results.filter((r) => r.passed).length,
    unknownRequirements,
    unmappedTests,
    duplicateRequirements,
  };
}

// The tutorial's four CSVs, minus test_cases.csv (the matrix only needs IDs).
export const TUTORIAL_REQUIREMENTS = `RequirementID,RequirementText
REQ-001,System shall power on within 5 seconds
REQ-002,System shall operate at -20C to 50C
REQ-003,System shall log all user actions
REQ-004,System shall encrypt data at rest
REQ-005,System shall support 100 concurrent users
REQ-006,System shall provide an audible alarm on failure
REQ-007,System shall support firmware update without data loss
REQ-008,System shall meet MTBF of 5000 hours`;

export const TUTORIAL_LINKS = `RequirementID,TestCaseID
REQ-001,TC-01
REQ-001,TC-08
REQ-002,TC-02
REQ-003,TC-03
REQ-003,TC-08
REQ-004,TC-04
REQ-004,TC-09
REQ-005,TC-05
REQ-006,TC-06
REQ-007,TC-07`;

export const TUTORIAL_RESULTS = `TestCaseID,ExecutionDate,Status
TC-01,2026-06-01,Pass
TC-02,2026-06-02,Pass
TC-03,2026-06-03,Pass
TC-04,2026-06-04,Pass
TC-05,2026-06-05,Fail
TC-06,2026-06-06,Pass
TC-08,2026-06-09,Pass
TC-09,2026-06-10,Pass`;

export const STATUS_HEX: Record<ReqStatus, string> = {
  Verified: '#34D399',
  Failed: '#F87171',
  'Not yet run': '#FBBF24',
  'No test mapped': '#A1A1AA',
};

export function generateDax(rule: VerifiedRule): string {
  const verified =
    rule === 'any'
      ? [
          'Requirements Verified =',
          'VAR PassingTestCaseIDs =',
          '    CALCULATETABLE(',
          '        VALUES(FactTestResults[TestCaseID]),',
          '        FactTestResults[Status] = "Pass"',
          '    )',
          'VAR VerifiedRequirementIDs =',
          '    CALCULATETABLE(',
          '        VALUES(BridgeRequirementTest[RequirementID]),',
          '        FILTER(',
          '            BridgeRequirementTest,',
          '            BridgeRequirementTest[TestCaseID] IN PassingTestCaseIDs',
          '        )',
          '    )',
          'RETURN',
          '    COUNTROWS(VerifiedRequirementIDs)',
        ]
      : [
          '-- Verified only when every mapped test case has a passing result',
          'Requirements Verified =',
          'VAR PassingTestCaseIDs =',
          '    CALCULATETABLE(',
          '        VALUES(FactTestResults[TestCaseID]),',
          '        FactTestResults[Status] = "Pass"',
          '    )',
          'VAR VerifiedRequirementIDs =',
          '    FILTER(',
          '        VALUES(BridgeRequirementTest[RequirementID]),',
          '        -- context transition: the test cases mapped to this one requirement',
          '        ISEMPTY(',
          '            EXCEPT(',
          '                CALCULATETABLE(VALUES(BridgeRequirementTest[TestCaseID])),',
          '                PassingTestCaseIDs',
          '            )',
          '        )',
          '    )',
          'RETURN',
          '    COUNTROWS(VerifiedRequirementIDs)',
        ];

  return [
    'Total Requirements =',
    'COUNTROWS(DimRequirement)',
    '',
    'Requirements Covered =',
    'DISTINCTCOUNT(BridgeRequirementTest[RequirementID])',
    '',
    'Requirements With No Test Mapped =',
    '[Total Requirements] - [Requirements Covered]',
    '',
    'Coverage % =',
    'DIVIDE([Requirements Covered], [Total Requirements])',
    '',
    ...verified,
    '',
    'Verified % =',
    'DIVIDE([Requirements Verified], [Total Requirements])',
    '',
    'Tests Executed =',
    'COUNTROWS(FactTestResults)',
    '',
    'Tests Passed =',
    'CALCULATE([Tests Executed], FactTestResults[Status] = "Pass")',
    '',
    'Pass Rate =',
    'DIVIDE([Tests Passed], [Tests Executed])',
    '',
    '-- One status per requirement, for a table visual with DimRequirement[RequirementID] on rows',
    'Verification Status =',
    'VAR PassingTestCaseIDs =',
    '    CALCULATETABLE(',
    '        VALUES(FactTestResults[TestCaseID]),',
    '        FactTestResults[Status] = "Pass"',
    '    )',
    'VAR FailedTestCaseIDs =',
    '    EXCEPT(',
    '        CALCULATETABLE(',
    '            VALUES(FactTestResults[TestCaseID]),',
    '            FactTestResults[Status] = "Fail"',
    '        ),',
    '        PassingTestCaseIDs',
    '    )',
    'VAR HasFailedTest =',
    '    NOT ISEMPTY(',
    '        FILTER(',
    '            VALUES(BridgeRequirementTest[TestCaseID]),',
    '            BridgeRequirementTest[TestCaseID] IN FailedTestCaseIDs',
    '        )',
    '    )',
    'RETURN',
    '    IF(',
    '        HASONEVALUE(DimRequirement[RequirementID]),',
    '        SWITCH(',
    '            TRUE(),',
    '            [Requirements Covered] = 0, "No test mapped",',
    '            [Requirements Verified] > 0, "Verified",',
    '            HasFailedTest, "Failed",',
    '            "Not yet run"',
    '        )',
    '    )',
    '',
    '-- Row color for that table: Format > Cell elements > Background color > fx > Field value',
    'Status Color =',
    'SWITCH(',
    '    [Verification Status],',
    ...REQ_STATUSES.map((s, i) => `    "${s}", "${STATUS_HEX[s]}"${i < REQ_STATUSES.length - 1 ? ',' : ''}`),
    ')',
  ].join('\n');
}
