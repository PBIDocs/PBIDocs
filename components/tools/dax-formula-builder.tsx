'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Check, Copy, Loader2, RotateCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import { UpgradeBanner } from '@/components/upgrade-banner';
import { ManageBillingLink } from '@/components/manage-billing-link';

type Mode = 'dax' | 'm';
type Status = 'idle' | 'loading' | 'success' | 'error' | 'limited';

interface FunctionUsed {
  name: string;
  description: string;
}

interface BuilderResponse {
  title: string;
  formula: string;
  explanation: string;
  functionsUsed: FunctionUsed[];
  remaining: number;
  isSubscriber: boolean;
}

const DAX_EXAMPLES = [
  'Total sales for the current year',
  'Percent of total sales by category',
  'Running total of sales by date',
  'Sales year-over-year growth percentage',
  'Rank products by total sales within their category',
  'Average order value',
  'Count of distinct customers who ordered this month',
  'Days since a customer’s last order',
];

const M_EXAMPLES = [
  'Remove rows where the Amount column is blank or zero',
  'Split a FullName column into First Name and Last Name',
  'Combine all Excel files in a folder into one table',
  'Add a column that flags orders over $1,000 as High Value',
  'Trim whitespace and convert a Region column to uppercase',
  'Merge two tables on CustomerID and keep only matching rows',
  'Group sales by month and sum the Amount column',
  'Convert a text column of dates into a proper Date type',
];

const QUOTA_STORAGE_KEY = 'dax-builder-quota';
const FREE_LIMIT_PER_DAY = 5;

function pickExamples(mode: Mode): string[] {
  const pool = mode === 'm' ? M_EXAMPLES : DAX_EXAMPLES;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
}

function readStoredRemaining(): number | null {
  try {
    const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { remaining?: number; date?: string };
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.date !== today || typeof parsed.remaining !== 'number') return null;
    return parsed.remaining;
  } catch {
    return null;
  }
}

function storeRemaining(remaining: number) {
  try {
    localStorage.setItem(
      QUOTA_STORAGE_KEY,
      JSON.stringify({ remaining, date: new Date().toISOString().slice(0, 10) }),
    );
  } catch {
    // Best-effort only — the server remains the source of truth.
  }
}

export function DaxFormulaBuilder() {
  const [mode, setMode] = useState<Mode>('dax');
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<BuilderResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [knownRemaining, setKnownRemaining] = useState<number | null>(null);
  const examples = useMemo(() => pickExamples(mode), [mode]);

  useEffect(() => {
    // localStorage doesn't exist at static-export build time, so this can't be a lazy useState initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKnownRemaining(readStoredRemaining());
  }, []);

  async function runBuild(promptOverride?: string) {
    const activePrompt = (promptOverride ?? prompt).trim();
    if (!activePrompt || status === 'loading') return;

    setStatus('loading');
    setError('');
    setCopied(false);

    try {
      const res = await fetch('/api/dax-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: activePrompt, mode }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<BuilderResponse> & { error?: string };

      if (!res.ok) {
        setStatus(res.status === 429 ? 'limited' : 'error');
        setError(data.error ?? 'Something went wrong. Please try again.');
        if (res.status === 429) {
          setKnownRemaining(0);
          storeRemaining(0);
        }
        return;
      }

      setResult(data as BuilderResponse);
      setStatus('success');
      if (typeof data.remaining === 'number') {
        setKnownRemaining(data.remaining);
        storeRemaining(data.remaining);
      }
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await runBuild();
  }

  async function copyFormula() {
    if (!result) return;
    const text = mode === 'dax' ? `${result.title} =\n${result.formula}` : result.formula;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const loading = status === 'loading';
  const codeText = result ? (mode === 'dax' ? `${result.title} =\n${result.formula}` : result.formula) : '';

  return (
    <div className="flex flex-col gap-6">
      <div className="inline-flex w-fit rounded-full border border-fd-border p-1 text-sm">
        {(['dax', 'm'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              if (m === mode || loading) return;
              setMode(m);
              setResult(null);
              setStatus('idle');
              setError('');
            }}
            className={cn(
              'rounded-full px-4 py-1.5 font-medium transition-colors',
              mode === m
                ? 'bg-fd-primary text-fd-primary-foreground'
                : 'text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            {m === 'dax' ? 'DAX Measure' : 'Power Query M'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="dax-prompt" className="text-sm font-medium text-fd-foreground">
          {mode === 'dax' ? 'Describe the calculation' : 'Describe the transformation'}
        </label>
        <textarea
          id="dax-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          maxLength={300}
          rows={3}
          placeholder={
            mode === 'dax' ? 'e.g. Percent of total sales by category' : 'e.g. Remove rows where Amount is blank'
          }
          className="w-full resize-none rounded-lg border border-fd-border bg-fd-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:opacity-60"
        />

        <div className="flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setPrompt(example)}
              disabled={loading}
              className="rounded-full border border-fd-border px-3 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground disabled:opacity-60"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="flex items-center justify-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? 'Building…' : 'Build It'}
          </button>
          {knownRemaining !== null && status !== 'limited' && (
            <p className="text-xs text-fd-muted-foreground/70">
              {knownRemaining} of {FREE_LIMIT_PER_DAY} free requests left today
            </p>
          )}
        </div>
      </form>

      {(status === 'error' || status === 'limited') && (
        <div className="flex flex-col gap-3">
          <p
            className={cn(
              'rounded-lg border px-4 py-3 text-sm',
              status === 'limited'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'border-red-500/30 bg-red-500/10 text-red-500',
            )}
            role="alert"
          >
            {error}
          </p>
          {status === 'limited' && !result?.isSubscriber && <UpgradeBanner />}
        </div>
      )}

      {status === 'success' && result && (
        <div className="flex flex-col gap-4 rounded-xl border border-fd-border p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-fd-foreground">{result.title}</p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => runBuild()}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCw className="size-3.5" />}
                Regenerate
              </button>
              <button
                type="button"
                onClick={copyFormula}
                className="flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <pre className="overflow-x-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
            <code>{highlightCode(codeText)}</code>
          </pre>

          <p className="text-sm leading-relaxed text-fd-muted-foreground">{result.explanation}</p>

          {result.functionsUsed.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-fd-border pt-3">
              <p className="text-xs font-medium tracking-wide text-fd-muted-foreground uppercase">
                Functions Used
              </p>
              <ul className="flex flex-col gap-1 text-sm text-fd-muted-foreground">
                {result.functionsUsed.map((fn) => (
                  <li key={fn.name}>
                    <code className="text-fd-foreground">{fn.name}</code> — {fn.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 text-xs text-fd-muted-foreground/70">
            <p>
              {result.isSubscriber ? (
                <>
                  Pro — {result.remaining} request{result.remaining === 1 ? '' : 's'} left today.
                </>
              ) : (
                <>
                  {result.remaining} free request{result.remaining === 1 ? '' : 's'} left today.
                </>
              )}{' '}
              Always test a generated {mode === 'dax' ? 'measure' : 'step'} against your own model before
              shipping it.
            </p>
            {result.isSubscriber && <ManageBillingLink />}
          </div>
        </div>
      )}
    </div>
  );
}
