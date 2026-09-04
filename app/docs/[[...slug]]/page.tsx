import { getPageImageUrl, getPageMarkdownUrl, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/notebook/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { gitConfig } from '@/lib/shared';
import { PageFeedback } from '@/components/page-feedback';
import { AskAi } from '@/components/ask-ai';
import { DocsCodeBlock } from '@/components/wrappable-codeblock';
import { getBreadcrumbItems } from 'fumadocs-core/breadcrumb';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const issueTitle = encodeURIComponent(`Docs issue: ${page.data.title}`);
  const issueBody = encodeURIComponent(`Page: https://pbidocs.com${page.url}\n\nDescribe the issue:\n`);

  const breadcrumbItems = getBreadcrumbItems(page.url, source.getPageTree(), {
    includePage: true,
    includeRoot: { url: '/docs' },
  });
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: typeof item.name === 'string' ? item.name : String(item.name),
      ...(item.url ? { item: `https://pbidocs.com${item.url}` } : {}),
    })),
  };

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      role="main"
      breadcrumb={{ includeRoot: { url: '/docs' }, includePage: true }}
      tableOfContent={{
        container: { role: 'complementary', 'aria-labelledby': 'toc-title' },
        footer: (
          <PageFeedback
            page={page.url}
            editUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/edit/${gitConfig.branch}/content/docs/${page.path}`}
            issueUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/issues/new?title=${issueTitle}&body=${issueBody}`}
          />
        ),
      }}
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
        <AskAi pageTitle={page.data.title} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
            // adds an "Ask AI" icon to every code block -- only safe here,
            // since AskAi (the listener) is only mounted on docs pages
            pre: DocsCodeBlock,
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: page.url,
    },
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
