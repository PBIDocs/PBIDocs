'use client';

import { useState } from 'react';

export function ManageBillingLink() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      // fall through to re-enable the link
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={loading}
      className="text-fd-muted-foreground underline decoration-dotted transition-colors hover:text-fd-foreground disabled:opacity-60"
    >
      {loading ? 'Opening…' : 'Manage subscription'}
    </button>
  );
}
