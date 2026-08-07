'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Pencil, Bug } from 'lucide-react';
import { cn } from '@/lib/cn';

export function PageFeedback({
  page,
  editUrl,
  issueUrl,
}: {
  page: string;
  editUrl: string;
  issueUrl: string;
}) {
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);

  function vote(helpful: boolean) {
    if (voted) return;
    setVoted(helpful ? 'yes' : 'no');
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, helpful }),
    }).catch(() => {
      // best-effort; voting UI already reflects the choice
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-fd-border pt-4 text-sm">
      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-fd-muted-foreground uppercase">
          {voted ? 'Thanks for the feedback!' : 'Was this helpful?'}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => vote(true)}
            disabled={voted !== null}
            aria-pressed={voted === 'yes'}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-fd-muted-foreground transition-colors disabled:cursor-default',
              voted === 'yes'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                : 'border-fd-border hover:bg-fd-accent',
            )}
          >
            <ThumbsUp className="size-3.5" />
            Yes
          </button>
          <button
            type="button"
            onClick={() => vote(false)}
            disabled={voted !== null}
            aria-pressed={voted === 'no'}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-fd-muted-foreground transition-colors disabled:cursor-default',
              voted === 'no'
                ? 'border-red-500/40 bg-red-500/10 text-red-500'
                : 'border-fd-border hover:bg-fd-accent',
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
