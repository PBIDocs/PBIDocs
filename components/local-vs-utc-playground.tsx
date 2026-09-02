'use client';

import { useEffect, useState } from 'react';
import { FlaskConical, RotateCw } from 'lucide-react';
import { AskAiInlineButton } from '@/components/ask-ai-inline-button';
import { buildAskAiPrompt } from '@/lib/ask-ai-events';

interface Snapshot {
  local: string;
  utc: string;
  offsetMinutes: number;
  timeZone: string;
}

function takeSnapshot(): Snapshot {
  const d = new Date();
  return {
    local: d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' }),
    utc: d.toISOString().replace('T', ' ').replace('Z', ' UTC'),
    offsetMinutes: d.getTimezoneOffset(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export function LocalVsUtcPlayground() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    // The real current time doesn't exist at static-export build time, and
    // reading it during render risks a server/client mismatch -- same class
    // of problem as reading localStorage, same fix: read it after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSnapshot(takeSnapshot());
  }, []);

  const sameInstant = snapshot ? snapshot.offsetMinutes === 0 : false;

  return (
    <div id="try-it-live" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        <FlaskConical className="size-3.5" />
        Try it live — this is your actual browser clock, right now
      </p>

      {!snapshot ? (
        <p className="text-sm text-fd-muted-foreground">Reading the current time…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-fd-border bg-fd-background p-3">
              <p className="text-xs text-fd-muted-foreground">
                DateTime.LocalNow() — your timezone ({snapshot.timeZone})
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-fd-primary">{snapshot.local}</p>
            </div>
            <div className="rounded-lg border border-fd-border bg-fd-background p-3">
              <p className="text-xs text-fd-muted-foreground">DateTimeZone.UtcNow()</p>
              <p className="mt-1 font-mono text-sm font-semibold text-fd-primary">{snapshot.utc}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSnapshot(takeSnapshot())}
            className="mt-3 flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
          >
            <RotateCw className="size-3.5" />
            Take a new snapshot
          </button>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {sameInstant ? (
              <span className="text-xs text-fd-muted-foreground">
                Your browser is currently set to UTC, so these happen to match right now — a
                machine in almost any other timezone would see them differ.
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                These already differ, right now, in your own browser — a scheduled refresh running
                on a machine in a different timezone than yours would see the same gap in
                DateTime.LocalNow().
              </span>
            )}
            <AskAiInlineButton
              prompt={buildAskAiPrompt(
                'Explain why DateTime.LocalNow() and DateTimeZone.UtcNow() can return different values for the same refresh:\n\n',
                `DateTime.LocalNow() (timezone ${snapshot.timeZone}): ${snapshot.local}\nDateTimeZone.UtcNow(): ${snapshot.utc}`,
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}
