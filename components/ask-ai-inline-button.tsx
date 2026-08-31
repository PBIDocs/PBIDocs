'use client';

import { Sparkles } from 'lucide-react';
import { askAi } from '@/lib/ask-ai-events';

/**
 * A small "Ask AI" affordance for interactive playgrounds -- sits next to a
 * result line so a confusing or unexpected result can be asked about on the
 * spot, reusing the same page-level AskAi panel code blocks already open.
 */
export function AskAiInlineButton({ prompt }: { prompt: string }) {
  return (
    <button
      type="button"
      onClick={() => askAi(prompt)}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-fd-muted-foreground transition-colors hover:text-fd-primary"
    >
      <Sparkles className="size-3" />
      Ask AI about this
    </button>
  );
}
