'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ManageBillingLink } from '@/components/manage-billing-link';

export function UpgradeBanner({ variant = 'compact' }: { variant?: 'compact' | 'prominent' }) {
  const [loading, setLoading] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  async function upgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as { url?: string; alreadySubscribed?: boolean };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.alreadySubscribed) {
        setAlreadySubscribed(true);
      }
    } catch {
      // fall through to re-enable the button
    }
    setLoading(false);
  }

  if (alreadySubscribed) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
        You&apos;re already on Pro. <ManageBillingLink />
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={upgrade}
      disabled={loading}
      className={cn(
        'flex items-center justify-center gap-1.5 font-semibold transition-colors disabled:opacity-60',
        variant === 'prominent'
          ? 'w-full rounded-lg bg-fd-primary px-5 py-2.5 text-sm text-fd-primary-foreground hover:opacity-90'
          : 'rounded-lg border border-fd-primary/30 bg-fd-primary/10 px-3 py-2 text-xs text-fd-primary hover:bg-fd-primary/20',
      )}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', variant === 'prominent' ? 'size-4' : 'size-3.5')} />
      ) : (
        <Sparkles className={cn(variant === 'prominent' ? 'size-4' : 'size-3.5')} />
      )}
      {variant === 'prominent' ? 'Upgrade to Pro' : 'Upgrade — $5/mo for more →'}
    </button>
  );
}
