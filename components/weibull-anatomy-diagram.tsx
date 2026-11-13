import { cn } from '@/lib/cn';
import { ProbabilityPlot, ReliabilityCurve } from '@/components/weibull-charts';
import { bLife, fit, fleetMtbf, parseUnits, reliability, TUTORIAL_INTERVAL, TUTORIAL_UNITS, type WeibullFit } from '@/lib/weibull';

// The tutorial's 20-pump fleet, run through the Weibull Analysis tool's own
// engine, so every number here matches the tool and the tutorial text.
const { units } = parseUnits(TUTORIAL_UNITS);
const R = fit(units) as WeibullFit;
const NO_SUSP = fit(units.filter((u) => u.status === 'F')) as WeibullFit;
const MTBF = fleetMtbf(units)!;
const B10 = bLife(R.beta, R.eta, 0.1);
const B10_NO_SUSP = bLife(NO_SUSP.beta, NO_SUSP.eta, 0.1);
const R_INT = reliability(R.beta, R.eta, TUTORIAL_INTERVAL);
const R_EXP = Math.exp(-TUTORIAL_INTERVAL / MTBF);
const first = R.ranked.filter((u) => u.status === 'F')[1];
const before = R.ranked.filter((u) => u.status === 'S' && u.order < first.order);

const h0 = (v: number) => Math.round(v).toLocaleString('en-US');
const p0 = (v: number) => `${Math.round(v * 100)}%`;

function Badge({ n, className }: { n: string; className?: string }) {
  return (
    <span className={cn('inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white', className)}>
      {n}
    </span>
  );
}

function SuspensionBars() {
  const max = R.eta * 1.1;
  const rows = [
    { label: 'All 20 pumps', fit: R, b10: B10, tone: 'bg-sky-600/80' },
    { label: `${NO_SUSP.failures} failures only`, fit: NO_SUSP, b10: B10_NO_SUSP, tone: 'bg-amber-500/80' },
  ];
  return (
    <div className="mt-3 space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-[11px]">
            <span className="text-fd-muted-foreground">{r.label}</span>
            <span className="font-mono font-semibold">
              η {h0(r.fit.eta)} · B10 {h0(r.b10)}
            </span>
          </div>
          <div className="relative mt-1 h-4 rounded-sm bg-fd-border/40">
            <div className={cn('absolute inset-y-0 left-0 rounded-sm', r.tone)} style={{ width: `${(r.fit.eta / max) * 100}%` }} />
            <div className="absolute inset-y-0 w-0.5 bg-red-500" style={{ left: `${(r.b10 / max) * 100}%` }} />
          </div>
        </div>
      ))}
      <p className="text-[10px] text-fd-muted-foreground">
        Bar: η in hours. <span className="text-red-600 dark:text-red-400">Red tick</span>: B10.
      </p>
    </div>
  );
}

export function WeibullAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">Anatomy of a Weibull analysis</p>
      <p className="mb-4 text-xs text-fd-muted-foreground">
        The tutorial&apos;s {units.length} pumps: {R.failures} failed, {R.suspensions} still running.
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background/40 p-3">
        <ProbabilityPlot fit={R} annotate className="hidden sm:block" />
        <ProbabilityPlot fit={R} annotate compact className="sm:hidden" />
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-slate-500" />
          <p>
            <span className="font-mono text-slate-600 dark:text-slate-400">Median rank</span> — each failure plotted at
            the share of the fleet estimated to have failed by then. {first.id}, the second failure at {h0(first.hours)}{' '}
            hours, gets an adjusted rank of {first.adjustedRank!.toFixed(2)}, not 2: the pumps still running at{' '}
            {before.map((u) => h0(u.hours)).join(' and ')} hours can&apos;t fail before it, so it stands for a bigger
            share of what&apos;s left. Median rank {(first.medianRank! * 100).toFixed(1)}%.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Suspensions</span> — the {R.suspensions} running
            pumps (△) aren&apos;t plotted, but each one shrinks the rank step for every failure after it.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Weibull Beta</span> — the fitted line&apos;s slope:
            β = {R.beta.toFixed(2)}, wear-out. The points follow it closely (R² {R.r2.toFixed(3)}), so one failure mode
            explains the data.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">B10 Life</span> — where the line crosses 10%:{' '}
            {h0(B10)} hours. One pump in ten has failed by then.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="5" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">Weibull Eta</span> — where it crosses 63.2%:{' '}
            {h0(R.eta)} hours, the characteristic life, whatever β is.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-3">
          <p className="text-xs font-semibold text-red-700 dark:text-red-300">The MTBF trap</p>
          <ReliabilityCurve fit={R} mtbf={MTBF} interval={TUTORIAL_INTERVAL} compact className="mt-1" />
          <p className="mt-1 text-[11px] leading-snug text-fd-muted-foreground">
            Fleet MTBF {h0(MTBF)} h made a {h0(TUTORIAL_INTERVAL)}-hour interval look safe: the dashed constant-rate curve
            says {p0(R_EXP)} survive. The Weibull curve says {p0(R_INT)}, so three pumps in four fail first.
          </p>
        </div>
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Leaving out the running pumps</p>
          <SuspensionBars />
          <p className="mt-2 text-[11px] leading-snug text-fd-muted-foreground">
            Fitting only the failures drops η by {p0(1 - NO_SUSP.eta / R.eta)}, to {h0(NO_SUSP.eta)} hours: the fleet
            looks worse than it is, and the replacement interval comes out shorter than it needs to be.
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs">
        <Badge n="✓" className="mt-0.5 bg-fd-primary" />
        <p>
          <span className="font-mono text-fd-primary">Result</span> — these pumps wear out, so time-based replacement
          works, but at about {h0(Math.round(B10 / 100) * 100)} hours for 90% reliability, not the {h0(TUTORIAL_INTERVAL)}{' '}
          the MTBF suggested.
        </p>
      </div>
    </div>
  );
}
