import type { Metadata } from 'next';
import Link from 'next/link';
import { ReliabilityCalculator } from '@/components/tools/reliability-calculator';

export const metadata: Metadata = {
  title: 'MTBF, MTTR & Availability Calculator',
  description:
    'Paste a failure log or enter totals to get MTBF, MTTR, availability, failure rate, and mission reliability, with a per-asset breakdown and the matching DAX measures for Power BI.',
  alternates: {
    canonical: '/tools/reliability-calculator',
  },
};

export default function ReliabilityCalculatorPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Reliability Calculator</h1>
      <p className="mb-10 text-lg text-fd-muted-foreground">
        Paste a failure log straight from a spreadsheet, or enter the totals, and get MTBF, MTTR,
        availability, and the odds of getting through a mission without a failure, per asset and
        overall. Then take the same metrics into Power BI as DAX.
      </p>

      <ReliabilityCalculator />

      <div className="mt-14 space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing
          you paste is sent anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">How uptime is counted.</strong> Each uptime period
          runs from the previous repair (or the in-service date, for an asset&apos;s first failure)
          to the next failure. Time since an asset&apos;s last repair isn&apos;t counted, so MTBF
          comes out conservative while an asset is still running. The{' '}
          <Link
            href="/tutorials/build-a-reliability-mtbf-mttr-dashboard"
            className="text-fd-primary hover:underline"
          >
            reliability dashboard tutorial
          </Link>{' '}
          builds the same calculation as DAX calculated columns.
        </p>
        <p>
          MTBF assumes failures happen at random. If your assets wear out, the{' '}
          <Link href="/tools/weibull-analysis" className="text-fd-primary hover:underline">
            Weibull Analysis
          </Link>{' '}
          tool shows how they fail and when to replace them.
        </p>
        <p>
          For the formulas on their own, see{' '}
          <Link href="/docs/dax-patterns/reliability-mtbf-mttr" className="text-fd-primary hover:underline">
            Reliability Metrics (MTBF, MTTR &amp; Availability)
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
