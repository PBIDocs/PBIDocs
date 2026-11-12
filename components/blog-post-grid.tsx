'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, CircleAlert, Code, Keyboard, TriangleAlert, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';

export interface BlogPostSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  card?: { label: string; text: string };
}

const STRIP: Record<string, { icon: LucideIcon; tone: string; accent: string; code?: boolean }> = {
  Error: { icon: CircleAlert, tone: 'text-red-600 dark:text-red-400', accent: 'border-l-red-500/70' },
  Symptom: { icon: TriangleAlert, tone: 'text-amber-600 dark:text-amber-400', accent: 'border-l-amber-500/70' },
  Shortcuts: { icon: Keyboard, tone: 'text-fd-primary', accent: 'border-l-fd-primary/70' },
};
const CODE_STRIP = { icon: Code, tone: 'text-fd-primary', accent: 'border-l-fd-primary/70', code: true };

// The exact error message (or a symptom, or a snippet) the post is about, so a
// reader who searched for that text can spot the right post at a glance.
function CardStrip({ card, className, even }: { card: NonNullable<BlogPostSummary['card']>; className?: string; even?: boolean }) {
  const style = STRIP[card.label] ?? CODE_STRIP;
  const Icon = style.icon;
  return (
    <div
      className={cn(
        'rounded-md border border-l-2 border-fd-border bg-fd-secondary/50 px-3 py-2 font-mono text-xs',
        style.accent,
        className,
      )}
    >
      <span className={cn('mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase', style.tone)}>
        <Icon className="size-3" />
        {card.label}
      </span>
      <span className={cn('line-clamp-2 leading-relaxed text-fd-foreground/85', even && 'min-h-[2lh]')}>
        {style.code ? highlightCode(card.text) : card.text}
      </span>
    </div>
  );
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function PostMeta({ post }: { post: BlogPostSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-fd-muted-foreground/80">
      <span className="inline-flex items-center gap-1.5">
        <Calendar className="size-3.5" />
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </span>
      {post.tags?.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-fd-primary/10 px-2.5 py-0.5 text-xs font-medium text-fd-primary"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export function BlogPostGrid({ posts }: { posts: BlogPostSummary[] }) {
  const [activeTag, setActiveTag] = useState('All');

  const [latest, ...rest] = posts;

  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const tags = ['All', ...[...tagCounts.keys()].sort((a, b) => (tagCounts.get(b) ?? 0) - (tagCounts.get(a) ?? 0))];

  const latestMatches = activeTag === 'All' || Boolean(latest?.tags?.includes(activeTag));
  const filteredRest = activeTag === 'All' ? rest : rest.filter((post) => post.tags?.includes(activeTag));

  return (
    <>
      <div
        role="group"
        aria-label="Filter posts by topic"
        className="mb-10 flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700"
      >
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            aria-pressed={activeTag === tag}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              activeTag === tag
                ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
                : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/50 hover:text-fd-foreground',
            )}
          >
            {tag}
            {tag !== 'All' && (
              <span
                className={cn('ml-1.5', activeTag === tag ? 'opacity-80' : 'opacity-60')}
              >
                {tagCounts.get(tag)}
              </span>
            )}
          </button>
        ))}
      </div>

      {latest && latestMatches && (
        <Link
          href={`/blog/${latest.slug}`}
          className="group mb-10 block rounded-2xl border border-fd-border p-8 transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/50 hover:bg-fd-accent/50 hover:shadow-lg"
        >
          <span className="mb-4 inline-flex rounded-full bg-fd-primary/10 px-3 py-1 text-xs font-semibold text-fd-primary">
            Latest
          </span>
          {latest.card && <CardStrip card={latest.card} className="mb-4 max-w-2xl" />}
          <h2 className="mb-2 text-2xl font-semibold transition-colors group-hover:text-fd-primary">
            {latest.title}
          </h2>
          <p className="mb-4 text-fd-muted-foreground">{latest.description}</p>
          <PostMeta post={latest} />
        </Link>
      )}

      {filteredRest.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {filteredRest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-xl border border-fd-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/50 hover:bg-fd-accent/50 hover:shadow-md"
            >
              {post.card && <CardStrip card={post.card} even className="mb-4" />}
              <h2 className="mb-2 text-xl font-semibold transition-colors group-hover:text-fd-primary">
                {post.title}
              </h2>
              <p className="mb-4 text-fd-muted-foreground line-clamp-2">{post.description}</p>
              <div className="mt-auto">
                <PostMeta post={post} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        !latestMatches && (
          <p className="py-12 text-center text-fd-muted-foreground">
            No posts tagged &quot;{activeTag}&quot; yet — check back soon, or browse another topic above.
          </p>
        )
      )}
    </>
  );
}
