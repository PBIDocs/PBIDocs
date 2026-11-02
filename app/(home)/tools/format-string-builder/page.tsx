import type { Metadata } from 'next';
import Link from 'next/link';
import { FormatStringBuilder } from '@/components/tools/format-string-builder';

export const metadata: Metadata = {
  title: 'Power BI Format String Builder',
  description:
    'Build Power BI custom format strings for thousands (K), millions (M), billions (B), currency, percentages, and negatives in parentheses, with a live preview and a dynamic format string for automatic K/M/B.',
  alternates: {
    canonical: '/tools/format-string-builder',
  },
};

export default function FormatStringBuilderPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Format String Builder</h1>
      <p className="mb-10 text-lg text-fd-muted-foreground">
        Show $1.2M instead of $1,234,567.89, negatives in parentheses, or a dash for zero. Pick the
        look, check it against real values, and copy the format string, or the dynamic format
        expression when you want K, M, and B chosen automatically.
      </p>

      <FormatStringBuilder />

      <div className="mt-14 space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing
          you type is sent anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">Why not FORMAT() everywhere?</strong> A format
          string only changes how a number is displayed, so the measure still sorts, totals, and
          exports as a number. FORMAT() turns it into text, which breaks all three.
        </p>
        <p>
          Building the measures themselves? See{' '}
          <Link href="/docs/dax/measures" className="text-fd-primary hover:underline">
            Measures
          </Link>
          , or browse all the{' '}
          <Link href="/tools" className="text-fd-primary hover:underline">
            Power BI tools
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
