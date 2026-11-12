import type { Metadata } from 'next';
import Link from 'next/link';
import { ParetoChartBuilder } from '@/components/tools/pareto-chart-builder';

export const metadata: Metadata = {
  title: 'Pareto Chart Builder (80/20 Analysis With DAX)',
  description:
    'Paste defect causes with counts or costs to get a Pareto chart with the cumulative % line, the vital few that reach 80%, ties and "Other" ranked correctly, and the DAX to build the same Pareto chart in Power BI.',
  alternates: {
    canonical: '/tools/pareto-chart-builder',
  },
};

export default function ParetoChartBuilderPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Pareto Chart Builder</h1>
      <p className="mb-10 max-w-3xl text-lg text-fd-muted-foreground">
        Paste defect causes, complaint categories, or downtime reasons to see which few account for most of the
        problem. Rank by count or by cost, find the vital few that reach 80%, and take the same chart into Power BI as
        DAX.
      </p>

      <ParetoChartBuilder />

      <div className="mt-14 max-w-3xl space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing you paste is sent
          anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">How the vital few are chosen.</strong> Causes are ranked from largest
          to smallest, and a cause is in the vital few if the causes above it haven&apos;t reached the threshold yet. So
          the cause that carries the cumulative line past 80% is included, and the answer is rarely exactly 20% of the
          causes. The 80/20 split is a rule of thumb, not a law.
        </p>
        <p>
          <strong className="text-fd-foreground">Count or cost?</strong> A count Pareto shows what happens most often. A
          cost Pareto shows what hurts most. They often disagree: a rare defect that&apos;s only caught at final test
          can cost more than a common one fixed in seconds at the bench. When you have the cost, look at both before
          picking what to fix.
        </p>
        <p>
          <strong className="text-fd-foreground">Why &ldquo;Other&rdquo; goes last.</strong> &ldquo;Other&rdquo; is a
          bucket of small causes, not a cause you can fix, so it&apos;s ranked last whatever its size. If it&apos;s big
          enough to be in the vital few, split it into real categories first.
        </p>
        <p>
          Building it in Power BI? The{' '}
          <Link href="/tutorials/build-a-pareto-chart-dashboard" className="text-fd-primary hover:underline">
            Pareto chart tutorial
          </Link>{' '}
          builds this example step by step from a 200-row defect log: the rank that breaks ties, the cumulative %
          measure, sorting the axis, and the count-versus-cost comparison.
        </p>
        <p>
          More quality tools: the{' '}
          <Link href="/tools/control-chart-builder" className="text-fd-primary hover:underline">
            Control Chart Builder
          </Link>{' '}
          and the{' '}
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
