import Link from 'next/link';
import type { Metadata } from 'next';
import { getBlogPosts } from '@/lib/blog-source';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Practical fixes, cheat sheets, and deep dives for Power BI, DAX, and Power Query.',
};

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-3">Blog</h1>
      <p className="text-lg text-fd-muted-foreground mb-16">
        Practical fixes, cheat sheets, and deep dives that don&apos;t fit the reference docs —
        real errors, real causes, real fixes.
      </p>

      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-fd-border pb-8 last:border-0">
            <Link href={`/blog/${post.slug}`} className="group block">
              <h2 className="text-xl font-semibold group-hover:text-fd-primary transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-fd-muted-foreground">{post.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-fd-muted-foreground/80">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                {post.tags?.map((tag) => (
                  <span key={tag} className="rounded-full border border-fd-border px-2.5 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
