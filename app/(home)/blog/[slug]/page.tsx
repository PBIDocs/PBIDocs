import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { getMDXComponents } from '@/components/mdx';
import { getBlogPost, getBlogPostImageUrl, getBlogPosts } from '@/lib/blog-source';
import { BlogToc } from '@/components/blog-toc';

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

      <div className="mt-10 flex flex-col gap-10 lg:flex-row">
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
            <div className="sticky top-24">
              <BlogToc toc={post.toc} />
            </div>
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
    openGraph: {
      title: post.title,
      description: post.description,
      images: getBlogPostImageUrl(post.slug),
    },
  };
}
