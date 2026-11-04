'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import { RiskMatrixGrid } from '@/components/risk-matrix-anatomy-diagram';
import {
  LEVELS,
  TUTORIAL_RISKS,
  TUTORIAL_THRESHOLDS,
  generateDax,
  levelOf,
  parseRisks,
  thresholdError,
  type Level,
  type Thresholds,
} from '@/lib/risk-matrix';

const LEVEL_PILL: Record<Level, string> = {
  Critical: 'bg-red-500/15 text-red-700 dark:text-red-300',
  High: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  Medium: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
  Low: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
};

const inputClass =
  'w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

// Short labels for the grid cells: RISK-01 -> 01, R7 -> 7.
const cellLabel = (id: string) => id.replace(/^[A-Za-z]+[-_ ]?/, '') || id;

export function RiskMatrixBuilder() {
  const [text, setText] = useState(TUTORIAL_RISKS);
  const [fields, setFields] = useState({
    critical: String(TUTORIAL_THRESHOLDS.critical),
    high: String(TUTORIAL_THRESHOLDS.high),
    medium: String(TUTORIAL_THRESHOLDS.medium),
  });
  const [copied, setCopied] = useState(false);

  const entered: Thresholds = {
    critical: Number(fields.critical),
    high: Number(fields.high),
    medium: Number(fields.medium),
  };
  const bandError = thresholdError(entered);
  // Keep showing the last valid bands while the thresholds are mid-edit.
  const t = bandError ? TUTORIAL_THRESHOLDS : entered;

  const parsed = useMemo(() => parseRisks(text), [text]);
  const scored = parsed.risks
    .map((r) => ({ ...r, score: r.likelihood * r.impact, level: levelOf(r.likelihood * r.impact, t) }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const counts = Object.fromEntries(LEVELS.map((l) => [l, scored.filter((r) => r.level === l).length])) as Record<
    Level,
    number
  >;
  const dax = generateDax(t);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-xl border border-fd-border p-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Risks
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            spellCheck={false}
            className={cn(inputClass, 'resize-y font-mono text-xs')}
          />
          <span className="text-xs font-normal text-fd-muted-foreground">
            One risk per line: ID, description, likelihood (1–5), impact (1–5). Commas or tabs, so a copy from Excel
            works; the description is optional and can contain commas.
          </span>
        </label>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Bands (score = likelihood × impact)</p>
          <div className="grid grid-cols-3 gap-3 sm:max-w-md">
            {(['critical', 'high', 'medium'] as const).map((key) => (
              <label key={key} className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
                <span>{key[0].toUpperCase() + key.slice(1)} at</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={fields[key]}
                  onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                  className={cn(inputClass, 'font-mono')}
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-fd-muted-foreground">
            Scores at or above each number fall into that band; anything below Medium is Low. Defaults match the{' '}
            <Link href="/tutorials/build-a-risk-register-dashboard" className="text-fd-primary hover:underline">
              risk register tutorial
            </Link>
            .
          </p>
        </div>

        {(bandError || parsed.errors.length > 0) && (
          <ul className="flex flex-col gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {bandError && <li>{bandError} Showing the default bands until that&apos;s fixed.</li>}
            {parsed.errors.slice(0, 5).map((e) => (
              <li key={e}>{e}</li>
            ))}
            {parsed.errors.length > 5 && <li>…and {parsed.errors.length - 5} more.</li>}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LEVELS.map((l) => (
          <div key={l} className="flex flex-col gap-1 rounded-lg border border-fd-border p-3">
            <span className={cn('w-fit rounded px-1.5 py-0.5 text-xs font-semibold', LEVEL_PILL[l])}>{l}</span>
            <span className="font-mono text-2xl font-bold">{counts[l]}</span>
            <span className="text-xs text-fd-muted-foreground">
              {l === 'Low' ? `score below ${t.medium}` : `score ${t[l.toLowerCase() as keyof Thresholds]}+`}
            </span>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,20rem)_1fr]">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Heat map</h2>
          <RiskMatrixGrid risks={scored} bandOf={(score) => levelOf(score, t)} label={cellLabel} />
          <p className="text-xs text-fd-muted-foreground">
            Each cell is colored by the band its own likelihood × impact falls in, and shows how many risks sit there.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="text-lg font-semibold">Ranked</h2>
          <div className="overflow-x-auto rounded-lg border border-fd-border">
            <table className="w-full text-sm">
              <thead className="bg-fd-secondary/60 text-left text-xs">
                <tr>
                  <th className="px-3 py-2 font-semibold">Risk</th>
                  <th className="px-2 py-2 text-right font-semibold" title="Likelihood">L</th>
                  <th className="px-2 py-2 text-right font-semibold" title="Impact">I</th>
                  <th className="px-2 py-2 text-right font-semibold">Score</th>
                  <th className="px-3 py-2 font-semibold">Level</th>
                </tr>
              </thead>
              <tbody>
                {scored.map((r, i) => (
                  <tr key={`${r.id}-${i}`} className="border-t border-fd-border">
                    <td className="px-3 py-1.5">
                      <span className="font-mono text-xs">{r.id}</span>
                      {r.title && <span className="block text-xs text-fd-muted-foreground">{r.title}</span>}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono">{r.likelihood}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{r.impact}</td>
                    <td className="px-2 py-1.5 text-right font-mono font-semibold">{r.score}</td>
                    <td className="px-3 py-1.5">
                      <span className={cn('rounded px-1.5 py-0.5 text-xs font-semibold', LEVEL_PILL[r.level])}>
                        {r.level}
                      </span>
                    </td>
                  </tr>
                ))}
                {scored.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-sm text-fd-muted-foreground">
                      Add a risk above to see it here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-fd-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">The same scoring as DAX measures</p>
            <p className="text-sm text-fd-muted-foreground">
              Risk Score and Risk Level with your bands, built on Current Likelihood and Current Impact from the{' '}
              <Link href="/tutorials/build-a-risk-register-dashboard" className="text-fd-primary hover:underline">
                tutorial
              </Link>
              , plus a color measure that turns its 5×5 matrix visual into this heat map.
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
