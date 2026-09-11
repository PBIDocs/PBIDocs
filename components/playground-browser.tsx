'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface PlaygroundEntry {
  fn: string;
  href: string;
  pitch: string;
}

const LANGUAGES = ['All', 'DAX', 'Power Query M'] as const;
type Language = (typeof LANGUAGES)[number];

function PlaygroundCard({ item }: { item: PlaygroundEntry }) {
  return (
    <Link
      href={item.href}
      className="group flex items-start justify-between gap-4 rounded-xl border border-fd-border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-fd-primary/50 hover:bg-fd-accent/50 hover:shadow-md"
    >
      <div>
        <p className="font-mono text-sm font-semibold text-fd-foreground">{item.fn}</p>
        <p className="mt-1 text-sm text-fd-muted-foreground">{item.pitch}</p>
      </div>
      <ArrowRight className="mt-0.5 size-4 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-fd-primary" />
    </Link>
  );
}

export function PlaygroundBrowser({
  dax,
  powerQuery,
}: {
  dax: PlaygroundEntry[];
  powerQuery: PlaygroundEntry[];
}) {
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<Language>('All');

  const total = dax.length + powerQuery.length;

  const matchesQuery = (item: PlaygroundEntry) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return item.fn.toLowerCase().includes(q) || item.pitch.toLowerCase().includes(q);
  };

  const filteredDax = lang === 'Power Query M' ? [] : dax.filter(matchesQuery);
  const filteredPowerQuery = lang === 'DAX' ? [] : powerQuery.filter(matchesQuery);
  const shownCount = filteredDax.length + filteredPowerQuery.length;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fd-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search examples…"
            aria-label="Search interactive examples"
            className="w-full rounded-lg border border-fd-border bg-fd-background py-2 pr-8 pl-9 text-sm outline-none focus:border-fd-primary"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-fd-muted-foreground hover:text-fd-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div role="group" aria-label="Filter by language" className="flex gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                lang === l
                  ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
                  : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/50 hover:text-fd-foreground',
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-8 text-sm text-fd-muted-foreground">
        Showing {shownCount} of {total} example{total === 1 ? '' : 's'}
      </p>

      <div className="flex flex-col gap-12">
        {filteredDax.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">DAX</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredDax.map((item) => (
                <PlaygroundCard key={item.href} item={item} />
              ))}
            </div>
          </section>
        )}
        {filteredPowerQuery.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Power Query M</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredPowerQuery.map((item) => (
                <PlaygroundCard key={item.href} item={item} />
              ))}
            </div>
          </section>
        )}
        {shownCount === 0 && (
          <p className="py-12 text-center text-fd-muted-foreground">
            No examples match &quot;{query}&quot;
            {lang !== 'All' ? ` in ${lang}` : ''} — try a different search term
            {lang !== 'All' ? ' or clear the language filter' : ''}.
          </p>
        )}
      </div>
    </>
  );
}
