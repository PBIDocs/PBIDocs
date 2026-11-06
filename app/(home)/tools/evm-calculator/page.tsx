import type { Metadata } from 'next';
import Link from 'next/link';
import { EvmCalculator } from '@/components/tools/evm-calculator';

export const metadata: Metadata = {
  title: 'Earned Value (EVM) Calculator',
  description:
    'Enter BAC, PV, EV, and AC to get CPI, SPI, cost and schedule variance, EAC, ETC, VAC, and TCPI, with a plain-English status, three EAC methods compared, and the matching DAX measures.',
  alternates: {
    canonical: '/tools/evm-calculator',
  },
};

export default function EvmCalculatorPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">EVM Calculator</h1>
      <p className="mb-10 text-lg text-fd-muted-foreground">
        Four numbers from your status report, and the full earned value picture: cost and schedule
        performance, where the program will land, and how much better the remaining work has to go
        to hit the budget. Then take the same metrics into Power BI as DAX.
      </p>

      <EvmCalculator />

      <div className="mt-14 space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing
          you type is sent anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">One snapshot isn&apos;t a trend.</strong> CPI and
          SPI are most useful tracked period over period, and SPI drifts back toward 1.0 near the
          end of any program as the remaining planned work runs out, even a late one. The{' '}
          <Link href="/tutorials/build-an-evm-dashboard" className="text-fd-primary hover:underline">
            EVM dashboard tutorial
          </Link>{' '}
          builds these as measures over a task list so you can watch them move.
        </p>
        <p>
          For the formulas on their own, see{' '}
          <Link href="/docs/dax-patterns/evm-metrics" className="text-fd-primary hover:underline">
            Earned Value Management (EVM) Metrics
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
