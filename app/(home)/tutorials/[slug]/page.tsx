import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { getMDXComponents } from '@/components/mdx';
import { getTutorial, getTutorialImageUrl, getTutorials } from '@/lib/tutorial-source';
import { BlogToc } from '@/components/blog-toc';
import { Faq } from '@/components/faq';

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return extractText(props?.children);
  }
  return '';
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function TutorialPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const tutorial = getTutorial(slug);
  if (!tutorial) notFound();

  const MDX = tutorial.body;
  const url = `https://pbidocs.com/tutorials/${tutorial.slug}`;

  // Top-level (depth 2) headings become the HowTo's step list for rich results.
  const steps = tutorial.toc
    .filter((item) => item.depth === 2)
    .map((item) => ({
      '@type': 'HowToStep',
      name: extractText(item.title),
      url: `${url}${item.url}`,
    }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: tutorial.title,
    description: tutorial.description,
    datePublished: tutorial.date,
    dateModified: tutorial.date,
    url,
    image: `https://pbidocs.com${getTutorialImageUrl(tutorial.slug)}`,
    keywords: tutorial.tags?.join(', '),
    author: { '@type': 'Organization', name: 'PBIDocs', url: 'https://pbidocs.com' },
    publisher: { '@type': 'Organization', name: 'PBIDocs', url: 'https://pbidocs.com' },
    step: steps,
  };

  const faqJsonLd = tutorial.faq && tutorial.faq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: tutorial.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null;

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-6 py-16 sm:py-24">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <Link
        href="/tutorials"
        className="text-sm text-fd-muted-foreground hover:text-fd-foreground transition-colors"
      >
        ← Back to Tutorials
      </Link>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row">
        <article className="min-w-0 max-w-3xl flex-1 overflow-x-hidden">
          <div className="mb-10 border-b border-fd-border pb-6">
            <DocsTitle>{tutorial.title}</DocsTitle>
            <DocsDescription className="mb-0">{tutorial.description}</DocsDescription>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-fd-muted-foreground/80">
              <time dateTime={tutorial.date}>{formatDate(tutorial.date)}</time>
              {tutorial.tags?.map((tag) => (
                <span key={tag} className="rounded-full border border-fd-border px-2.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <DocsBody>
            <MDX components={getMDXComponents()} />
          </DocsBody>

          {tutorial.faq && tutorial.faq.length > 0 && <Faq items={tutorial.faq} />}
        </article>

        {tutorial.toc.length > 0 && (
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <BlogToc toc={tutorial.toc} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return getTutorials().map((tutorial) => ({ slug: tutorial.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const tutorial = getTutorial(slug);
  if (!tutorial) notFound();

  return {
    title: tutorial.title,
    description: tutorial.description,
    alternates: {
      canonical: `/tutorials/${tutorial.slug}`,
    },
    openGraph: {
      title: tutorial.title,
      description: tutorial.description,
      images: getTutorialImageUrl(tutorial.slug),
    },
  };
}
