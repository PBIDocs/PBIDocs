import type { Metadata } from 'next';
import Link from 'next/link';
import { Faq } from '@/components/faq';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Common questions about PBIDocs — what it is, how it\'s maintained, and how to contribute.',
  alternates: {
    canonical: '/faq',
  },
};

const faqItems = [
  {
    question: 'Is PBIDocs free to use?',
    answer:
      'Yes. Every page is free to read, with no sign-up, paywall, or account required. An email newsletter is available for people who want updates, but it isn\'t required to use the site.',
  },
  {
    question: 'Is PBIDocs affiliated with or endorsed by Microsoft?',
    answer:
      'No. PBIDocs is an independent, unofficial resource. It isn\'t affiliated with, endorsed by, or sponsored by Microsoft — Power BI is a trademark of Microsoft, used here only to describe the subject matter.',
  },
  {
    question: 'How is PBIDocs different from Microsoft\'s official Power BI documentation?',
    answer:
      'Microsoft\'s docs aim to be an exhaustive reference. PBIDocs is built around worked examples, ASCII diagrams for concepts that are hard to picture from text alone, and pages cross-linked to related topics and to blog posts covering the specific errors people actually hit.',
  },
  {
    question: 'How often is new content added?',
    answer:
      'Regularly, in small batches — new docs pages, blog posts, and tutorials rather than occasional large rewrites. See the Changelog for a running, dated record of what\'s been added.',
  },
  {
    question: 'I found an error or an outdated screenshot — how do I report it?',
    answer:
      'Every docs page has a "Report an issue" link at the bottom that opens a pre-filled GitHub issue. You can also open an issue directly on the GitHub repository.',
  },
  {
    question: 'Can I contribute directly?',
    answer:
      'Yes. Every docs page has an "Edit this page" link pointing at its source file. For anything bigger than a small fix — a new page, a restructure — opening an issue first helps make sure the change fits before the work is done.',
  },
  {
    question: 'Is the content written with AI assistance?',
    answer:
      'Yes — PBIDocs is written with AI-assisted tools, in the same spirit the AI-Assisted Power BI section itself covers, with every page directed, reviewed, and technically checked by a human before publishing.',
  },
  {
    question: 'What license is the content under?',
    answer:
      'No license has been set yet, so all rights are reserved by default. If you\'d like to reuse content or code from the site, open an issue on GitHub to ask.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-4xl font-bold tracking-tight mb-3">FAQ</h1>
      <p className="text-lg text-fd-muted-foreground mb-4">
        Common questions about PBIDocs itself — not Power BI. For Power BI and DAX questions, see{' '}
        <Link href="/docs" className="text-fd-primary hover:underline">
          the docs
        </Link>{' '}
        or{' '}
        <Link href="/blog" className="text-fd-primary hover:underline">
          the blog
        </Link>
        .
      </p>

      <Faq items={faqItems} showHeading={false} />
    </div>
  );
}
