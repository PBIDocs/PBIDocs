import { cn } from '@/lib/cn';

const EXPRESSION_VALUE = 'M';

const BRANCHES = [
  { value: '"S"', result: 'Small' },
  { value: '"M"', result: 'Medium' },
  { value: '"L"', result: 'Large' },
];

const ELSE_RESULT = '"Unknown Size"';

const matchIndex = BRANCHES.findIndex((b) => b.value === `"${EXPRESSION_VALUE}"`);

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

export function SwitchAnatomyDiagram() {
  return (
    <div className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of SWITCH()
      </p>

      <div className="rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm">
        <span className="text-fd-muted-foreground">Size Group = </span>
        SWITCH(
        <span className="text-amber-600 dark:text-amber-400">DimProduct[Size]</span>, &quot;S&quot;, &quot;Small&quot;,{' '}
        <span className="text-emerald-600 dark:text-emerald-400">&quot;M&quot;, &quot;Medium&quot;</span>, &quot;L&quot;, &quot;Large&quot;,
        &quot;Unknown Size&quot;)
      </div>

      <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
        <p className="text-xs text-fd-muted-foreground">Expression</p>
        <p className="mt-1 flex items-center gap-1.5 font-mono text-lg font-semibold text-amber-600 dark:text-amber-400">
          <Badge n="1" className="bg-amber-500" />
          DimProduct[Size] = &quot;{EXPRESSION_VALUE}&quot;
        </p>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-fd-border">
        {BRANCHES.map((b, i) => {
          const isMatch = i === matchIndex;
          const isSkipped = matchIndex !== -1 && i > matchIndex;
          return (
            <div
              key={b.value}
              className={cn(
                'flex items-center justify-between border-t border-fd-border px-3 py-2 font-mono text-sm first:border-t-0',
                isMatch && 'bg-emerald-500/10',
                isSkipped && 'opacity-40',
              )}
            >
              <span className="flex items-center gap-2">
                {b.value} &rarr; {b.result}
                {isMatch && <Badge n="2" className="bg-emerald-500" />}
              </span>
              <span className="text-xs text-fd-muted-foreground">
                {isMatch ? 'match — stops here' : isSkipped ? 'never evaluated' : 'checked, no match'}
              </span>
            </div>
          );
        })}
        <div
          className={cn(
            'flex items-center justify-between border-t border-fd-border px-3 py-2 font-mono text-sm',
            matchIndex === -1 ? 'bg-emerald-500/10' : 'opacity-40',
          )}
        >
          <span>{ELSE_RESULT} (else)</span>
          <span className="text-xs text-fd-muted-foreground">
            {matchIndex === -1 ? 'match — stops here' : 'never evaluated'}
          </span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">Result</p>
        <p className="mt-1 flex items-center gap-1.5 font-mono text-lg font-semibold text-fd-primary">
          <Badge n="✓" className="bg-fd-primary" />
          {matchIndex === -1 ? ELSE_RESULT.replace(/"/g, '') : BRANCHES[matchIndex].result}
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Expression</span> — evaluated{' '}
            <strong>once</strong>: <span className="font-mono">DimProduct[Size]</span> is &quot;{EXPRESSION_VALUE}
            &quot; for this row.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Value, Result pairs</span> — checked
            top to bottom. <span className="font-mono">&quot;S&quot;</span> doesn&apos;t match, so{' '}
            <span className="font-mono">SWITCH()</span> moves on; <span className="font-mono">&quot;M&quot;</span>{' '}
            matches and <span className="font-mono">SWITCH()</span> stops immediately — <strong>L</strong> and the
            else result are never evaluated at all, not just unused.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="✓" className="mt-0.5 bg-fd-primary" />
          <p>
            <span className="font-mono text-fd-primary">Result</span> — the measure returns{' '}
            <span className="font-mono">&quot;Medium&quot;</span>, the value tied to the first (and only) match.
          </p>
        </div>
      </div>
    </div>
  );
}
