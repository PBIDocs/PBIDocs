'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, CircleAlert, CircleCheck, Copy, TriangleAlert, Wand2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import {
  applyEdits,
  autoFix,
  BLOG_POST,
  CAUSE_ANCHORS,
  checkDax,
  convertSeparators,
  EXAMPLES,
  lineCol,
  type Issue,
  type Separators,
} from '@/lib/dax-syntax';

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex w-fit flex-wrap rounded-full border border-fd-border p-1 text-sm">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-full px-3 py-1 font-medium transition-colors',
            value === o.value
              ? 'bg-fd-primary text-fd-primary-foreground'
              : 'text-fd-muted-foreground hover:text-fd-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex shrink-0 items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

const TONE = {
  error: {
    mark: 'bg-red-500/15 underline decoration-red-500 decoration-wavy decoration-from-font underline-offset-4',
    badge: 'bg-red-600 text-white',
    pill: 'bg-red-500/10 text-red-700 dark:text-red-400',
  },
  warning: {
    mark: 'bg-amber-500/15 underline decoration-amber-500 decoration-wavy decoration-from-font underline-offset-4',
    badge: 'bg-amber-500 text-black',
    pill: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
} as const;

function Badge({ n, issue }: { n: number; issue: Issue }) {
  return (
    <span
      className={cn(
        'mx-0.5 inline-flex size-[1.15rem] -translate-y-1 items-center justify-center rounded-full align-middle font-sans text-[10px] font-bold leading-none',
        TONE[issue.severity].badge,
      )}
    >
      {n}
    </span>
  );
}

// The formula with every issue's range underlined and a numbered badge after it.
function Annotated({ src, issues }: { src: string; issues: Issue[] }) {
  const marks: (Issue['severity'] | null)[] = new Array(src.length).fill(null);
  for (const i of issues) {
    for (let p = i.start; p < Math.min(i.end, src.length); p++) {
      if (marks[p] !== 'error') marks[p] = i.severity;
    }
  }
  const badgesAt = new Map<number, number[]>();
  issues.forEach((i, k) => {
    const at = Math.min(i.end, src.length);
    badgesAt.set(at, [...(badgesAt.get(at) ?? []), k]);
  });

  const cuts = new Set<number>([0, src.length, ...badgesAt.keys()]);
  for (let p = 1; p < src.length; p++) if (marks[p] !== marks[p - 1]) cuts.add(p);
  const points = [...cuts].sort((a, b) => a - b);

  const out: ReactNode[] = [];
  points.forEach((p, k) => {
    for (const idx of badgesAt.get(p) ?? []) out.push(<Badge key={`b${idx}`} n={idx + 1} issue={issues[idx]} />);
    const next = points[k + 1];
    if (next === undefined) return;
    const text = src.slice(p, next);
    const mark = marks[p];
    out.push(
      mark ? (
        <span key={`s${p}`} className={cn('rounded-sm', TONE[mark].mark)}>
          {text}
        </span>
      ) : (
        <span key={`s${p}`}>{text}</span>
      ),
    );
  });

  return (
    <pre className="overflow-x-auto whitespace-pre rounded-lg border border-fd-border bg-fd-secondary/50 px-4 py-3 font-mono text-sm leading-7">
      {out}
    </pre>
  );
}

export function DaxSyntaxChecker() {
  const [text, setText] = useState(EXAMPLES[0].formula);
  const [setting, setSetting] = useState<Separators>('standard');

  const result = useMemo(() => checkDax(text, setting), [text, setting]);
  const fixed = useMemo(() => autoFix(text, result, setting), [text, result, setting]);
  const remaining = useMemo(() => (fixed ? checkDax(fixed, setting).issues : []), [fixed, setting]);

  const errors = result.issues.filter((i) => i.severity === 'error').length;
  const warnings = result.issues.length - errors;
  const empty = text.trim() === '';

  function applyOne(issue: Issue) {
    if (issue.convertSeparators) setText(convertSeparators(text, setting === 'standard' ? 'locale' : 'standard'));
    else if (issue.fix) setText(applyEdits(text, issue.fix));
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-xl border border-fd-border p-5">
        <div className="flex flex-col gap-1.5 text-sm font-medium">
          Try an example
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((e) => (
              <button
                key={e.label}
                type="button"
                onClick={() => setText(e.formula)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  text === e.formula
                    ? 'border-fd-primary bg-fd-primary/10 text-fd-primary'
                    : 'border-fd-border text-fd-muted-foreground hover:text-fd-foreground',
                )}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Your formula
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            placeholder={'Total Sales =\nSUM(Sales[Amount])'}
            className="w-full resize-y rounded-lg border border-fd-border bg-fd-background px-3 py-2 font-mono text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
          />
        </label>

        <div className="flex flex-col gap-1.5 text-sm font-medium">
          Power BI Desktop separators
          <Segmented<Separators>
            value={setting}
            onChange={setSetting}
            options={[
              { value: 'standard', label: 'Standard ( , )' },
              { value: 'locale', label: 'Locale-based ( ; )' },
            ]}
          />
          <p className="text-xs font-normal text-fd-muted-foreground">
            Set in File → Options and settings → Options → Global → Regional settings. Most DAX online uses standard.
          </p>
        </div>
      </div>

      {!empty && (
        <div className="flex flex-col gap-5">
          <div
            role="status"
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4',
              result.issues.length === 0
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : errors > 0
                  ? 'border-red-500/40 bg-red-500/5'
                  : 'border-amber-500/40 bg-amber-500/5',
            )}
          >
            {result.issues.length === 0 ? (
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : errors > 0 ? (
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
            ) : (
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            )}
            <div className="flex flex-col gap-0.5">
              <p className="font-semibold">
                {result.issues.length === 0
                  ? 'No syntax problems found'
                  : [errors && `${errors} error${errors === 1 ? '' : 's'}`, warnings && `${warnings} warning${warnings === 1 ? '' : 's'}`]
                      .filter(Boolean)
                      .join(' and ')}
              </p>
              <p className="text-sm text-fd-muted-foreground">
                {result.issues.length === 0
                  ? "The brackets, separators, quotes, and keywords all check out. This can't see your model, so if Desktop still complains, check that the table, column, and measure names exist."
                  : fixed
                    ? remaining.length === 0
                      ? 'Every one has a safe automatic fix: the corrected formula is below.'
                      : `The automatic fixes clear ${result.issues.length - remaining.length}; ${remaining.length === 1 ? 'one needs' : `${remaining.length} need`} you.`
                    : 'Each one is marked in the formula and explained below.'}
              </p>
            </div>
          </div>

          {result.issues.length > 0 && (
            <>
              <Annotated src={text} issues={result.issues} />

              <ol className="flex flex-col gap-3">
                {result.issues.map((issue, k) => {
                  const { line, col } = lineCol(text, issue.start);
                  return (
                    <li key={`${issue.start}-${issue.title}`} className="flex gap-3 rounded-lg border border-fd-border p-4">
                      <span
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          TONE[issue.severity].badge,
                        )}
                      >
                        {k + 1}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="font-semibold">{issue.title}</p>
                          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', TONE[issue.severity].pill)}>
                            {issue.severity === 'error' ? 'Error' : 'Likely error'}
                          </span>
                          <span className="text-xs text-fd-muted-foreground">
                            Line {line}, column {col}
                          </span>
                        </div>
                        <p className="text-sm text-fd-muted-foreground">{issue.detail}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          {(issue.fix || issue.convertSeparators) && (
                            <button
                              type="button"
                              onClick={() => applyOne(issue)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-fd-accent"
                            >
                              <Wand2 className="size-3.5" />
                              {issue.fixLabel ?? 'Fix'}
                            </button>
                          )}
                          {issue.cause && (
                            <Link
                              href={`${BLOG_POST}#${CAUSE_ANCHORS[issue.cause]}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-fd-primary hover:underline"
                            >
                              Why this happens
                              <ArrowRight className="size-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          )}

          {fixed && (
            <div className="flex flex-col gap-2 rounded-xl border border-fd-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold">Fixed formula</p>
                  <p className="text-sm text-fd-muted-foreground">
                    {remaining.length === 0
                      ? 'Every automatic fix applied, and it checks clean.'
                      : `Every automatic fix applied. Still to do by hand: ${remaining.map((i) => i.title).join('; ')}.`}
                  </p>
                </div>
                <CopyButton text={fixed} />
              </div>
              <pre className="overflow-x-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
                <code>{highlightCode(fixed)}</code>
              </pre>
              <button
                type="button"
                onClick={() => setText(fixed)}
                className="inline-flex w-fit items-center gap-1.5 rounded-md border border-fd-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-fd-accent"
              >
                <Wand2 className="size-3.5" />
                Use this in the editor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
