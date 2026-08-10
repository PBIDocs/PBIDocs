import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { getMDXComponents } from '@/components/mdx';
import { getBlogPost, getBlogPosts } from '@/lib/blog-source';

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const MDX = post.body;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <Link
        href="/blog"
        className="text-sm text-fd-muted-foreground hover:text-fd-foreground transition-colors"
      >
        ← Back to Blog
      </Link>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start">
        <article className="min-w-0 max-w-3xl flex-1">
          <div className="mb-10 border-b border-fd-border pb-6">
            <DocsTitle>{post.title}</DocsTitle>
            <DocsDescription className="mb-0">{post.description}</DocsDescription>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-fd-muted-foreground/80">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.tags?.map((tag) => (
                <span key={tag} className="rounded-full border border-fd-border px-2.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <DocsBody>
            <MDX components={getMDXComponents()} />
          </DocsBody>
        </article>

        {post.toc.length > 0 && (
          <aside className="hidden w-64 shrink-0 lg:block">
            <nav className="sticky top-24 flex flex-col gap-1.5 border-l border-fd-border text-sm">
              <p className="mb-2 pl-4 text-sm font-medium text-fd-foreground">On this page</p>
              {post.toc.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  className="text-fd-muted-foreground transition-colors hover:text-fd-primary"
                  style={{ paddingLeft: `${(item.depth - 2) * 12 + 16}px` }}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return {
    title: post.title,
    description: post.description,
  };
}
