'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Check, RotateCcw, X } from 'lucide-react';
import { highlightCode } from '@/lib/highlight-code';
import { cn } from '@/lib/cn';
import { EXERCISES, LEVELS, PRODUCTS, SALES, type Exercise, type Level } from '@/lib/dax-exercises';

const STORAGE_KEY = 'pbidocs-dax-practice-v1';
type Answers = Record<string, number>;

// Progress lives in localStorage, read through useSyncExternalStore so the
// server render (no answers) and the browser's stored answers don't clash.
// If storage is blocked, answers are kept in memory for this visit only.
const CHANGE_EVENT = 'pbidocs-dax-practice-change';
let memory = '{}';

function readRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? memory;
  } catch {
    return memory;
  }
}

function saveAnswers(a: Answers) {
  memory = JSON.stringify(a);
  try {
    window.localStorage.setItem(STORAGE_KEY, memory);
  } catch {
    // Storage blocked: progress just isn't remembered after this visit.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

function parse(raw: string): Answers {
  try {
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === 'object' ? (v as Answers) : {};
  } catch {
    return {};
  }
}

const fmt = (n: number) => n.toLocaleString('en-US');

function DataTable({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 font-mono text-xs font-semibold text-fd-muted-foreground">{caption}</p>
      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-fd-secondary/50 text-fd-muted-foreground">
              {head.map((h) => (
                <th key={h} className="px-2.5 py-1.5 text-left font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-fd-border">
                {r.map((c, j) => (
                  <td
                    key={j}
                    className={cn('px-2.5 py-1.5 whitespace-nowrap', typeof c === 'number' && 'text-right tabular-nums')}
                  >
                    {typeof c === 'number' ? fmt(c) : c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PracticeModel() {
  return (
    <section aria-labelledby="model" className="rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <h2 id="model" className="mb-1 text-lg font-semibold">
        The model
      </h2>
      <p className="mb-4 text-sm text-fd-muted-foreground">
        Every exercise runs against these tables, so you can check any answer by hand. Sales relates to Product on
        Product, and to a full 2025–2026 Date table on Date. <code className="font-mono">[Total Sales]</code> is{' '}
        <code className="font-mono">SUM ( Sales[Amount] )</code>.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <DataTable
          caption="Sales"
          head={['Order', 'Date', 'Product', 'Region', 'Qty', 'Amount']}
          rows={SALES.map((s) => [s.id, s.date, s.product, s.region, s.qty, s.amount])}
        />
        <DataTable
          caption="Product"
          head={['Product', 'Category', 'Price']}
          rows={PRODUCTS.map((p) => [p.product, p.category, p.price])}
        />
      </div>
    </section>
  );
}

function ExerciseCard({
  ex,
  n,
  chosen,
  onChoose,
  onReset,
}: {
  ex: Exercise;
  n: number;
  chosen: number | undefined;
  onChoose: (i: number) => void;
  onReset: () => void;
}) {
  const answered = chosen !== undefined;
  const correctIndex = ex.options.findIndex((o) => o.correct);
  const gotIt = answered && chosen === correctIndex;

  return (
    <article id={ex.id} className="min-w-0 scroll-mt-24 rounded-xl border border-fd-border p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-fd-muted-foreground">#{n}</span>
        <span className="rounded-full bg-fd-primary/10 px-2.5 py-0.5 text-xs font-semibold text-fd-primary">
          {ex.level}
        </span>
        {answered && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
              gotIt
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-500/10 text-red-700 dark:text-red-400',
            )}
          >
            {gotIt ? <Check className="size-3" /> : <X className="size-3" />}
            {gotIt ? 'Correct' : 'Not quite'}
          </span>
        )}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{ex.title}</h3>
      <p className="mb-3 text-sm text-fd-muted-foreground">{ex.setup}</p>
      <pre className="mb-4 overflow-x-auto rounded-lg border border-fd-border bg-fd-background p-3 font-mono text-sm whitespace-pre">
        {highlightCode(ex.code)}
      </pre>
      <p className="mb-3 font-medium">{ex.question}</p>

      <ul className="grid grid-cols-1 gap-2">
        {ex.options.map((o, i) => {
          const isChosen = chosen === i;
          const show = answered && (isChosen || o.correct);
          return (
            <li key={i}>
              <button
                type="button"
                disabled={answered}
                onClick={() => onChoose(i)}
                aria-pressed={isChosen}
                className={cn(
                  'w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                  !answered && 'border-fd-border bg-fd-background hover:border-fd-primary/50 hover:bg-fd-primary/5',
                  answered && !show && 'border-fd-border opacity-50',
                  show && o.correct && 'border-emerald-500/50 bg-emerald-500/10',
                  show && !o.correct && 'border-red-500/50 bg-red-500/10',
                )}
              >
                <span className={cn('flex items-start gap-2', o.code && 'font-mono text-[13px]')}>
                  <span className="mt-0.5 shrink-0">
                    {show ? (
                      o.correct ? (
                        <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <X className="size-4 text-red-600 dark:text-red-400" />
                      )
                    ) : (
                      <span className="inline-block size-4 rounded-full border border-fd-border" />
                    )}
                  </span>
                  <span className="min-w-0 break-words">{o.code ? highlightCode(o.text) : o.text}</span>
                </span>
                {show && <span className="mt-2 block pl-6 font-sans text-sm text-fd-muted-foreground">{o.why}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href={ex.learn.href} className="text-fd-primary hover:underline">
            Learn more: {ex.learn.label} →
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-fd-muted-foreground hover:text-fd-foreground"
          >
            <RotateCcw className="size-3.5" />
            Try again
          </button>
        </div>
      )}
    </article>
  );
}

export function DaxPractice() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => '{}');
  const answers = useMemo(() => parse(raw), [raw]);
  const [level, setLevel] = useState<Level | 'All'>('All');
  const update = saveAnswers;

  const answeredCount = EXERCISES.filter((e) => answers[e.id] !== undefined).length;
  const correctCount = EXERCISES.filter((e) => {
    const a = answers[e.id];
    return a !== undefined && e.options[a]?.correct;
  }).length;
  const shown = EXERCISES.map((e, i) => ({ e, n: i + 1 })).filter(({ e }) => level === 'All' || e.level === level);

  return (
    <div>
      <div className="sticky top-14 z-10 -mx-2 mb-6 flex flex-wrap items-center gap-2 border-b border-fd-border bg-fd-background/95 px-2 py-3 backdrop-blur">
        {(['All', ...LEVELS] as const).map((l) => {
          const count = l === 'All' ? EXERCISES.length : EXERCISES.filter((e) => e.level === l).length;
          return (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={cn(
                'rounded-md border px-2.5 py-1 text-xs',
                level === l
                  ? 'border-fd-primary/40 bg-fd-primary/10 text-fd-primary'
                  : 'border-fd-border text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              {l} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
        <span className="ml-auto flex items-center gap-3 text-sm">
          <span className="tabular-nums">
            <strong>{correctCount}</strong>
            <span className="text-fd-muted-foreground">
              {' '}
              / {EXERCISES.length} correct
              {answeredCount > correctCount && ` · ${answeredCount - correctCount} to retry`}
            </span>
          </span>
          {answeredCount > 0 && (
            <button
              type="button"
              onClick={() => update({})}
              className="text-xs text-fd-muted-foreground hover:text-fd-foreground"
            >
              Reset
            </button>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {shown.map(({ e, n }) => (
          <ExerciseCard
            key={e.id}
            ex={e}
            n={n}
            chosen={answers[e.id]}
            onChoose={(i) => update({ ...parse(readRaw()), [e.id]: i })}
            onReset={() => {
              const next = parse(readRaw());
              delete next[e.id];
              update(next);
            }}
          />
        ))}
      </div>
    </div>
  );
}
