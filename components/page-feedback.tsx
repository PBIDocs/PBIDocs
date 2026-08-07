'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Pencil, Bug } from 'lucide-react';
import { cn } from '@/lib/cn';

type Status = 'idle' | 'pending' | 'done' | 'error';

export function PageFeedback({
  page,
  editUrl,
  issueUrl,
}: {
  page: string;
  editUrl: string;
  issueUrl: string;
}) {
  const [choice, setChoice] = useState<'yes' | 'no' | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  async function vote(helpful: boolean) {
    if (status === 'pending' || status === 'done') return;
    setChoice(helpful ? 'yes' : 'no');
    setStatus('pending');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, helpful }),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  const locked = status === 'pending' || status === 'done';

  return (
    <div className="flex flex-col gap-3 border-t border-fd-border pt-4 text-sm">
      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-fd-muted-foreground uppercase">
          {status === 'done'
            ? 'Thanks for the feedback!'
            : status === 'error'
              ? 'Something went wrong — try again'
              : 'Was this helpful?'}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => vote(true)}
            disabled={locked}
            aria-pressed={status === 'done' && choice === 'yes'}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-fd-muted-foreground transition-colors disabled:cursor-default',
              status === 'done' && choice === 'yes'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                : 'border-fd-border hover:bg-fd-accent',
              status === 'pending' && choice === 'yes' && 'opacity-60',
            )}
          >
            <ThumbsUp className="size-3.5" />
            Yes
          </button>
          <button
            type="button"
            onClick={() => vote(false)}
            disabled={locked}
            aria-pressed={status === 'done' && choice === 'no'}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-fd-muted-foreground transition-colors disabled:cursor-default',
              status === 'done' && choice === 'no'
                ? 'border-red-500/40 bg-red-500/10 text-red-500'
                : 'border-fd-border hover:bg-fd-accent',
              status === 'pending' && choice === 'no' && 'opacity-60',
            )}
          >
            <ThumbsDown className="size-3.5" />
            No
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <a
          href={editUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-1.5 text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground"
        >
          <Pencil className="size-3.5" />
          Edit this page
        </a>
        <a
          href={issueUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-1.5 text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground"
        >
          <Bug className="size-3.5" />
          Report an issue
        </a>
      </div>
    </div>
  );
}
