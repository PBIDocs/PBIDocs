import { cn } from '@/lib/cn';

const DIM_SALESPERSON = [
  { key: 1, name: 'Alice' },
  { key: 2, name: 'Ben' },
];

const BRIDGE = [
  { sp: 1, acct: 100, start: '2024-01-01' },
  { sp: 1, acct: 101, start: '2024-03-15' },
  { sp: 2, acct: 100, start: '2024-06-01' },
];

const DIM_ACCOUNT = [
  { key: 100, name: 'Acme Co.' },
  { key: 101, name: 'Globex Inc.' },
];

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

function Connector({ label }: { label: string }) {
  return (
    <div className="my-2 flex flex-col items-center gap-1 text-xs text-fd-muted-foreground">
      <span className="h-5 w-px bg-fd-border" />
      <span>{label}</span>
      <span className="h-5 w-px bg-fd-border" />
    </div>
  );
}

export function BridgeTableAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a Bridge Table
      </p>

      <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-red-500/40 bg-red-500/5 p-3 text-xs">
        <span className="font-mono">DimSalesperson</span>
        <span className="flex flex-col items-center text-red-600 dark:text-red-400">
          <span>&times;</span>
          <span>many : many — avoided</span>
        </span>
        <span className="font-mono">DimAccount</span>
      </div>

      <p className="mt-4 text-xs text-fd-muted-foreground">
        DimSalesperson <span className="font-mono">(one)</span>
      </p>
      <div className="mt-1 overflow-hidden rounded-lg border border-amber-500/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">SalespersonKey</th>
              <th className="px-3 py-2 text-left">Name</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {DIM_SALESPERSON.map((s) => (
              <tr key={s.key} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    {s.key}
                    {s.key === 1 && <Badge n="1" className="bg-amber-500" />}
                  </span>
                </td>
                <td className="px-3 py-2">{s.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Connector label="1 : many" />

      <p className="text-xs text-fd-muted-foreground">
        BridgeSalespersonAccount <span className="font-mono">(many on both sides)</span>
      </p>
      <div className="mt-1 overflow-hidden rounded-lg border border-emerald-500/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">SalespersonKey</th>
              <th className="px-3 py-2 text-left">AccountKey</th>
              <th className="px-3 py-2 text-left">AssignmentStartDate</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {BRIDGE.map((b, i) => (
              <tr key={`${b.sp}-${b.acct}`} className="border-t border-fd-border">
                <td className="border-x border-amber-500/40 px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    {b.sp}
                    {i === 0 && <Badge n="1" className="bg-amber-500" />}
                  </span>
                </td>
                <td className="border-x border-sky-500/40 px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    {b.acct}
                    {i === 0 && <Badge n="2" className="bg-sky-500" />}
                  </span>
                </td>
                <td className="px-3 py-2 text-fd-muted-foreground">
                  {b.start}
                  {i === 0 && <Badge n="3" className="ml-1.5 inline-flex bg-emerald-500" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Connector label="many : 1" />

      <p className="text-xs text-fd-muted-foreground">
        DimAccount <span className="font-mono">(one)</span>
      </p>
      <div className="mt-1 overflow-hidden rounded-lg border border-sky-500/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-fd-secondary/50 text-xs uppercase text-fd-muted-foreground">
              <th className="px-3 py-2 text-left">AccountKey</th>
              <th className="px-3 py-2 text-left">Name</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {DIM_ACCOUNT.map((a) => (
              <tr key={a.key} className="border-t border-fd-border">
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    {a.key}
                    {a.key === 100 && <Badge n="2" className="bg-sky-500" />}
                  </span>
                </td>
                <td className="px-3 py-2">{a.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="flex items-center gap-1.5 font-mono text-sm font-semibold text-fd-primary">
          <Badge n="4" className="bg-fd-primary" />
          Two clean 1:many hops, zero many:many relationships
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">SalespersonKey</span> — unique in{' '}
            <span className="font-mono">DimSalesperson</span>, repeats in the bridge table (Alice appears twice,
            once per account). That pairing alone is a clean <strong>1 : many</strong> relationship.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">AccountKey</span> — repeats in the bridge
            table (account 100 appears twice, once per salesperson), unique in{' '}
            <span className="font-mono">DimAccount</span>. That pairing is also a clean{' '}
            <strong>many : 1</strong> relationship, just mirrored.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="text-emerald-600 dark:text-emerald-400">Narrow by design</span> — the bridge table
            holds only the two keys plus an attribute specific to the pairing itself. It&apos;s never queried like a
            dimension on its own.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">The result</span> — <span className="font-mono">
              DimSalesperson
            </span>{' '}
            and <span className="font-mono">DimAccount</span> never connect directly. Filtering either dimension
            flows through the bridge, one clean hop at a time, instead of relying on an ambiguous direct many:many
            relationship.
          </p>
        </div>
      </div>
    </div>
  );
}
