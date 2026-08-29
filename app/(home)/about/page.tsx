import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: 'What PBIDocs is, who writes it, and why it exists alongside Microsoft\'s official Power BI documentation.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-3">About PBIDocs</h1>
      <p className="text-lg text-fd-muted-foreground mb-10">
        An independent Power BI reference, written from actually building the reports.
      </p>

      <div className="prose-sm max-w-none space-y-10 text-fd-muted-foreground [&_h2]:text-fd-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_p]:leading-relaxed">
        <section>
          <h2>Why This Exists</h2>
          <p>
            Most Power BI content online covers the same handful of examples — sales dashboards,
            retail KPIs, the same few DAX patterns repeated across dozens of near-identical
            tutorials. PBIDocs is written by a systems engineer who builds Power BI reports as
            part of the job, not as a side project, and it leans into the content that
            generic tutorials skip: earned value management (CPI/SPI/EAC), requirements
            traceability, risk matrices, reliability metrics, and the kind of gateway/refresh
            and query-folding problems that only show up once a report leaves a laptop and
            has to run reliably in production.
          </p>
        </section>

        <section>
          <h2>Not Affiliated With Microsoft</h2>
          <p>
            PBIDocs is an independent, unofficial resource. It isn&apos;t affiliated with,
            endorsed by, or sponsored by Microsoft — Power BI is a trademark of Microsoft, used
            here only to describe the subject matter. Where the official docs aim to be an
            exhaustive reference, PBIDocs is built around worked examples, diagrams for concepts
            that are hard to picture from text alone, and pages linked directly to the specific
            errors people actually search for.
          </p>
        </section>

        <section>
          <h2>How It&apos;s Written</h2>
          <p>
            Content is written with AI-assisted tools — in the same spirit as the site&apos;s own{' '}
            <Link href="/docs" className="text-fd-primary hover:underline">
              AI-Assisted Power BI
            </Link>{' '}
            coverage — but every page is directed, reviewed, and technically checked before it
            publishes. The two AI tools on the site, the{' '}
            <Link href="/tools/dax-formula-builder" className="text-fd-primary hover:underline">
              DAX Formula Builder
            </Link>{' '}
            and the Ask AI panel on docs pages, exist to answer the same kind of specific,
            worked-example questions the docs themselves are built around.
          </p>
        </section>

        <section>
          <h2>Get In Touch</h2>
          <p>
            Found an error, have a suggestion, or just want to say hi:{' '}
            <Link href="/contact" className="text-fd-primary hover:underline">
              contact page
            </Link>
            . See the{' '}
            <Link href="/faq" className="text-fd-primary hover:underline">
              FAQ
            </Link>{' '}
            for common questions about the site itself, or{' '}
            <Link href="/pricing" className="text-fd-primary hover:underline">
              Pricing
            </Link>{' '}
            for how the free and Pro tiers work.
          </p>
        </section>
      </div>
    </div>
  );
}
