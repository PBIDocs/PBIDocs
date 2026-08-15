import Link from 'next/link';
import type { Metadata } from 'next';
import { Calendar, Rss } from 'lucide-react';
import { getBlogPosts, type BlogPost } from '@/lib/blog-source';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Practical fixes, cheat sheets, and deep dives for Power BI, DAX, and Power Query.',
  alternates: {
    canonical: '/blog',
  },
};

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function PostMeta({ post }: { post: BlogPost }) {
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

export default function BlogIndexPage() {
  const [latest, ...rest] = getBlogPosts();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[400px] w-[100%] -translate-x-1/2 rounded-full bg-fd-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-6 inline-flex rounded-full border px-4 py-1 text-sm text-fd-muted-foreground">
            Practical Power BI Fixes
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">The Blog</h1>
          <p className="mx-auto max-w-xl text-lg text-fd-muted-foreground">
            Real errors, real causes, real fixes — plus cheat sheets that don&apos;t fit the
            reference docs.
          </p>
          <a
            href="/rss.xml"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-primary"
          >
            <Rss className="size-3.5" />
            RSS feed
          </a>
        </div>

        {latest && (
          <Link
            href={`/blog/${latest.slug}`}
            className="group mb-10 block rounded-2xl border border-fd-border p-8 transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/50 hover:bg-fd-accent/50 hover:shadow-lg"
          >
            <span className="mb-4 inline-flex rounded-full bg-fd-primary/10 px-3 py-1 text-xs font-semibold text-fd-primary">
              Latest
            </span>
            <h2 className="mb-2 text-2xl font-semibold transition-colors group-hover:text-fd-primary">
              {latest.title}
            </h2>
            <p className="mb-4 text-fd-muted-foreground">{latest.description}</p>
            <PostMeta post={latest} />
          </Link>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-xl border border-fd-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/50 hover:bg-fd-accent/50 hover:shadow-md"
            >
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
      </div>
    </div>
  );
}
