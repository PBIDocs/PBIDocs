import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BookOpen } from 'lucide-react';
import { appName, gitConfig } from '@/lib/shared';
import { NewsletterForm } from '@/components/newsletter-form';
import { HeroSearch } from '@/components/hero-search';
import { SpotlightCard } from '@/components/spotlight-card';
import { FunctionTicker } from '@/components/function-ticker';
import { source } from '@/lib/source';
import { getBlogPosts } from '@/lib/blog-source';
import { getTutorials } from '@/lib/tutorial-source';
import docsMeta from '@/content/docs/meta.json';

export const metadata: Metadata = {
  title: {
    absolute: 'PBIDocs — Master Power BI. Build smarter with AI.',
  },
  description:
    'Learn DAX, Power Query, Data Modeling, Microsoft Fabric, and AI-assisted Power BI development with clear documentation and practical examples.',
  alternates: {
    canonical: '/',
  },
};

const topics = [
  {
    title: 'DAX',
    description:
      'Learn measures, functions, filter context, and advanced calculations.',
    href: '/docs/dax/introduction',
  },
  {
    title: 'Power Query',
    description:
      'Master data transformation using M language and query techniques.',
    href: '/docs/power-query',
  },
  {
    title: 'Data Modeling',
    description:
      'Build efficient star schemas, relationships, and semantic models.',
    href: '/docs/modeling/introduction',
  },
  {
    title: 'Microsoft Fabric',
    description:
      'Explore Lakehouse, Warehouse, pipelines, and modern analytics.',
    href: '/docs/fabric/introduction',
  },
  {
    title: 'Visuals',
    description:
      'Design effective charts, tables, slicers, and custom formatting.',
    href: '/docs/visuals/charts',
  },
  {
    title: 'Power BI Service',
    description:
      'Manage workspaces, dashboards, scheduled refresh, and security.',
    href: '/docs/power-bi-service/workspaces',
  },
  {
    title: 'DAX Patterns',
    description:
      'Ready-made patterns for totals, ranking, and running calculations.',
    href: '/docs/dax-patterns/totals',
  },
  {
    title: 'AI-Assisted Power BI',
    description:
      'Use AI to accelerate DAX, Power Query, modeling, and report development.',
    href: '/docs/ai-power-bi/introduction',
  },
  {
    title: 'Governance',
    description:
      'Reference sheets for RLS matrices, gateway architecture, and report themes.',
    href: '/docs/governance/rls-matrix',
  },
];

const stats = [
  {
    value: `${source.getPages().length + getBlogPosts().length + getTutorials().length}+`,
    label: 'Pages',
  },
  {
    value: `${source.getPages().filter((page) => page.url.startsWith('/docs/dax/')).length}+`,
    label: 'DAX Pages',
  },
  { value: `${docsMeta.pages.length}`, label: 'Topics' },
];

export default function HomePage() {
  const [latestTutorial] = getTutorials();
  const latestPosts = getBlogPosts().slice(0, 2);

  return (
    <div className="relative overflow-hidden flex flex-col items-center text-center px-6 py-24">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-120px] h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-fd-primary/15 blur-3xl animate-pulse [animation-duration:6s]" />
        <div className="absolute right-[10%] top-[100px] h-[300px] w-[300px] rounded-full bg-fd-primary/10 blur-3xl" />
        <div className="absolute left-[5%] top-[250px] h-[250px] w-[250px] rounded-full bg-fd-primary/10 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-6 inline-flex rounded-full border px-4 py-1 text-sm text-fd-muted-foreground">
         Power BI + AI Documentation Platform
        </div>

        <h1 className="text-6xl sm:text-7xl font-bold tracking-tighter leading-[1.05] mb-6">
        Master <span className="text-fd-primary">Power BI</span>.
        <br />
        Build smarter with AI.
        </h1>

        <p className="text-lg text-fd-muted-foreground max-w-2xl mx-auto mb-8">
          Learn DAX, Power Query, Data Modeling, Microsoft Fabric, and AI-assisted
          Power BI development with clear documentation and practical examples.
        </p>

        <div className="mb-8">
          <HeroSearch />
        </div>

        <div className="flex justify-center gap-4 mb-14">
          <Link
            href="/docs"
            className="rounded-lg bg-fd-primary hover:bg-fd-primary/90 text-fd-primary-foreground px-6 py-3 font-semibold"
          >
            Browse Documentation
          </Link>

          <Link
            href="/docs/getting-started/introduction"
            className="rounded-lg border px-6 py-3 font-semibold hover:bg-fd-muted"
          >
            Get Started
          </Link>
        </div>

        <div className="flex justify-center gap-10">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-fd-primary">{stat.value}</div>
              <div className="text-sm text-fd-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Function Ticker */}
      <section className="mt-16 w-full max-w-5xl">
        <FunctionTicker />
      </section>

      {/* Topics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full">
        {topics.map((topic) => (
          <Link
            key={topic.title}
            href={topic.href}
            className="group rounded-xl border border-fd-border p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/50 hover:bg-fd-accent/50 hover:shadow-md">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-fd-primary transition-colors">
              {topic.title}
            </h2>

            <p className="text-fd-muted-foreground">
              {topic.description}
            </p>
          </Link>
        ))}
      </section>

      {/* Blog & Tutorials */}
      <section className="mt-24 w-full max-w-5xl text-left">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">From the Blog & Tutorials</h2>
            <p className="mt-1 text-fd-muted-foreground">
              Real fixes, cheat sheets, and full builds — not just reference pages.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {latestTutorial && (
            <SpotlightCard className="rounded-xl border border-fd-border bg-fd-card/40 lg:col-span-2">
              <Link href={`/tutorials/${latestTutorial.slug}`} className="group block p-8">
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-fd-primary/10 px-3 py-1 text-xs font-semibold text-fd-primary">
                  <BookOpen className="size-3.5" />
                  Featured Tutorial
                </span>
                <h3 className="mb-2 text-2xl font-semibold transition-colors group-hover:text-fd-primary">
                  {latestTutorial.title}
                </h3>
                <p className="mb-4 text-fd-muted-foreground">{latestTutorial.description}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary">
                  Start building
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </SpotlightCard>
          )}

          <div className="flex flex-col gap-4">
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex-1 rounded-xl border border-fd-border p-5 transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/50 hover:bg-fd-accent/50 hover:shadow-md"
              >
                <h3 className="mb-1.5 font-semibold transition-colors group-hover:text-fd-primary">
                  {post.title}
                </h3>
                <p className="text-sm text-fd-muted-foreground line-clamp-2">{post.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-6 text-sm font-medium">
          <Link href="/blog" className="text-fd-muted-foreground transition-colors hover:text-fd-primary">
            View all blog posts →
          </Link>
          <Link
            href="/tutorials"
            className="text-fd-muted-foreground transition-colors hover:text-fd-primary"
          >
            View all tutorials →
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section
        className="relative mt-24 flex w-full max-w-5xl flex-col items-center gap-4 rounded-xl border border-transparent p-8 text-center"
        style={{
          background: `
            linear-gradient(color-mix(in srgb, var(--color-fd-background) 97%, var(--color-fd-primary)), color-mix(in srgb, var(--color-fd-background) 97%, var(--color-fd-primary))) padding-box,
            linear-gradient(135deg, color-mix(in srgb, var(--color-fd-primary) 45%, transparent), transparent 55%, color-mix(in srgb, var(--color-fd-primary) 25%, transparent)) border-box
          `,
        }}
      >
        <div>
          <h2 className="text-xl font-semibold">Stay in the loop</h2>
          <p className="mt-1 text-fd-muted-foreground">
            New Power BI content, sent occasionally. No spam.
          </p>
        </div>
        <NewsletterForm />
      </section>

      <footer className="mt-24 flex w-full max-w-5xl flex-col items-center justify-between gap-4 border-t border-fd-border py-8 text-sm text-fd-muted-foreground sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} {appName}
        </p>
        <a
          href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
          target="_blank"
          rel="noreferrer noopener"
          className="transition-colors hover:text-fd-foreground"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
