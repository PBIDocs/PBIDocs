'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import { UpgradeBanner } from '@/components/upgrade-banner';
import { ManageBillingLink } from '@/components/manage-billing-link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Status = 'idle' | 'loading' | 'error' | 'limited';

function quickQuestions(pageTitle: string): string[] {
  return [
    `What does ${pageTitle} do?`,
    `Give me a real-world example using ${pageTitle}`,
    `What are common mistakes with ${pageTitle}?`,
  ];
}

function renderContent(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const code = part.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
      return (
        <pre key={i} className="my-2 overflow-x-auto rounded-lg bg-fd-secondary px-3 py-2 text-xs">
          <code>{highlightCode(code)}</code>
        </pre>
      );
    }
    return (
      <span key={i} className="whitespace-pre-wrap">
        {part.split(/(`[^`]+`)/g).map((segment, j) =>
          segment.startsWith('`') && segment.endsWith('`') ? (
            <code key={j} className="rounded bg-fd-secondary px-1 py-0.5 text-[0.85em]">
              {segment.slice(1, -1)}
            </code>
          ) : (
            <span key={j}>{segment}</span>
          ),
        )}
      </span>
    );
  });
}

export function AskAi({ pageTitle }: { pageTitle: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [isSubscriber, setIsSubscriber] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, status]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || status === 'loading') return;

    const nextMessages: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, pageTitle }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        isSubscriber?: boolean;
      };

      if (!res.ok) {
        setStatus(res.status === 429 ? 'limited' : 'error');
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setMessages([...nextMessages, { role: 'assistant', content: data.reply ?? '' }]);
      setStatus('idle');
      setIsSubscriber(Boolean(data.isSubscriber));
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') send(input);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-fd-primary/20 bg-fd-primary/10 px-3 py-1.5 text-xs font-medium text-fd-primary transition-colors hover:bg-fd-primary/20"
      >
        <Sparkles className="size-3.5" />
        Ask AI
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 animate-in fade-in bg-black/50 duration-200"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-label={`Ask AI about ${pageTitle}`}
            onClick={(e) => e.stopPropagation()}
            className="animate-in slide-in-from-right absolute top-0 right-0 flex h-full w-full max-w-sm flex-col border-l border-fd-border bg-fd-background duration-200"
          >
            <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full bg-fd-primary" />
                <p className="text-sm font-semibold text-fd-foreground">Ask AI about {pageTitle}</p>
                {isSubscriber && (
                  <span className="rounded-full bg-fd-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-fd-primary">
                    PRO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs">
                {isSubscriber && <ManageBillingLink />}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-md p-1 text-fd-muted-foreground hover:bg-fd-accent"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium tracking-wide text-fd-muted-foreground uppercase">
                    Quick Questions
                  </p>
                  {quickQuestions(pageTitle).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="rounded-lg border border-fd-border px-3 py-2 text-left text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
                    >
                      {q}
                    </button>
                  ))}
                  <div className="mt-2">
                    <UpgradeBanner />
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'self-end border border-fd-primary/20 bg-fd-primary/10'
                      : 'self-start bg-fd-secondary',
                  )}
                >
                  {renderContent(m.content)}
                </div>
              ))}

              {status === 'loading' && (
                <div className="self-start rounded-lg bg-fd-secondary px-3 py-2 text-sm text-fd-muted-foreground">
                  Thinking…
                </div>
              )}

              {(status === 'error' || status === 'limited') && (
                <div className="flex flex-col gap-2">
                  <p
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs',
                      status === 'limited'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-red-500/30 bg-red-500/10 text-red-500',
                    )}
                    role="alert"
                  >
                    {error}
                  </p>
                  {status === 'limited' && !isSubscriber && <UpgradeBanner />}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-fd-border p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status === 'loading'}
                maxLength={500}
                placeholder={`Ask anything about ${pageTitle}…`}
                className="flex-1 rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={status === 'loading' || !input.trim()}
                aria-label="Send"
                className="flex shrink-0 items-center justify-center rounded-lg bg-fd-primary p-2 text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
