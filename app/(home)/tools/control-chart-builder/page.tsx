import type { Metadata } from 'next';
import Link from 'next/link';
import { ControlChartBuilder } from '@/components/tools/control-chart-builder';

export const metadata: Metadata = {
  title: 'SPC Control Chart Builder (I-MR, X̄-R, p Chart)',
  description:
    'Paste measurements or defect counts to get an I-MR, X-bar R, or p control chart with UCL and LCL from a baseline, Western Electric rule signals, Cp/Cpk, and the DAX to build the same control chart in Power BI.',
  alternates: {
    canonical: '/tools/control-chart-builder',
  },
};

export default function ControlChartBuilderPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Control Chart Builder</h1>
      <p className="mb-10 max-w-3xl text-lg text-fd-muted-foreground">
        Paste measurements or defect counts to get a statistical process control chart: limits set from a stable
        baseline, the Western Electric rules checked on every new point, and process capability if you have spec
        limits. Then take the same chart into Power BI as DAX.
      </p>

      <ControlChartBuilder />

      <div className="mt-14 max-w-3xl space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing you paste is sent
          anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">Which chart?</strong> Use I-MR when you get one measurement at a time
          (a daily reading, one part per batch). Use X̄-R when you measure a few parts together, say five every hour:
          averaging a subgroup makes small shifts easier to see. Use a p chart when each unit simply passes or fails and
          you count the failures.
        </p>
        <p>
          <strong className="text-fd-foreground">Control limits aren&apos;t spec limits.</strong> Control limits come
          from the process&apos;s own variation and say whether it&apos;s behaving the way it used to. Spec limits come
          from the customer or the drawing and say whether a part is acceptable. A process can be in control and still
          make bad parts, which is what Cpk measures, or out of control while every part is still in spec.
        </p>
        <p>
          <strong className="text-fd-foreground">Why the limits aren&apos;t the standard deviation.</strong> The sigma
          comes from the moving range or the subgroup ranges, not the standard deviation of all the data. Ranges measure
          short-term variation only, so a shift in the middle of the data doesn&apos;t widen the limits and hide itself.
        </p>
        <p>
          Building it in Power BI? The{' '}
          <Link href="/tutorials/build-an-spc-control-chart-dashboard" className="text-fd-primary hover:underline">
            SPC control chart tutorial
          </Link>{' '}
          walks through the I-MR example step by step: the moving range column, baseline limits, the rules measure, and
          Cp/Cpk, with the same numbers this tool shows.
        </p>
        <p>
          More engineering calculators: the{' '}
          <Link href="/tools/reliability-calculator" className="text-fd-primary hover:underline">
            Reliability Calculator
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
