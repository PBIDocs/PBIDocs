import Link from 'next/link';
import { cn } from '@/lib/cn';
import { earnedSchedule, toDay, type PvPoint } from '@/lib/evm';

// The EVM dashboard tutorial's task list and its May 15, 2026 status date.
const TASKS = [
  { start: '2026-01-01', end: '2026-02-15', bac: 45000, complete: 1.0 },
  { start: '2026-01-15', end: '2026-03-15', bac: 60000, complete: 0.9 },
  { start: '2026-02-15', end: '2026-04-30', bac: 80000, complete: 0.65 },
  { start: '2026-02-15', end: '2026-04-30', bac: 75000, complete: 0.55 },
  { start: '2026-03-01', end: '2026-04-15', bac: 30000, complete: 0.4 },
  { start: '2026-04-01', end: '2026-06-30', bac: 120000, complete: 0.2 },
  { start: '2026-05-01', end: '2026-07-31', bac: 90000, complete: 0.05 },
  { start: '2026-01-01', end: '2026-07-31', bac: 25000, complete: 0.35 },
].map((t) => ({ ...t, s: toDay(t.start), e: toDay(t.end) }));

const START = toDay('2026-01-01');
const FINISH = toDay('2026-07-31');
const STATUS = toDay('2026-05-15');

// Same as the tutorial's PV measure, evaluated for every day of the baseline.
const pvOn = (d: number) => TASKS.reduce((a, t) => a + t.bac * Math.min(1, Math.max(0, (d - t.s) / (t.e - t.s))), 0);
const CURVE: PvPoint[] = Array.from({ length: FINISH - START + 1 }, (_, i) => ({ day: START + i, pv: pvOn(START + i) }));
const BAC = CURVE[CURVE.length - 1].pv;
const EV = TASKS.reduce((a, t) => a + t.bac * t.complete, 0);
const PV_NOW = pvOn(STATUS);
const R = earnedSchedule(CURVE, EV, STATUS);
const SPI = EV / PV_NOW;

const W = 600;
const H = 270;
const PAD = { l: 50, r: 14, t: 14, b: 38 };
const x = (d: number) => PAD.l + ((d - START) / (FINISH - START)) * (W - PAD.l - PAD.r);
const y = (v: number) => H - PAD.b - (v / BAC) * (H - PAD.t - PAD.b);
const path = CURVE.map((p, i) => `${i ? 'L' : 'M'}${x(p.day).toFixed(1)},${y(p.pv).toFixed(1)}`).join(' ');

const MONTHS = ['2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01', '2026-06-01', '2026-07-01'];
const monthLabel = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
const shortDate = (d: number) =>
  new Date(Math.round(d) * 86400000).toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const money = (n: number) => `$${Math.round(n / 1000)}K`;

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

function SvgBadge({ cx, cy, n, className }: { cx: number; cy: number; n: string; className: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} className={className} />
      <text x={cx} y={cy + 3.5} textAnchor="middle" className="fill-white text-[10px] font-bold">
        {n}
      </text>
    </g>
  );
}

// inTutorial: rendered on the tutorial page itself, so the caption doesn't link back to it.
export function EarnedScheduleDiagram({ inTutorial = false }: { inTutorial?: boolean }) {
  const xs = x(STATUS);
  const xe = x(R.esDay);
  const yev = y(EV);
  const axisY = H - PAD.b;

  return (
    <div id="earned-schedule-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of Earned Schedule
      </p>
      <p className="mb-3 text-xs text-fd-muted-foreground">
        {inTutorial ? (
          'This tutorial'
        ) : (
          <>
            The{' '}
            <Link href="/tutorials/build-an-evm-dashboard" className="underline">
              EVM dashboard tutorial
            </Link>
          </>
        )}
        &apos;s baseline PV curve, status as of {shortDate(STATUS)}, 2026.
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Planned value S-curve. Earned value of ${money(EV)} was planned for ${shortDate(R.esDay)}, ${Math.round(-R.svT)} days before the ${shortDate(STATUS)} status date.`}
      >
        {[0, 100000, 200000, 300000, 400000, 500000].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="stroke-fd-border" strokeWidth={1} />
            <text x={PAD.l - 6} y={y(v) + 4} textAnchor="end" className="fill-fd-muted-foreground text-[12px]">
              {money(v)}
            </text>
          </g>
        ))}
        {MONTHS.map((m) => (
          <text key={m} x={x(toDay(m)) + 14} y={axisY + 16} textAnchor="middle" className="fill-fd-muted-foreground text-[12px]">
            {monthLabel(m)}
          </text>
        ))}

        {/* 4: the schedule gap, ES to AT, on the time axis */}
        <rect x={xe} y={axisY - 6} width={xs - xe} height={6} className="fill-red-500/40" />

        {/* 1: the baseline PV curve */}
        <path d={path} fill="none" className="stroke-sky-500" strokeWidth={2.5} />

        {/* 2: today's EV, carried back to the curve */}
        <line x1={xs} x2={xs} y1={axisY} y2={y(PV_NOW)} className="stroke-amber-500" strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={xe} x2={xs} y1={yev} y2={yev} className="stroke-emerald-500" strokeWidth={2} strokeDasharray="5 3" />
        <circle cx={xs} cy={yev} r={4.5} className="fill-emerald-500" />
        <circle cx={xs} cy={y(PV_NOW)} r={3.5} className="fill-sky-500" />

        {/* 3: where EV meets the plan, dropped to the axis */}
        <line x1={xe} x2={xe} y1={yev} y2={axisY} className="stroke-violet-500" strokeWidth={1.5} strokeDasharray="4 3" />
        <circle cx={xe} cy={yev} r={4.5} className="fill-violet-500" />

        <SvgBadge cx={x(toDay('2026-06-20'))} cy={y(pvOn(toDay('2026-06-20'))) - 16} n="1" className="fill-sky-500" />
        <SvgBadge cx={xs + 16} cy={yev} n="2" className="fill-emerald-500" />
        <SvgBadge cx={xe - 15} cy={yev - 13} n="3" className="fill-violet-500" />
        <SvgBadge cx={(xe + xs) / 2} cy={axisY - 18} n="4" className="fill-red-500" />

        <text x={xe} y={axisY + 32} textAnchor="middle" className="fill-violet-600 text-[13px] font-semibold dark:fill-violet-400">
          ES {shortDate(R.esDay)}
        </text>
        <text x={xs} y={axisY + 32} textAnchor="middle" className="fill-amber-600 text-[13px] font-semibold dark:fill-amber-400">
          AT {shortDate(STATUS)}
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-md border border-fd-border bg-fd-background p-2">
          <p className="text-xs text-fd-muted-foreground">SPI (money)</p>
          <p className="font-mono text-base font-semibold text-red-600 dark:text-red-400">{SPI.toFixed(2)}</p>
        </div>
        <div className="rounded-md border border-fd-border bg-fd-background p-2">
          <p className="text-xs text-fd-muted-foreground">SPI(t) = ES ÷ AT</p>
          <p className="font-mono text-base font-semibold text-red-600 dark:text-red-400">{R.spiT!.toFixed(2)}</p>
        </div>
        <div className="rounded-md border border-fd-border bg-fd-background p-2">
          <p className="text-xs text-fd-muted-foreground">SV(t)</p>
          <p className="font-mono text-base font-semibold text-red-600 dark:text-red-400">{Math.round(R.svT)} days</p>
        </div>
        <div className="rounded-md border border-fd-border bg-fd-background p-2">
          <p className="text-xs text-fd-muted-foreground">Forecast finish</p>
          <p className="font-mono text-base font-semibold text-red-600 dark:text-red-400">
            {shortDate(R.forecastFinish!)}
          </p>
          <p className="text-[11px] text-fd-muted-foreground">plan: {shortDate(FINISH)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">The baseline</span> — cumulative PV for every
            day, from $0 on Jan 1 to the full {money(BAC)} budget on Jul 31. By the status date the plan called for{' '}
            {money(PV_NOW)}.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Today&apos;s EV</span> — the work
            actually done is worth {money(EV)}. Instead of comparing it with today&apos;s PV (that&apos;s SPI), slide it
            left along the curve.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">Earned Schedule</span> — the curve reaches{' '}
            {money(EV)} on {shortDate(R.esDay)} (day {R.es.toFixed(1)}). That&apos;s the date this much work was
            planned to be done by, interpolated between the two days either side.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">The gap is in days</span> — {Math.round(-R.svT)}{' '}
            days behind (SV(t)), and at that pace the {R.pd}-day plan takes about {Math.round(R.ieacT!)} days, finishing
            around {shortDate(R.forecastFinish!)}.
            Money-based SV can only say {money(PV_NOW - EV)} of work is missing.
          </p>
        </div>
      </div>
    </div>
  );
}
