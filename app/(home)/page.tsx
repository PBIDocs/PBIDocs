import Link from 'next/link';
import type { Metadata } from 'next';
import { appName, gitConfig } from '@/lib/shared';
import { NewsletterForm } from '@/components/newsletter-form';

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

export default function HomePage() {
  return (
    <div className="relative overflow-hidden flex flex-col items-center text-center px-6 py-24">
     <div className="absolute inset-0 -z-10">
      <div className="absolute left-1/2 top-0 h-[400px] w-[100%] -translate-x-1/2 rounded-full bg-fd-primary/10 blur-3xl" />
     </div>


      {/* Hero */}
      <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-6 inline-flex rounded-full border px-4 py-1 text-sm text-fd-muted-foreground">
         Power BI + AI Documentation Platform
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-6">
        Master Power BI.
        <br />
        Build smarter with AI.
        </h1>

        <p className="text-lg text-fd-muted-foreground max-w-2xl mx-auto mb-10">
          Learn DAX, Power Query, Data Modeling, Microsoft Fabric, and AI-assisted
          Power BI development with clear documentation and practical examples.
        </p>

        <div className="flex justify-center gap-4">
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

      {/* Newsletter */}
      <section className="mt-24 flex w-full max-w-5xl flex-col items-center gap-4 rounded-xl border border-fd-border p-8 text-center">
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
