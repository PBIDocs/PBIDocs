'use client';

import { Search } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';

export function HeroSearch() {
  const { setOpenSearch, hotKey } = useSearchContext();

  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      className="mx-auto flex w-full max-w-lg items-center gap-3 rounded-xl border border-fd-border bg-fd-card/60 px-4 py-3 text-left text-fd-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-fd-primary/50 hover:text-fd-foreground"
    >
      <Search className="size-4 shrink-0" />
      <span className="flex-1 text-sm">Search DAX, Power Query, tutorials...</span>
      <span className="hidden items-center gap-0.5 rounded-md border border-fd-border bg-fd-background px-1.5 py-0.5 text-xs sm:flex">
        {hotKey.map((key, i) => (
          <span key={i}>{key.display}</span>
        ))}
      </span>
    </button>
  );
}
