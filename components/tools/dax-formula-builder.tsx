'use client';

import { useState, type FormEvent } from 'react';
import { Check, Copy, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'limited';

interface FunctionUsed {
  name: string;
  description: string;
}

interface BuilderResponse {
  measureName: string;
  formula: string;
  explanation: string;
  functionsUsed: FunctionUsed[];
  remaining: number;
}

const EXAMPLE_PROMPTS = [
  'Total sales for the current year',
  'Percent of total sales by category',
  'Running total of sales by date',
  'Sales year-over-year growth percentage',
];

export function DaxFormulaBuilder() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<BuilderResponse | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!prompt.trim() || status === 'loading') return;

    setStatus('loading');
    setError('');
    setCopied(false);

    try {
      const res = await fetch('/api/dax-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<BuilderResponse> & { error?: string };

      if (!res.ok) {
        setStatus(res.status === 429 ? 'limited' : 'error');
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setResult(data as BuilderResponse);
      setStatus('success');
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  }

  async function copyFormula() {
    if (!result) return;
    await navigator.clipboard.writeText(`${result.measureName} =\n${result.formula}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const loading = status === 'loading';

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="dax-prompt" className="text-sm font-medium text-fd-foreground">
          Describe the calculation
        </label>
        <textarea
          id="dax-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          maxLength={300}
          rows={3}
          placeholder="e.g. Percent of total sales by category"
          className="w-full resize-none rounded-lg border border-fd-border bg-fd-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:opacity-60"
        />

        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example) => (
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

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-fit"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {loading ? 'Building…' : 'Build the Measure'}
        </button>
      </form>

      {(status === 'error' || status === 'limited') && (
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
      )}

      {status === 'success' && result && (
        <div className="flex flex-col gap-4 rounded-xl border border-fd-border p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-fd-foreground">{result.measureName}</p>
            <button
              type="button"
              onClick={copyFormula}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <pre className="overflow-x-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
            <code>{`${result.measureName} =\n${result.formula}`}</code>
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

          <p className="text-xs text-fd-muted-foreground/70">
            {result.remaining} free request{result.remaining === 1 ? '' : 's'} left today. Always test a
            generated measure against your own model before shipping it.
          </p>
        </div>
      )}
    </div>
  );
}
