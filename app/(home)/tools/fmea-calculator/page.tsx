import type { Metadata } from 'next';
import Link from 'next/link';
import { FmeaCalculator } from '@/components/tools/fmea-calculator';

export const metadata: Metadata = {
  title: 'FMEA RPN Calculator',
  description:
    'Paste failure modes with severity, occurrence, and detection ratings to get RPNs, High/Medium/Low action priority with a severity override, a ranked list, and the DAX for a Power BI FMEA dashboard.',
  alternates: {
    canonical: '/tools/fmea-calculator',
  },
};

export default function FmeaCalculatorPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">FMEA Calculator</h1>
      <p className="mb-10 max-w-3xl text-lg text-fd-muted-foreground">
        Paste your failure modes with severity, occurrence, and detection ratings to get each one&apos;s
        RPN and action priority, with a severity override so a rare but serious failure mode isn&apos;t
        ranked as an afterthought. Then take the same rules into Power BI as DAX.
      </p>

      <FmeaCalculator />

      <div className="mt-14 max-w-3xl space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing
          you paste is sent anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">Why RPN alone isn&apos;t enough.</strong> RPN
          multiplies three ordinal ratings, so very different failure modes can share a score: a
          10 × 2 × 5 and a 4 × 5 × 5 both come to 100. Ranking by RPN alone treats them as equal,
          which is why a severity override, or the newer AIAG-VDA action priority tables, puts the
          consequence first.
        </p>
        <p>
          The{' '}
          <Link href="/tutorials/build-an-fmea-dashboard" className="text-fd-primary hover:underline">
            FMEA dashboard tutorial
          </Link>{' '}
          builds this in Power BI with before-and-after ratings, and{' '}
          <Link href="/docs/dax-patterns/fmea-rpn-scoring" className="text-fd-primary hover:underline">
            FMEA &amp; RPN Scoring
          </Link>{' '}
          covers the pattern on its own. Or browse all the{' '}
          <Link href="/tools" className="text-fd-primary hover:underline">
            Power BI tools
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
