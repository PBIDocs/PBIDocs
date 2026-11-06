import type { Metadata } from 'next';
import Link from 'next/link';
import { TraceabilityMatrixBuilder } from '@/components/tools/traceability-matrix-builder';

export const metadata: Metadata = {
  title: 'Requirements Traceability Matrix Builder',
  description:
    'Paste requirements, requirement-to-test links, and test results to get a traceability matrix, coverage %, verified %, pass rate, the requirements with no test, and the DAX for a Power BI RTM dashboard.',
  alternates: {
    canonical: '/tools/traceability-matrix-builder',
  },
};

export default function TraceabilityMatrixBuilderPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Traceability Matrix Builder</h1>
      <p className="mb-10 max-w-3xl text-lg text-fd-muted-foreground">
        Paste your requirements, the test cases that verify them, and the test results to get a
        requirements traceability matrix with coverage and verification status, and the list of
        requirements nothing tests. Then take the same measures into Power BI as DAX.
      </p>

      <TraceabilityMatrixBuilder />

      <div className="mt-14 max-w-3xl space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing
          you paste is sent anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">Covered isn&apos;t verified.</strong> A requirement
          is covered as soon as a test case is mapped to it, but it isn&apos;t verified until one of
          those tests has passed. A failed test and a test that hasn&apos;t run are different states
          too, so this tool keeps all four apart: verified, failed, not yet run, and no test mapped.
        </p>
        <p>
          The{' '}
          <Link
            href="/tutorials/build-a-requirements-traceability-matrix"
            className="text-fd-primary hover:underline"
          >
            traceability matrix tutorial
          </Link>{' '}
          builds this in Power BI on a bridge table, and{' '}
          <Link href="/docs/dax-patterns/coverage-verification" className="text-fd-primary hover:underline">
            Coverage &amp; Verification
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
