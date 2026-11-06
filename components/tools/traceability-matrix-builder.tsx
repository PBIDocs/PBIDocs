'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Minus, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import {
  REQ_STATUSES,
  TUTORIAL_LINKS,
  TUTORIAL_REQUIREMENTS,
  TUTORIAL_RESULTS,
  analyze,
  generateDax,
  parseLinks,
  parseRequirements,
  parseResults,
  type ReqStatus,
  type TestStatus,
  type VerifiedRule,
} from '@/lib/traceability';

const PILL: Record<ReqStatus, string> = {
  Verified: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Failed: 'bg-red-500/15 text-red-700 dark:text-red-300',
  'Not yet run': 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'No test mapped': 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300',
};

const BAR: Record<ReqStatus, string> = {
  Verified: 'bg-emerald-500/70',
  Failed: 'bg-red-500/70',
  'Not yet run': 'bg-amber-500/70',
  'No test mapped': 'bg-zinc-400/60',
};

const CELL: Record<TestStatus, { icon: typeof Check; className: string; label: string }> = {
  Pass: { icon: Check, className: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300', label: 'passed' },
  Fail: { icon: X, className: 'bg-red-500/20 text-red-700 dark:text-red-300', label: 'failed' },
  'Not run': { icon: Minus, className: 'bg-amber-500/20 text-amber-700 dark:text-amber-300', label: 'not run yet' },
};

const inputClass =
  'w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

const pct = (n: number, d: number) => (d === 0 ? '–' : `${(Math.round((n / d) * 1000) / 10).toString()}%`);

const listIds = (ids: string[], max = 6) =>
  ids.length > max ? `${ids.slice(0, max).join(', ')} and ${ids.length - max} more` : ids.join(', ');

export function TraceabilityMatrixBuilder() {
  const [reqText, setReqText] = useState(TUTORIAL_REQUIREMENTS);
  const [linkText, setLinkText] = useState(TUTORIAL_LINKS);
  const [resultText, setResultText] = useState(TUTORIAL_RESULTS);
  const [rule, setRule] = useState<VerifiedRule>('any');
  const [copied, setCopied] = useState(false);

  const reqs = useMemo(() => parseRequirements(reqText), [reqText]);
  const links = useMemo(() => parseLinks(linkText), [linkText]);
  const results = useMemo(() => parseResults(resultText), [resultText]);
  const a = useMemo(
    () => analyze(reqs.requirements, links.links, results.results, rule),
    [reqs, links, results, rule],
  );
  const dax = generateDax(rule);

  const errors = [...reqs.errors, ...links.errors, ...results.errors];
  const warnings = [
    a.duplicateRequirements.length > 0 &&
      `Listed more than once, counted once: ${listIds(a.duplicateRequirements)}.`,
    a.unknownRequirements.length > 0 &&
      `Trace links to requirements that aren't in the requirements list, left out: ${listIds(a.unknownRequirements)}.`,
    a.unmappedTests.length > 0 &&
      `Test results for test cases not mapped to any requirement, so they verify nothing and only count toward pass rate: ${listIds(a.unmappedTests)}.`,
  ].filter((w): w is string => Boolean(w));

  const gaps = a.rows.filter((r) => r.status === 'No test mapped');
  const kpis = [
    { label: 'Requirements', value: String(a.total), sub: `${a.testIds.length} test cases mapped` },
    { label: 'Coverage', value: pct(a.covered, a.total), sub: `${a.covered} of ${a.total} have a test` },
    { label: 'Verified', value: pct(a.verified, a.total), sub: `${a.verified} of ${a.total} passed` },
    { label: 'Pass rate', value: pct(a.passedRuns, a.executed), sub: `${a.passedRuns} of ${a.executed} results` },
  ];

  const textareas = [
    {
      label: 'Requirements',
      value: reqText,
      set: setReqText,
      hint: 'ID, then optional text.',
    },
    {
      label: 'Trace links',
      value: linkText,
      set: setLinkText,
      hint: 'Requirement ID, test case ID. Several tests on one line work too.',
    },
    {
      label: 'Test results',
      value: resultText,
      set: setResultText,
      hint: 'Test case ID, optional date, Pass or Fail.',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-xl border border-fd-border p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          {textareas.map((t) => (
            <label key={t.label} className="flex flex-col gap-1.5 text-sm font-medium">
              {t.label}
              <textarea
                value={t.value}
                onChange={(e) => t.set(e.target.value)}
                rows={10}
                spellCheck={false}
                className={cn(inputClass, 'resize-y font-mono text-xs')}
              />
              <span className="text-xs font-normal text-fd-muted-foreground">{t.hint}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-fd-muted-foreground">
          One row per line, commas or tabs, so a copy from Excel works; a header row is skipped. The defaults are the
          CSVs from the{' '}
          <Link href="/tutorials/build-a-requirements-traceability-matrix" className="text-fd-primary hover:underline">
            traceability matrix tutorial
          </Link>
          .
        </p>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">A requirement is verified when</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['any', 'Any mapped test has passed'],
                ['all', 'Every mapped test has passed'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={rule === value}
                onClick={() => setRule(value)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm transition-colors',
                  rule === value
                    ? 'border-fd-primary bg-fd-primary/10 font-medium text-fd-primary'
                    : 'border-fd-border text-fd-muted-foreground hover:bg-fd-accent',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-fd-muted-foreground">
            The tutorial uses &quot;any&quot;. &quot;Every&quot; is stricter: a requirement verified by a regression
            suite and a dedicated test isn&apos;t done until both pass. Either way, a test with several results counts as
            passed once any of them is a Pass.
          </p>
        </div>

        {(errors.length > 0 || warnings.length > 0) && (
          <ul className="flex flex-col gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {errors.slice(0, 5).map((e) => (
              <li key={e}>{e}</li>
            ))}
            {errors.length > 5 && <li>…and {errors.length - 5} more lines that couldn&apos;t be read.</li>}
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex flex-col gap-1 rounded-lg border border-fd-border p-3">
            <span className="text-xs font-medium text-fd-muted-foreground">{k.label}</span>
            <span className="font-mono text-2xl font-bold">{k.value}</span>
            <span className="text-xs text-fd-muted-foreground">{k.sub}</span>
          </div>
        ))}
      </div>

      {a.total > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex h-3 overflow-hidden rounded-full bg-fd-secondary">
            {REQ_STATUSES.map((s) =>
              a.counts[s] > 0 ? (
                <div
                  key={s}
                  className={BAR[s]}
                  style={{ width: `${(a.counts[s] / a.total) * 100}%` }}
                  title={`${s}: ${a.counts[s]}`}
                />
              ) : null,
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fd-muted-foreground">
            {REQ_STATUSES.map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className={cn('size-2.5 rounded-sm', BAR[s])} />
                {s} <span className="font-mono font-semibold text-fd-foreground">{a.counts[s]}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {gaps.length > 0 && (
        <div className="flex gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            <strong>{listIds(gaps.map((r) => r.id))}</strong> {gaps.length === 1 ? 'has' : 'have'} no test case mapped,
            so {gaps.length === 1 ? 'it' : 'they'} can&apos;t be verified at all. Coverage % shows the size of this gap,
            but only the list says which requirements are in it.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Traceability matrix</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fd-muted-foreground">
            {(Object.keys(CELL) as TestStatus[]).map((s) => {
              const { icon: Icon, className, label } = CELL[s];
              return (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={cn('flex size-4 items-center justify-center rounded', className)}>
                    <Icon className="size-3" />
                  </span>
                  Mapped, test {label}
                </span>
              );
            })}
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-fd-border">
          <table className="w-full text-sm">
            <thead className="bg-fd-secondary/60 text-left text-xs">
              <tr>
                <th className="px-3 py-2 align-bottom font-semibold">Requirement</th>
                <th className="px-3 py-2 align-bottom font-semibold">Status</th>
                {a.testIds.map((t) => (
                  <th key={t} className="px-1 py-2 align-bottom font-mono font-semibold">
                    <span className="mx-auto block w-fit rotate-180 whitespace-nowrap [writing-mode:vertical-rl]">
                      {t}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {a.rows.map((r) => (
                <tr
                  key={r.id}
                  className={cn('border-t border-fd-border', r.status === 'No test mapped' && 'bg-red-500/5')}
                >
                  <td className="min-w-48 px-3 py-1.5">
                    <span className="font-mono text-xs">{r.id}</span>
                    {r.text && <span className="block text-xs text-fd-muted-foreground">{r.text}</span>}
                  </td>
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <span className={cn('rounded px-1.5 py-0.5 text-xs font-semibold', PILL[r.status])}>{r.status}</span>
                    {r.tests.length > 1 && (
                      <span className="ml-1.5 text-xs text-fd-muted-foreground">
                        {r.passed}/{r.tests.length} passed
                      </span>
                    )}
                  </td>
                  {a.testIds.map((t) => {
                    if (!r.tests.includes(t)) return <td key={t} className="border-l border-fd-border/50 px-1 py-1.5" />;
                    const s = a.testStatus.get(t) ?? 'Not run';
                    const { icon: Icon, className, label } = CELL[s];
                    return (
                      <td key={t} className="border-l border-fd-border/50 px-1 py-1.5">
                        <span
                          className={cn('mx-auto flex size-5 items-center justify-center rounded', className)}
                          title={`${r.id} → ${t}: ${label}`}
                        >
                          <Icon className="size-3.5" />
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {a.rows.length === 0 && (
                <tr>
                  <td colSpan={2 + a.testIds.length} className="px-3 py-4 text-center text-sm text-fd-muted-foreground">
                    Add a requirement above to see it here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-fd-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">The same rules as DAX measures</p>
            <p className="text-sm text-fd-muted-foreground">
              Coverage, verification, and pass rate on the{' '}
              <Link
                href="/tutorials/build-a-requirements-traceability-matrix"
                className="text-fd-primary hover:underline"
              >
                tutorial&apos;s
              </Link>{' '}
              DimRequirement, BridgeRequirementTest, and FactTestResults tables, plus a per-requirement status and
              color measure for the gap list.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(dax);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="max-h-[28rem] overflow-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
          <code>{highlightCode(dax)}</code>
        </pre>
      </div>
    </div>
  );
}
