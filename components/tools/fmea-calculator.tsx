'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import {
  PRIORITIES,
  TUTORIAL_MODES,
  TUTORIAL_SETTINGS,
  generateDax,
  parseModes,
  score,
  settingsError,
  type FmeaSettings,
  type Priority,
} from '@/lib/fmea';

const PILL: Record<Priority, string> = {
  High: 'bg-red-500/15 text-red-700 dark:text-red-300',
  Medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Low: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
};

const BAR: Record<Priority, string> = {
  High: 'bg-red-500/70',
  Medium: 'bg-amber-500/70',
  Low: 'bg-emerald-500/70',
};

const inputClass =
  'w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

export function FmeaCalculator() {
  const [text, setText] = useState(TUTORIAL_MODES);
  const [override, setOverride] = useState(true);
  const [fields, setFields] = useState({
    severityAt: String(TUTORIAL_SETTINGS.severityAt),
    high: String(TUTORIAL_SETTINGS.high),
    medium: String(TUTORIAL_SETTINGS.medium),
  });
  const [copied, setCopied] = useState(false);

  const entered: FmeaSettings = {
    severityOverride: override,
    severityAt: Number(fields.severityAt),
    high: Number(fields.high),
    medium: Number(fields.medium),
  };
  const error = settingsError(entered);
  // Keep showing the last valid thresholds while a field is mid-edit.
  const s = error ? { ...TUTORIAL_SETTINGS, severityOverride: override } : entered;

  const parsed = useMemo(() => parseModes(text), [text]);
  const scored = parsed.modes.map((m) => score(m, s)).sort((a, b) => b.rpn - a.rpn || a.id.localeCompare(b.id));
  const counts = Object.fromEntries(PRIORITIES.map((p) => [p, scored.filter((m) => m.priority === p).length])) as Record<
    Priority,
    number
  >;
  const raised = scored.filter((m) => m.raisedBySeverity);
  const maxRpn = Math.max(1, ...scored.map((m) => m.rpn));
  const dax = generateDax(s);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-xl border border-fd-border p-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Failure modes
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            spellCheck={false}
            className={cn(inputClass, 'resize-y font-mono text-xs')}
          />
          <span className="text-xs font-normal text-fd-muted-foreground">
            One per line: ID, description, severity, occurrence, detection (each 1–10). Commas or tabs, so a copy from
            Excel works; the description is optional and can contain commas.
          </span>
        </label>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Action priority rules</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
              <label className="flex h-5 items-center gap-2">
                <input
                  type="checkbox"
                  checked={override}
                  onChange={(e) => setOverride(e.target.checked)}
                  className="size-4 accent-fd-primary"
                />
                Severity override at
              </label>
              <input
                type="text"
                inputMode="numeric"
                aria-label="Severity override threshold"
                value={fields.severityAt}
                disabled={!override}
                onChange={(e) => setFields((f) => ({ ...f, severityAt: e.target.value }))}
                className={cn(inputClass, 'font-mono disabled:opacity-50')}
              />
            </div>
            {(['high', 'medium'] as const).map((key) => (
              <label key={key} className="flex flex-col gap-1 text-xs font-medium text-fd-muted-foreground">
                <span className="flex h-5 items-center">{key === 'high' ? 'High at RPN' : 'Medium at RPN'}</span>
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
            Defaults match the{' '}
            <Link href="/tutorials/build-an-fmea-dashboard" className="text-fd-primary hover:underline">
              FMEA dashboard tutorial
            </Link>
            : any failure mode with severity {s.severityAt} or more is High whatever its RPN, then RPN {s.high}+ is
            High and {s.medium}+ is Medium.
          </p>
        </div>

        {(error || parsed.errors.length > 0) && (
          <ul className="flex flex-col gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {error && <li>{error} Showing the default rules until that&apos;s fixed.</li>}
            {parsed.errors.slice(0, 5).map((e) => (
              <li key={e}>{e}</li>
            ))}
            {parsed.errors.length > 5 && <li>…and {parsed.errors.length - 5} more.</li>}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {PRIORITIES.map((p) => (
          <div key={p} className="flex flex-col gap-1 rounded-lg border border-fd-border p-3">
            <span className={cn('w-fit rounded px-1.5 py-0.5 text-xs font-semibold', PILL[p])}>{p}</span>
            <span className="font-mono text-2xl font-bold">{counts[p]}</span>
          </div>
        ))}
      </div>

      {raised.length > 0 && (
        <div className="flex gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            {raised.length === 1 ? (
              <>
                <strong>{raised[0].id}</strong> has an RPN of only {raised[0].rpn}, which RPN alone would rank{' '}
                {raised[0].rpnOnly}, but its severity of {raised[0].severity} makes it High priority.
              </>
            ) : (
              <>
                <strong>{raised.map((m) => m.id).join(', ')}</strong> would rank Medium or Low on RPN alone, but their
                severity makes them High priority.
              </>
            )}{' '}
            RPN multiplies the three ratings together, so a rare, easily detected failure mode can score low even when
            its consequence is severe.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ranked by RPN</h2>
        <div className="overflow-x-auto rounded-lg border border-fd-border">
          <table className="w-full text-sm">
            <thead className="bg-fd-secondary/60 text-left text-xs">
              <tr>
                <th className="px-3 py-2 font-semibold">Failure mode</th>
                <th className="px-2 py-2 text-right font-semibold" title="Severity">S</th>
                <th className="px-2 py-2 text-right font-semibold" title="Occurrence">O</th>
                <th className="px-2 py-2 text-right font-semibold" title="Detection">D</th>
                <th className="px-3 py-2 font-semibold">RPN</th>
                <th className="px-3 py-2 font-semibold">RPN alone</th>
                <th className="px-3 py-2 font-semibold">Priority</th>
              </tr>
            </thead>
            <tbody>
              {scored.map((m, i) => (
                <tr
                  key={`${m.id}-${i}`}
                  className={cn('border-t border-fd-border', m.raisedBySeverity && 'bg-red-500/5')}
                >
                  <td className="px-3 py-1.5">
                    <span className="font-mono text-xs">{m.id}</span>
                    {m.description && <span className="block text-xs text-fd-muted-foreground">{m.description}</span>}
                  </td>
                  <td
                    className={cn(
                      'px-2 py-1.5 text-right font-mono',
                      m.raisedBySeverity && 'font-bold text-red-600 dark:text-red-400',
                    )}
                  >
                    {m.severity}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono">{m.occurrence}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{m.detection}</td>
                  <td className="min-w-36 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-9 text-right font-mono text-xs font-semibold">{m.rpn}</span>
                      <div className="h-2 flex-1 rounded-full bg-fd-secondary">
                        <div
                          className={cn('h-2 rounded-full', BAR[m.priority])}
                          style={{ width: `${(m.rpn / maxRpn) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-xs font-semibold',
                        PILL[m.rpnOnly],
                        m.raisedBySeverity && 'line-through opacity-60',
                      )}
                    >
                      {m.rpnOnly}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <span className={cn('rounded px-1.5 py-0.5 text-xs font-semibold', PILL[m.priority])}>{m.priority}</span>
                    {m.raisedBySeverity && (
                      <span className="ml-1.5 text-xs text-red-600 dark:text-red-400">severity {m.severity}</span>
                    )}
                  </td>
                </tr>
              ))}
              {scored.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-sm text-fd-muted-foreground">
                    Add a failure mode above to see it here.
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
              Current RPN and Action Priority with your rules, built on the Current Severity, Occurrence, and Detection
              measures from the{' '}
              <Link href="/tutorials/build-an-fmea-dashboard" className="text-fd-primary hover:underline">
                tutorial
              </Link>
              , plus a color measure for an RPN bar chart.
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
