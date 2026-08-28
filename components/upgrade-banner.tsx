'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { ManageBillingLink } from '@/components/manage-billing-link';

export function UpgradeBanner() {
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
      className="flex items-center justify-center gap-1.5 rounded-lg border border-fd-primary/30 bg-fd-primary/10 px-3 py-2 text-xs font-semibold text-fd-primary transition-colors hover:bg-fd-primary/20 disabled:opacity-60"
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
      Upgrade — $5/mo for more →
    </button>
  );
}
