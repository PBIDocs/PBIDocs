'use client';

import { useEffect, useState } from 'react';
import type { TOCItemType } from 'fumadocs-core/toc';
import { cn } from '@/lib/cn';

export function BlogToc({ toc }: { toc: TOCItemType[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = toc
      .map((item) => document.getElementById(item.url.slice(1)))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <nav className="flex flex-col gap-1.5 border-l border-fd-border text-sm">
      <p className="mb-2 pl-4 text-sm font-medium text-fd-foreground">On this page</p>
      {toc.map((item) => {
        const id = item.url.slice(1);
        const isActive = id === activeId;

        return (
          <a
            key={item.url}
            href={item.url}
            className={cn(
              '-ml-px border-l-2 py-0.5 transition-colors',
              isActive
                ? 'border-fd-primary font-medium text-fd-primary'
                : 'border-transparent text-fd-muted-foreground hover:border-fd-border hover:text-fd-foreground',
            )}
            style={{ paddingLeft: `${(item.depth - 2) * 12 + 16}px` }}
          >
            {item.title}
          </a>
        );
      })}
    </nav>
  );
}
