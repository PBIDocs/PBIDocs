import type { Metadata } from 'next';
import Link from 'next/link';
import { TimeIntelligenceGenerator } from '@/components/tools/time-intelligence-generator';

export const metadata: Metadata = {
  title: 'Power BI Time Intelligence Measure Generator',
  description:
    'Generate YTD, QTD, MTD, prior year, YoY %, rolling 12 month, and running total DAX measures for any base measure, as standalone measures or a calculation group, with fiscal year support and a preview.',
  alternates: {
    canonical: '/tools/time-intelligence-generator',
  },
};

export default function TimeIntelligenceGeneratorPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Time Intelligence Generator</h1>
      <p className="mb-10 text-lg text-fd-muted-foreground">
        Pick a base measure and the comparisons you need: year to date, prior year, growth, rolling
        windows. Get the DAX as separate measures or as one calculation group, and see what each one
        returns before you paste it.
      </p>

      <TimeIntelligenceGenerator />

      <div className="mt-14 space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing
          you type is sent anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">Measures or a calculation group?</strong> Separate
          measures are simplest when you only need these comparisons for one or two base measures.
          Once you need YTD and prior year for Sales, Cost, Margin, and Units, a calculation group
          writes each calculation once and applies it to all of them.
        </p>
        <p>
          Want to understand what these functions actually do? See{' '}
          <Link href="/docs/dax/time-intelligence" className="text-fd-primary hover:underline">
            Time Intelligence
          </Link>{' '}
          and the{' '}
          <Link href="/blog/dax-time-intelligence-cheat-sheet" className="text-fd-primary hover:underline">
            DAX Time Intelligence Cheat Sheet
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
