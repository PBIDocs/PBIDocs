'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import {
  TUTORIAL_IN_SERVICE,
  TUTORIAL_LOG,
  calculate,
  generateDax,
  parseFailureLog,
  type ReliabilityTotals,
} from '@/lib/reliability';

type Mode = 'log' | 'totals';

const inputClass =
  'w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

function num(text: string): number {
  const n = Number(text.replace(/[,\s]/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function hours(value: number | null, digits = 1): string {
  if (value === null) return '—';
  return `${value.toLocaleString('en-US', { maximumFractionDigits: digits })} h`;
}

function percent(value: number | null, digits = 2): string {
  return value === null ? '—' : `${(value * 100).toFixed(digits)}%`;
}

function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-fd-border p-3">
      <p className="text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">{label}</p>
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="text-xs text-fd-muted-foreground">{note}</p>
    </div>
  );
}

export function ReliabilityCalculator() {
  const [mode, setMode] = useState<Mode>('log');
  const [log, setLog] = useState(TUTORIAL_LOG);
  const [inService, setInService] = useState(TUTORIAL_IN_SERVICE);
  const [totalsFields, setTotalsFields] = useState({ failures: '6', uptimeHours: '1728', repairHours: '54' });
  const [missionText, setMissionText] = useState('100');
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseFailureLog(log, inService), [log, inService]);
  const totals: ReliabilityTotals =
    mode === 'log'
      ? parsed.totals
      : {
          failures: num(totalsFields.failures),
          uptimeHours: num(totalsFields.uptimeHours),
          repairHours: num(totalsFields.repairHours),
        };
  const missionHours = num(missionText) || 100;
  const r = calculate(totals, missionHours);
  const dax = generateDax(missionHours);

  const assetRows = parsed.assets.map((a) => ({ ...a, ...calculate(a, missionHours) }));
  const maxMtbf = Math.max(0, ...assetRows.map((a) => a.mtbf ?? 0));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-xl border border-fd-border p-5">
        <div className="inline-flex w-fit rounded-full border border-fd-border p-1 text-sm">
          {(['log', 'totals'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'rounded-full px-4 py-1.5 font-medium transition-colors',
                mode === m ? 'bg-fd-primary text-fd-primary-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              {m === 'log' ? 'Paste a failure log' : 'Enter totals'}
            </button>
          ))}
        </div>

        {mode === 'log' ? (
          <>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Failure log
              <textarea
                value={log}
                onChange={(e) => setLog(e.target.value)}
                rows={8}
                spellCheck={false}
                className={cn(inputClass, 'resize-y font-mono text-xs')}
              />
              <span className="text-xs font-normal text-fd-muted-foreground">
                One failure per line: asset, failure start, repair complete (comma or tab separated, so a
                copy from Excel works). The asset column is optional. Dates as 2026-01-11 or 2026-01-11 14:30.
              </span>
            </label>
            <label className="flex max-w-xs flex-col gap-1.5 text-sm font-medium">
              In service since
              <input type="text" value={inService} onChange={(e) => setInService(e.target.value)} className={cn(inputClass, 'font-mono')} />
              <span className="text-xs font-normal text-fd-muted-foreground">
                Where each asset&apos;s first uptime period starts.
              </span>
            </label>
            {parsed.errors.length > 0 && (
              <ul className="flex flex-col gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                {parsed.errors.slice(0, 5).map((e) => (
                  <li key={e}>{e}</li>
                ))}
                {parsed.errors.length > 5 && <li>…and {parsed.errors.length - 5} more.</li>}
              </ul>
            )}
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                ['failures', 'Failures', 'Number of failures recorded'],
                ['uptimeHours', 'Uptime hours', 'Total operating time between failures'],
                ['repairHours', 'Repair hours', 'Total time spent down and being fixed'],
              ] as const
            ).map(([key, label, hint]) => (
              <label key={key} className="flex flex-col gap-1.5 text-sm font-medium">
                {label}
                <input
                  type="text"
                  inputMode="decimal"
                  value={totalsFields[key]}
                  onChange={(e) => setTotalsFields((f) => ({ ...f, [key]: e.target.value }))}
                  className={cn(inputClass, 'font-mono')}
                />
                <span className="text-xs font-normal text-fd-muted-foreground">{hint}</span>
              </label>
            ))}
          </div>
        )}

        <p className="text-xs text-fd-muted-foreground">
          Pre-filled with the failure log from the{' '}
          <Link href="/tutorials/build-a-reliability-mtbf-mttr-dashboard" className="text-fd-primary hover:underline">
            reliability dashboard tutorial
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Tile label="MTBF" value={hours(r.mtbf)} note="Average run time between one repair and the next failure." />
          <Tile label="MTTR" value={hours(r.mttr)} note="Average time to get it running again once it fails." />
          <Tile
            label="Availability"
            value={percent(r.availability)}
            note={r.downtimePerYear === null ? 'MTBF ÷ (MTBF + MTTR).' : `About ${Math.round(r.downtimePerYear).toLocaleString('en-US')} hours down per year.`}
          />
          <Tile
            label="Failure rate"
            value={r.failuresPer1000h === null ? '—' : r.failuresPer1000h.toFixed(2)}
            note="Failures per 1,000 operating hours."
          />
          <Tile
            label="Mission reliability"
            value={percent(r.missionReliability, 1)}
            note={`Chance of running ${missionHours.toLocaleString('en-US')} hours without a failure.`}
          />
          <Tile
            label="Expected failures"
            value={r.expectedFailures === null ? '—' : r.expectedFailures.toFixed(2)}
            note={`In the next ${missionHours.toLocaleString('en-US')} operating hours.`}
          />
        </div>
        <label className="flex flex-wrap items-center gap-2 text-sm">
          Mission length
          <input
            type="text"
            inputMode="decimal"
            value={missionText}
            onChange={(e) => setMissionText(e.target.value)}
            className="w-24 rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
          />
          hours
          <span className="text-xs text-fd-muted-foreground">
            Mission figures assume a constant failure rate, which fits the flat middle of an asset&apos;s life, not
            break-in or wear-out.
          </span>
        </label>
      </div>

      {mode === 'log' && assetRows.length > 1 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">By asset</h2>
          <div className="overflow-x-auto rounded-lg border border-fd-border">
            <table className="w-full text-sm">
              <thead className="bg-fd-secondary/60 text-left text-xs">
                <tr>
                  <th className="px-3 py-2 font-semibold">Asset</th>
                  <th className="px-3 py-2 text-right font-semibold">Failures</th>
                  <th className="px-3 py-2 font-semibold">MTBF</th>
                  <th className="px-3 py-2 text-right font-semibold">MTTR</th>
                  <th className="px-3 py-2 text-right font-semibold">Availability</th>
                </tr>
              </thead>
              <tbody>
                {assetRows.map((a) => (
                  <tr key={a.asset} className="border-t border-fd-border">
                    <td className="px-3 py-2 font-mono whitespace-nowrap">
                      {a.asset}
                      {a.failures === 1 && (
                        <span
                          className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-sans text-[0.65rem] font-semibold text-amber-700 dark:text-amber-300"
                          title="One failure says very little about how reliable this asset is"
                        >
                          <TriangleAlert className="size-3" />1 failure
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{a.failures}</td>
                    <td className="min-w-40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-fd-secondary">
                          <div
                            className={cn('h-2 rounded-full', a.failures === 1 ? 'bg-amber-500/60' : 'bg-fd-primary')}
                            style={{ width: `${maxMtbf ? ((a.mtbf ?? 0) / maxMtbf) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="w-16 text-right font-mono text-xs">{hours(a.mtbf, 0)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{hours(a.mttr)}</td>
                    <td className="px-3 py-2 text-right font-mono">{percent(a.availability, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-fd-muted-foreground">
            An asset with a single failure can show the best MTBF while telling you the least. Compare assets only once
            each has a few failures behind it.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-fd-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">The same metrics as DAX measures</p>
            <p className="text-sm text-fd-muted-foreground">
              Built on the Total Failures, Total Uptime Hours, and Total Repair Hours measures from the{' '}
              <Link href="/tutorials/build-a-reliability-mtbf-mttr-dashboard" className="text-fd-primary hover:underline">
                tutorial
              </Link>
              , with your mission length. Paste each one into <strong className="text-fd-foreground">New measure</strong>.
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
