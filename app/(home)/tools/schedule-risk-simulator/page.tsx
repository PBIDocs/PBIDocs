import type { Metadata } from 'next';
import Link from 'next/link';
import { ScheduleRiskSimulator } from '@/components/tools/schedule-risk-simulator';

export const metadata: Metadata = {
  title: 'Monte Carlo Schedule Risk Simulator',
  description:
    'Paste tasks with optimistic, most likely, and pessimistic durations and their predecessors to simulate the finish date: an S-curve, P50/P80/P90 dates, the chance of hitting a target, task criticality, and the DAX to chart it in Power BI.',
  alternates: {
    canonical: '/tools/schedule-risk-simulator',
  },
};

export default function ScheduleRiskSimulatorPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Schedule Risk Simulator</h1>
      <p className="mb-10 max-w-3xl text-lg text-fd-muted-foreground">
        Give each task a best case, a most-likely case, and a worst case, and a Monte Carlo simulation
        runs the schedule thousands of times to show how likely each finish date really is. Then take
        the runs into Power BI with the DAX for an S-curve and P80 card.
      </p>

      <ScheduleRiskSimulator />

      <div className="mt-14 max-w-3xl space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing you
          paste is sent anywhere. Results use a fixed random seed, so the same inputs give the same
          numbers; <strong className="text-fd-foreground">Re-run</strong> draws a fresh set.
        </p>
        <p>
          <strong className="text-fd-foreground">Why the plan date is usually late.</strong> Two things
          push the simulated finish past the sum of most-likely durations. Estimates are skewed: a task
          can slip much further than it can gain. And wherever parallel paths merge, the next task waits
          for whichever one finishes last, so the merge point inherits the worst of both. That&apos;s
          merge bias, and it&apos;s why the most-likely plan often has well under a 50% chance.
        </p>
        <p>
          <strong className="text-fd-foreground">Beta-PERT or triangular?</strong> Beta-PERT weights the
          most-likely value more heavily, with a mean of (O + 4M + P) / 6. Triangular gives the tails more
          weight and makes a more pessimistic forecast from the same three numbers.
        </p>
        <p>
          SPI from the{' '}
          <Link href="/tutorials/build-an-evm-dashboard" className="text-fd-primary hover:underline">
            EVM dashboard tutorial
          </Link>{' '}
          tells you how far behind a program is today; this tells you how likely each finish is. Try the{' '}
          <Link href="/tools/evm-calculator" className="text-fd-primary hover:underline">
            EVM Calculator
          </Link>{' '}
          for the status side, or browse all the{' '}
          <Link href="/tools" className="text-fd-primary hover:underline">
            Power BI tools
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
