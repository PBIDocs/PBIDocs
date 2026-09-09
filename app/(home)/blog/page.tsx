import type { Metadata } from 'next';
import { Rss } from 'lucide-react';
import { getBlogPosts, type BlogPost } from '@/lib/blog-source';
import { BlogPostGrid, type BlogPostSummary } from '@/components/blog-post-grid';

// BlogPost carries the full fumadocs collection entry (body renderer,
// getText/getMDAST helpers, etc.) which include functions -- those can't
// cross the server/client boundary as props, so strip down to plain data
// before handing posts to the client-side filterable grid.
function toSummary(post: BlogPost): BlogPostSummary {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    tags: post.tags,
  };
}

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Practical fixes, cheat sheets, and deep dives for Power BI, DAX, and Power Query.',
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  const topicCount = new Set(posts.flatMap((post) => post.tags ?? [])).size;
  const earliestYear = posts.reduce(
    (min, post) => Math.min(min, new Date(`${post.date}T00:00:00Z`).getUTCFullYear()),
    new Date().getUTCFullYear(),
  );

  const stats = [
    { value: `${posts.length}`, label: 'Posts' },
    { value: `${topicCount}`, label: 'Topics' },
    { value: `${earliestYear}`, label: 'Since' },
  ];

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

          <div className="mt-8 flex justify-center gap-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-fd-primary">{stat.value}</div>
                <div className="text-sm text-fd-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <BlogPostGrid posts={posts.map(toSummary)} />
      </div>
    </div>
  );
}
