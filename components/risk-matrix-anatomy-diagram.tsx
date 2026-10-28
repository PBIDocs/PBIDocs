import { cn } from '@/lib/cn';

// risk_assessments.csv from the risk register tutorial: one row per risk, per assessment date.
const ASSESSMENTS = [
  { risk: 'RISK-01', date: '2026-05-01', likelihood: 3, impact: 4 },
  { risk: 'RISK-01', date: '2026-07-01', likelihood: 4, impact: 4 },
  { risk: 'RISK-02', date: '2026-05-01', likelihood: 1, impact: 3 },
  { risk: 'RISK-03', date: '2026-05-01', likelihood: 3, impact: 3 },
  { risk: 'RISK-03', date: '2026-07-01', likelihood: 2, impact: 3 },
  { risk: 'RISK-04', date: '2026-05-01', likelihood: 2, impact: 5 },
  { risk: 'RISK-05', date: '2026-05-01', likelihood: 4, impact: 2 },
  { risk: 'RISK-06', date: '2026-05-01', likelihood: 3, impact: 3 },
  { risk: 'RISK-07', date: '2026-05-01', likelihood: 2, impact: 4 },
  { risk: 'RISK-08', date: '2026-05-01', likelihood: 3, impact: 5 },
];

const RISK_IDS = [...new Set(ASSESSMENTS.map((a) => a.risk))];
const REASSESSED = RISK_IDS.filter((id) => ASSESSMENTS.filter((a) => a.risk === id).length > 1);

// Same as Current Likelihood / Current Impact: the single row with each risk's latest AssessmentDate.
const latest = (id: string) =>
  ASSESSMENTS.filter((a) => a.risk === id).reduce((a, b) => (b.date > a.date ? b : a));

type Level = 'Critical' | 'High' | 'Medium' | 'Low';

// Same thresholds as the page's SWITCH(TRUE(), ...), highest first.
const levelOf = (score: number): Level => (score >= 15 ? 'Critical' : score >= 9 ? 'High' : score >= 4 ? 'Medium' : 'Low');

const LEVEL_STYLE: Record<Level, { pill: string; cell: string }> = {
  Critical: { pill: 'bg-red-500/15 text-red-700 dark:text-red-300', cell: 'bg-red-500/25' },
  High: { pill: 'bg-orange-500/15 text-orange-700 dark:text-orange-300', cell: 'bg-orange-500/20' },
  Medium: { pill: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300', cell: 'bg-yellow-500/15' },
  Low: { pill: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', cell: 'bg-emerald-500/10' },
};

const CURRENT = RISK_IDS.map((id) => {
  const a = latest(id);
  const score = a.likelihood * a.impact;
  return { id, likelihood: a.likelihood, impact: a.impact, score, level: levelOf(score) };
}).sort((a, b) => b.score - a.score);

const AXIS = [1, 2, 3, 4, 5];
const shortId = (id: string) => id.replace('RISK-', '');

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

function LevelPill({ level }: { level: Level }) {
  return (
    <span className={cn('rounded px-1.5 py-0.5 font-sans text-[11px] font-semibold', LEVEL_STYLE[level].pill)}>
      {level}
    </span>
  );
}

// The 5×5 grid on its own, also used as the homepage preview for the systems-engineering tutorials.
export function RiskMatrixGrid({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-1.5', className)}>
      <div className="flex w-4 items-center justify-center">
        <span className="-rotate-90 text-[11px] whitespace-nowrap text-fd-muted-foreground">Likelihood →</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-[1.25rem_repeat(5,minmax(0,1fr))] gap-1">
          {[...AXIS].reverse().map((l) => (
            <div key={l} className="contents">
              <div className="flex items-center justify-center font-mono text-xs text-fd-muted-foreground">{l}</div>
              {AXIS.map((i) => {
                const here = CURRENT.filter((r) => r.likelihood === l && r.impact === i);
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex aspect-square flex-col items-center justify-center rounded-md border border-fd-border/60 font-mono',
                      LEVEL_STYLE[levelOf(l * i)].cell,
                    )}
                  >
                    {here.length > 0 ? (
                      <>
                        <span className="text-sm leading-none font-bold">{here.length}</span>
                        <span className="mt-0.5 text-[9px] leading-none text-fd-muted-foreground sm:text-[10px]">
                          {here.map((r) => shortId(r.id)).join(',')}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-fd-muted-foreground/50">0</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <div />
          {AXIS.map((i) => (
            <div key={i} className="text-center font-mono text-xs text-fd-muted-foreground">
              {i}
            </div>
          ))}
        </div>
        <p className="mt-1 text-center text-[11px] text-fd-muted-foreground">Impact →</p>
      </div>
    </div>
  );
}

export function RiskMatrixAnatomyDiagram() {
  const r01History = ASSESSMENTS.filter((a) => a.risk === 'RISK-01');
  const r01AvgLikelihood = r01History.reduce((s, a) => s + a.likelihood, 0) / r01History.length;
  const urgent = CURRENT.filter((r) => r.level === 'Critical' || r.level === 'High');

  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a risk heat map
      </p>
      <p className="mb-4 text-xs text-fd-muted-foreground">The risk register tutorial&apos;s dataset, all 8 risks.</p>

      <div className="rounded-lg border border-sky-500/40 p-3">
        <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
          <Badge n="1" className="bg-sky-500" />
          Latest assessment per risk — the {REASSESSED.length} reassessed risks
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {REASSESSED.map((id) => {
            const rows = ASSESSMENTS.filter((a) => a.risk === id);
            const last = latest(id);
            return (
              <div key={id} className="rounded-md border border-fd-border bg-fd-background p-2 font-mono text-xs">
                <p className="font-semibold">{id}</p>
                {rows.map((a) => {
                  const isLatest = a === last;
                  return (
                    <p
                      key={a.date}
                      className={cn(
                        'mt-1 flex items-center justify-between gap-2 rounded px-1.5 py-0.5',
                        isLatest ? 'bg-sky-500/10' : 'text-fd-muted-foreground',
                      )}
                    >
                      <span className={cn(!isLatest && 'line-through opacity-60')}>{a.date}</span>
                      <span className={cn(!isLatest && 'line-through opacity-60')}>
                        L{a.likelihood} × I{a.impact}
                      </span>
                      <span className="font-sans text-[11px]">{isLatest ? 'used' : 'ignored'}</span>
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="rounded-lg border border-amber-500/40 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="2" className="bg-amber-500" />
            Risk Score = L × I, then banded
          </p>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="text-xs uppercase text-fd-muted-foreground">
                <th className="px-1.5 py-1 text-left">Risk</th>
                <th className="px-1.5 py-1 text-right">L × I</th>
                <th className="px-1.5 py-1 text-right">Score</th>
                <th className="px-1.5 py-1 text-left">Level</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {CURRENT.map((r) => (
                <tr key={r.id} className="border-t border-fd-border">
                  <td className="px-1.5 py-1">{shortId(r.id)}</td>
                  <td className="px-1.5 py-1 text-right text-fd-muted-foreground">
                    {r.likelihood} × {r.impact}
                  </td>
                  <td className="px-1.5 py-1 text-right font-semibold">{r.score}</td>
                  <td className="px-1.5 py-1">
                    <LevelPill level={r.level} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-violet-500/40 p-3">
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Badge n="3" className="bg-violet-500" />
            5×5 matrix on disconnected axes
          </p>
          <RiskMatrixGrid className="mt-2" />
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Latest assessment</span> — each risk resolves to
            its single most recent row. Averaging instead would put RISK-01&apos;s likelihood at {r01AvgLikelihood}, hiding
            that it just got worse; RISK-03&apos;s mitigation would be half-ignored the same way.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Score and band</span> — likelihood × impact,
            then <span className="font-mono">SWITCH(TRUE(), …)</span> checks ≥ 15, ≥ 9, ≥ 4 in that order. The band
            drives the decision, not the raw number.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">Matrix</span> — each cell counts the risks
            whose current likelihood and impact match that cell. The axis tables aren&apos;t related to the data, so the
            empty cells still render; every cell is colored by the band its own L × I would fall in.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Result</span> — the {urgent.length} Critical and High risks (
            {urgent.map((r) => shortId(r.id)).join(', ')}) cluster toward the high-impact side of the grid, where a
            table sorted by ID would scatter them.
          </p>
        </div>
      </div>
    </div>
  );
}
