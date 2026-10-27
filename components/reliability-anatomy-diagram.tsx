import { cn } from '@/lib/cn';

// assets.csv and failure_events.csv from the reliability dashboard tutorial. Every asset was commissioned 2026-01-01.
const COMMISSIONED = '2026-01-01 00:00';
const WINDOW_END = '2026-02-01 00:00';

const EVENTS = [
  { asset: 'AST-01', start: '2026-01-11 00:00', end: '2026-01-11 12:00' },
  { asset: 'AST-01', start: '2026-01-26 12:00', end: '2026-01-27 00:00' },
  { asset: 'AST-02', start: '2026-01-06 00:00', end: '2026-01-06 06:00' },
  { asset: 'AST-02', start: '2026-01-16 06:00', end: '2026-01-16 18:00' },
  { asset: 'AST-02', start: '2026-01-28 18:00', end: '2026-01-29 02:00' },
  { asset: 'AST-03', start: '2026-01-21 00:00', end: '2026-01-21 04:00' },
];

const ASSET_NAMES: Record<string, string> = {
  'AST-01': 'Conveyor Motor A',
  'AST-02': 'Pump Unit B',
  'AST-03': 'PLC Controller C',
};

const hoursSince = (from: string, to: string) =>
  (Date.parse(`${to.replace(' ', 'T')}:00Z`) - Date.parse(`${from.replace(' ', 'T')}:00Z`)) / 3_600_000;

const WINDOW_HOURS = hoursSince(COMMISSIONED, WINDOW_END);
const at = (ts: string) => (hoursSince(COMMISSIONED, ts) / WINDOW_HOURS) * 100;

// Same as the Previous Repair Complete / Uptime Hours / Repair Hours calculated columns:
// uptime runs from this asset's prior repair, or from commissioning for its first failure.
const ROWS = EVENTS.map((e) => {
  const prior = EVENTS.filter((p) => p.asset === e.asset && p.end < e.start).map((p) => p.end).sort().at(-1);
  const from = prior ?? COMMISSIONED;
  return { ...e, from, isFirst: !prior, uptime: hoursSince(from, e.start), repair: hoursSince(e.start, e.end) };
});

const ASSETS = Object.keys(ASSET_NAMES).map((id) => {
  const rows = ROWS.filter((r) => r.asset === id);
  const uptime = rows.reduce((s, r) => s + r.uptime, 0);
  const repair = rows.reduce((s, r) => s + r.repair, 0);
  const mtbf = uptime / rows.length;
  const mttr = repair / rows.length;
  const lastRepair = rows.map((r) => r.end).sort().at(-1)!;
  return { id, rows, failures: rows.length, mtbf, mttr, availability: mtbf / (mtbf + mttr), lastRepair };
});

const totalUptime = ROWS.reduce((s, r) => s + r.uptime, 0);
const totalRepair = ROWS.reduce((s, r) => s + r.repair, 0);
const MTBF = totalUptime / ROWS.length;
const MTTR = totalRepair / ROWS.length;
const AVAILABILITY = MTBF / (MTBF + MTTR);

const hrs = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)} h`;
const pctFmt = (n: number) => `${(n * 100).toFixed(1)}%`;
const TICKS = [1, 8, 15, 22, 29];

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

export function ReliabilityAnatomyDiagram() {
  const worst = [...ASSETS].sort((a, b) => a.mtbf - b.mtbf)[0];
  const thin = ASSETS.find((a) => a.failures === 1)!;
  const firstEvent = ROWS.find((r) => r.asset === 'AST-02' && r.isFirst)!;

  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of MTBF, MTTR &amp; availability
      </p>
      <p className="mb-4 text-xs text-fd-muted-foreground">
        The reliability dashboard tutorial&apos;s failure log, January 2026. All three assets commissioned Jan 1.
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3">
        <div className="space-y-3">
          {ASSETS.map((a) => (
            <div key={a.id} className="flex items-center gap-2">
              <span className="w-14 shrink-0 font-mono text-xs">{a.id}</span>
              <div className="relative h-7 flex-1 rounded-sm bg-fd-muted/40">
                {a.rows.map((r) => (
                  <div key={r.start}>
                    <div
                      className="absolute top-0 bottom-0 flex items-center justify-center overflow-hidden border-r border-fd-background bg-emerald-500/60"
                      style={{ left: `${at(r.from)}%`, width: `${at(r.start) - at(r.from)}%` }}
                    >
                      <span className="font-mono text-[10px] font-semibold whitespace-nowrap text-emerald-950 dark:text-emerald-50">
                        {r.uptime}h
                      </span>
                    </div>
                    <div
                      className="absolute top-0 bottom-0 min-w-[3px] bg-red-500"
                      style={{ left: `${at(r.start)}%`, width: `${at(r.end) - at(r.start)}%` }}
                    />
                  </div>
                ))}
                <div
                  className="absolute top-0 bottom-0 bg-[repeating-linear-gradient(135deg,transparent_0_4px,rgb(127_127_127/0.25)_4px_6px)]"
                  style={{ left: `${at(a.lastRepair)}%`, right: 0 }}
                />
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <span className="w-14 shrink-0" />
            <div className="relative h-4 flex-1">
              {TICKS.map((d) => (
                <span
                  key={d}
                  className="absolute -translate-x-1/2 font-mono text-[10px] whitespace-nowrap text-fd-muted-foreground"
                  style={{ left: `${at(`2026-01-${String(d).padStart(2, '0')} 00:00`)}%` }}
                >
                  Jan {d}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-fd-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Badge n="1" className="size-4 bg-emerald-600 text-[9px]" />
            <span className="inline-block h-2.5 w-4 rounded-sm bg-emerald-500/60" /> uptime (counted)
          </span>
          <span className="flex items-center gap-1.5">
            <Badge n="2" className="size-4 bg-red-500 text-[9px]" />
            <span className="inline-block h-2.5 w-1.5 bg-red-500" /> repair
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-4 rounded-sm bg-[repeating-linear-gradient(135deg,transparent_0_4px,rgb(127_127_127/0.4)_4px_6px)]" />{' '}
            running since last repair (not counted)
          </span>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-violet-500/40 p-3">
        <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
          <Badge n="3" className="bg-violet-500" />
          Per asset: sum, then divide by failure count
        </p>
        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs uppercase text-fd-muted-foreground">
              <th className="px-1.5 py-1 text-left">Asset</th>
              <th className="px-1.5 py-1 text-right">Fails</th>
              <th className="px-1.5 py-1 text-right">MTBF</th>
              <th className="px-1.5 py-1 text-right">MTTR</th>
              <th className="px-1.5 py-1 text-right">Avail.</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {ASSETS.map((a) => (
              <tr key={a.id} className={cn('border-t border-fd-border', a === worst && 'bg-red-500/10')}>
                <td className="px-1.5 py-1">
                  {a.id}
                  {a === thin && (
                    <span className="ml-1.5 rounded bg-amber-500/15 px-1 font-sans text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                      1 failure
                    </span>
                  )}
                </td>
                <td className="px-1.5 py-1 text-right">{a.failures}</td>
                <td className="px-1.5 py-1 text-right">{hrs(a.mtbf)}</td>
                <td className="px-1.5 py-1 text-right">{hrs(a.mttr)}</td>
                <td className="px-1.5 py-1 text-right">{pctFmt(a.availability)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-fd-border font-semibold text-fd-primary">
              <td className="px-1.5 py-1 font-sans">All assets</td>
              <td className="px-1.5 py-1 text-right">{ROWS.length}</td>
              <td className="px-1.5 py-1 text-right">{hrs(MTBF)}</td>
              <td className="px-1.5 py-1 text-right">{hrs(MTTR)}</td>
              <td className="px-1.5 py-1 text-right">{pctFmt(AVAILABILITY)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-emerald-600" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Uptime Hours</span> — each green
            segment runs from that asset&apos;s <strong>own</strong> previous repair to its next failure. A first failure
            has no previous repair, so it falls back to the commissioning date: AST-02&apos;s first segment is{' '}
            {firstEvent.uptime} h from Jan 1. Without that fallback, every asset&apos;s first segment would be blank.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-red-500" />
          <p>
            <span className="font-mono text-red-600 dark:text-red-400">Repair Hours</span> — failure start to repair
            complete. They&apos;re slivers next to the uptime, which is what a {pctFmt(AVAILABILITY)} availability looks
            like. The hatched tail after each last repair isn&apos;t counted, because no failure has ended it yet.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">MTBF / MTTR</span> — summed hours divided
            by failure count. {worst.id} has the worst MTBF ({hrs(worst.mtbf)} over {worst.failures} failures).{' '}
            {thin.id} looks best at {hrs(thin.mtbf)}, but from a single failure: flag it rather than trust it.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Availability</span> — MTBF ÷ (MTBF + MTTR) ={' '}
            {hrs(MTBF)} ÷ ({hrs(MTBF)} + {hrs(MTTR)}) = {pctFmt(AVAILABILITY)} across all assets.
          </p>
        </div>
      </div>
    </div>
  );
}
