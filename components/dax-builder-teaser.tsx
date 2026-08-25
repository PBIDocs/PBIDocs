'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Example {
  prompt: string;
  measure: string;
  formula: string;
}

const EXAMPLES: Example[] = [
  {
    prompt: 'Total sales for the current year',
    measure: 'Total Sales YTD',
    formula: "TOTALYTD(\n    SUM(Sales[Amount]),\n    'Date'[Date]\n)",
  },
  {
    prompt: 'Percent of total sales by category',
    measure: '% of Total',
    formula: 'DIVIDE(\n    [Total Sales],\n    CALCULATE([Total Sales], ALL(Product[Category]))\n)',
  },
  {
    prompt: 'Average order value',
    measure: 'Avg Order Value',
    formula: 'DIVIDE(\n    SUM(Sales[Amount]),\n    DISTINCTCOUNT(Sales[OrderID])\n)',
  },
  {
    prompt: 'Rank products by total sales',
    measure: 'Sales Rank',
    formula: 'RANKX(\n    ALL(Product[ProductName]),\n    [Total Sales]\n)',
  },
];

type Phase = 'typing' | 'thinking' | 'result' | 'holding' | 'erasing';

const TYPE_MS = 35;
const THINK_MS = 700;
const HOLD_MS = 2600;
const ERASE_MS = 15;

export function DaxBuilderTeaser() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');

  useEffect(() => {
    // matchMedia doesn't exist at static-export build time, so this can't be a lazy useState initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      // One-time jump to the static end state once the reduced-motion check above resolves.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTypedLength(EXAMPLES[0].prompt.length);
      setPhase('result');
      return;
    }

    const example = EXAMPLES[exampleIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (typedLength < example.prompt.length) {
        timeout = setTimeout(() => setTypedLength((n) => n + 1), TYPE_MS);
      } else {
        timeout = setTimeout(() => setPhase('thinking'), 400);
      }
    } else if (phase === 'thinking') {
      timeout = setTimeout(() => setPhase('result'), THINK_MS);
    } else if (phase === 'result') {
      timeout = setTimeout(() => setPhase('holding'), 50);
    } else if (phase === 'holding') {
      timeout = setTimeout(() => setPhase('erasing'), HOLD_MS);
    } else if (phase === 'erasing') {
      if (typedLength > 0) {
        timeout = setTimeout(() => setTypedLength((n) => n - 1), ERASE_MS);
      } else {
        timeout = setTimeout(() => {
          setExampleIndex((i) => (i + 1) % EXAMPLES.length);
          setPhase('typing');
        }, 200);
      }
    }

    return () => clearTimeout(timeout);
  }, [phase, typedLength, exampleIndex, reducedMotion]);

  const example = EXAMPLES[exampleIndex];
  const showResult = phase === 'result' || phase === 'holding';

  return (
    <div className="rounded-xl border border-fd-border bg-fd-background/70 p-5 font-mono text-sm shadow-sm backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 text-xs text-fd-muted-foreground">DAX Formula Builder</span>
      </div>

      <div className="flex min-h-10 items-start gap-2">
        <span className="text-fd-primary">{'>'}</span>
        <span className="text-fd-foreground">
          {example.prompt.slice(0, typedLength)}
          {!reducedMotion && phase !== 'thinking' && !showResult && (
            <span className="animate-pulse text-fd-primary">▌</span>
          )}
        </span>
      </div>

      {phase === 'thinking' && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-fd-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Building…
        </div>
      )}

      {showResult && (
        <pre className="animate-in fade-in slide-in-from-bottom-1 mt-3 overflow-x-auto rounded-lg bg-fd-secondary px-3 py-2.5 text-xs leading-relaxed duration-500">
          <code>
            <span className="text-fd-primary">{example.measure}</span>
            {' =\n'}
            {example.formula}
          </code>
        </pre>
      )}
    </div>
  );
}
