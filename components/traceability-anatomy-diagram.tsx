import { cn } from '@/lib/cn';

// requirements.csv, requirement_test_map.csv, and test_results.csv from the traceability matrix tutorial.
const REQUIREMENTS = ['REQ-001', 'REQ-002', 'REQ-003', 'REQ-004', 'REQ-005', 'REQ-006', 'REQ-007', 'REQ-008'];
const TEST_CASES = ['TC-01', 'TC-02', 'TC-03', 'TC-04', 'TC-05', 'TC-06', 'TC-07', 'TC-08', 'TC-09'];

const BRIDGE: [string, string][] = [
  ['REQ-001', 'TC-01'],
  ['REQ-001', 'TC-08'],
  ['REQ-002', 'TC-02'],
  ['REQ-003', 'TC-03'],
  ['REQ-003', 'TC-08'],
  ['REQ-004', 'TC-04'],
  ['REQ-004', 'TC-09'],
  ['REQ-005', 'TC-05'],
  ['REQ-006', 'TC-06'],
  ['REQ-007', 'TC-07'],
];

const RESULTS: Record<string, 'Pass' | 'Fail'> = {
  'TC-01': 'Pass',
  'TC-02': 'Pass',
  'TC-03': 'Pass',
  'TC-04': 'Pass',
  'TC-05': 'Fail',
  'TC-06': 'Pass',
  'TC-08': 'Pass',
  'TC-09': 'Pass',
};

type TestStatus = 'Pass' | 'Fail' | 'Not run';
type ReqStatus = 'Verified' | 'Covered' | 'Gap';

const testStatus = (tc: string): TestStatus => RESULTS[tc] ?? 'Not run';
const linked = (req: string, tc: string) => BRIDGE.some(([r, t]) => r === req && t === tc);
const testsFor = (req: string) => BRIDGE.filter(([r]) => r === req).map(([, t]) => t);

// Same logic as Requirements Covered (any bridge row) and Requirements Verified (a bridge row whose test passed).
const reqStatus = (req: string): ReqStatus => {
  const tests = testsFor(req);
  if (tests.length === 0) return 'Gap';
  return tests.some((t) => testStatus(t) === 'Pass') ? 'Verified' : 'Covered';
};

const covered = REQUIREMENTS.filter((r) => reqStatus(r) !== 'Gap');
const verified = REQUIREMENTS.filter((r) => reqStatus(r) === 'Verified');
const coveredOnly = REQUIREMENTS.filter((r) => reqStatus(r) === 'Covered');
const gaps = REQUIREMENTS.filter((r) => reqStatus(r) === 'Gap');
const executed = Object.keys(RESULTS).length;
const passed = Object.values(RESULTS).filter((s) => s === 'Pass').length;
const sharedTest = TEST_CASES.find((tc) => BRIDGE.filter(([, t]) => t === tc).length > 1)!;

const pct = (n: number, d: number) => `${((n / d) * 100).toFixed(1)}%`;
const short = (id: string) => id.split('-')[1];

const DOT: Record<TestStatus, string> = {
  Pass: 'bg-emerald-500',
  Fail: 'bg-red-500',
  'Not run': 'border-2 border-fd-muted-foreground bg-transparent',
};

const REQ_PILL: Record<ReqStatus, string> = {
  Verified: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Covered: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Gap: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

function Badge({ n, className }: { n: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white',
        className,
      )}
    >
      {n}
    </span>
  );
}

export function TraceabilityAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a traceability matrix
      </p>
      <p className="mb-4 text-xs text-fd-muted-foreground">
        The traceability tutorial&apos;s dataset: {REQUIREMENTS.length} requirements, {TEST_CASES.length} test cases,{' '}
        {BRIDGE.length} bridge rows.
      </p>

      <div className="overflow-x-auto rounded-lg border border-fd-border bg-fd-background p-2 sm:p-3">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr className="text-fd-muted-foreground">
              <th className="px-1 py-1 text-left font-normal">REQ</th>
              {TEST_CASES.map((tc) => (
                <th key={tc} className={cn('px-0.5 py-1 text-center font-normal', tc === sharedTest && 'bg-violet-500/10')}>
                  <span className="flex flex-col items-center gap-0.5">
                    {tc === sharedTest && <Badge n="4" className="size-4 bg-violet-500 text-[9px]" />}
                    {short(tc)}
                  </span>
                </th>
              ))}
              <th className="px-1 py-1 text-left font-sans text-[11px] font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {REQUIREMENTS.map((req) => {
              const status = reqStatus(req);
              return (
                <tr key={req} className={cn('border-t border-fd-border', status === 'Gap' && 'bg-red-500/10')}>
                  <td className="px-1 py-1.5">{short(req)}</td>
                  {TEST_CASES.map((tc) => (
                    <td key={tc} className={cn('px-0.5 py-1.5 text-center', tc === sharedTest && 'bg-violet-500/10')}>
                      {linked(req, tc) && (
                        <span className={cn('mx-auto block size-3 rounded-full', DOT[testStatus(tc)])} />
                      )}
                    </td>
                  ))}
                  <td className="px-1 py-1.5">
                    <span className="inline-flex items-center gap-1">
                      <span className={cn('rounded px-1 font-sans text-[10px] font-semibold whitespace-nowrap', REQ_PILL[status])}>
                        {status === 'Covered' ? 'Not verified' : status}
                      </span>
                      {status === 'Gap' && <Badge n="1" className="size-4 bg-red-500 text-[9px]" />}
                      {status === 'Covered' && <Badge n="2" className="size-4 bg-amber-500 text-[9px]" />}
                    </span>
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-fd-border text-fd-muted-foreground">
              <td className="px-1 py-1.5 font-sans text-[10px]">
                <Badge n="3" className="size-4 bg-sky-500 text-[9px]" />
              </td>
              {TEST_CASES.map((tc) => {
                const s = testStatus(tc);
                return (
                  <td key={tc} className={cn('px-0.5 py-1.5 text-center font-sans text-[10px] font-semibold', tc === sharedTest && 'bg-violet-500/10')}>
                    <span
                      className={cn(
                        s === 'Pass' && 'text-emerald-600 dark:text-emerald-400',
                        s === 'Fail' && 'text-red-600 dark:text-red-400',
                      )}
                    >
                      {s === 'Pass' ? 'P' : s === 'Fail' ? 'F' : '—'}
                    </span>
                  </td>
                );
              })}
              <td className="px-1 py-1.5 font-sans text-[10px]">test result</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11px] text-fd-muted-foreground">
          <span className="flex items-center gap-1">
            <span className={cn('size-2.5 rounded-full', DOT.Pass)} /> mapped, passed
          </span>
          <span className="flex items-center gap-1">
            <span className={cn('size-2.5 rounded-full', DOT.Fail)} /> mapped, failed
          </span>
          <span className="flex items-center gap-1">
            <span className={cn('size-2.5 rounded-full', DOT['Not run'])} /> mapped, not run yet
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-red-500/40 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="1" className="bg-red-500" />
            Coverage %
          </p>
          <p className="mt-1 font-mono text-lg font-semibold">{pct(covered.length, REQUIREMENTS.length)}</p>
          <p className="font-mono text-[11px] text-fd-muted-foreground">
            {covered.length} of {REQUIREMENTS.length} requirements have a test
          </p>
        </div>
        <div className="rounded-lg border border-amber-500/40 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="2" className="bg-amber-500" />
            Verified %
          </p>
          <p className="mt-1 font-mono text-lg font-semibold">{pct(verified.length, REQUIREMENTS.length)}</p>
          <p className="font-mono text-[11px] text-fd-muted-foreground">
            {verified.length} of {REQUIREMENTS.length} have a passing test
          </p>
        </div>
        <div className="rounded-lg border border-sky-500/40 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="3" className="bg-sky-500" />
            Pass Rate
          </p>
          <p className="mt-1 font-mono text-lg font-semibold">{pct(passed, executed)}</p>
          <p className="font-mono text-[11px] text-fd-muted-foreground">
            {passed} of {executed} executions passed
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">Covered</span> — a requirement with at least one
            dot. <span className="whitespace-nowrap">{gaps.join(', ')}</span> has an empty row: no bridge row at all, so it&apos;s the entire gap list.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Verified</span> — a requirement with at least
            one <strong>green</strong> dot. <span className="whitespace-nowrap">{coveredOnly[0]}</span> and{' '}
            <span className="whitespace-nowrap">{coveredOnly[1]}</span> are covered but not verified: one test failed,
            the other hasn&apos;t run. &quot;Not run&quot; is its own state, not a fail.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Pass Rate</span> — counts test executions, not
            requirements. It matches Coverage % here ({pct(passed, executed)}) by coincidence, which is exactly why a
            report showing it alone can be misread as either of the other two.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">Bridge table</span> — {sharedTest} verifies
            two requirements, and three requirements have two tests each. Counting bridge rows gives {BRIDGE.length};{' '}
            <span className="font-mono">DISTINCTCOUNT(RequirementID)</span> gives the real {covered.length}.
          </p>
        </div>
      </div>
    </div>
  );
}
