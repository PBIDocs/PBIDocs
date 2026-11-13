import type { Metadata } from 'next';
import Link from 'next/link';
import { WeibullAnalysis } from '@/components/tools/weibull-analysis';

export const metadata: Metadata = {
  title: 'Weibull Analysis Calculator (β, η, B10 Life)',
  description:
    'Paste failure times and running (suspended) units to get Weibull shape β and scale η by median rank regression, B10 life, reliability at a replacement interval, a Weibull probability plot, and the DAX to fit the same Weibull in Power BI.',
  alternates: {
    canonical: '/tools/weibull-analysis',
  },
};

export default function WeibullAnalysisPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Weibull Analysis</h1>
      <p className="mb-10 max-w-3xl text-lg text-fd-muted-foreground">
        Paste how long each unit ran, failed or still going, to see <em>how</em> it fails: early, at random, or by
        wearing out. Get the B10 life, the reliability at your replacement interval, and the same fit in Power BI as
        DAX.
      </p>

      <WeibullAnalysis />

      <div className="mt-14 max-w-3xl space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing you paste is sent
          anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">What β and η mean.</strong> The shape β says how the failure rate changes
          with age: below 1 it falls (early-life failures), near 1 it&apos;s constant (random failures), above 1 it rises
          (wear-out). The scale η is the age by which 63.2% of units have failed, whatever β is.
        </p>
        <p>
          <strong className="text-fd-foreground">Why include units that haven&apos;t failed.</strong> A pump that has run
          8,000 hours without failing is evidence that life is longer than 8,000 hours for at least some pumps. Leaving
          it out biases the fit toward short lives. Johnson&apos;s adjusted ranks let running units count without
          pretending they failed.
        </p>
        <p>
          <strong className="text-fd-foreground">How it&apos;s fitted.</strong> Median rank regression: each failure gets
          a median rank (Bernard&apos;s approximation, with Johnson&apos;s adjustment for suspensions), and a straight
          line is fitted on the Weibull plot by regressing log hours on the plot&apos;s Y, the usual engineering default
          for small samples. Maximum likelihood can give slightly different answers, especially with many suspensions.
        </p>
        <p>
          Building it in Power BI? The{' '}
          <Link href="/tutorials/build-a-weibull-reliability-dashboard" className="text-fd-primary hover:underline">
            Weibull reliability tutorial
          </Link>{' '}
          builds this example from a 20-pump fleet: the rank columns, the LINESTX fit, the probability plot, and why the
          fleet&apos;s MTBF set the wrong replacement interval.
        </p>
        <p>
          More reliability tools: the{' '}
          <Link href="/tools/reliability-calculator" className="text-fd-primary hover:underline">
            Reliability Calculator
          </Link>{' '}
          for MTBF and availability, and the{' '}
          <Link href="/tools/fmea-calculator" className="text-fd-primary hover:underline">
            FMEA Calculator
          </Link>
          . Or browse all the{' '}
          <Link href="/tools" className="text-fd-primary hover:underline">
            Power BI tools
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
