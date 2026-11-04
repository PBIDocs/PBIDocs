import type { Metadata } from 'next';
import Link from 'next/link';
import { RiskMatrixBuilder } from '@/components/tools/risk-matrix-builder';

export const metadata: Metadata = {
  title: 'Risk Matrix Builder (5×5 Heat Map)',
  description:
    'Paste a risk list with likelihood and impact ratings to get a 5×5 risk heat map, scores, Critical/High/Medium/Low bands you can adjust, a ranked list, and the DAX for a Power BI risk matrix.',
  alternates: {
    canonical: '/tools/risk-matrix-builder',
  },
};

export default function RiskMatrixBuilderPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Risk Matrix Builder</h1>
      <p className="mb-10 max-w-3xl text-lg text-fd-muted-foreground">
        Paste your risk register, set where Critical, High, and Medium start, and see every risk
        on a 5×5 heat map and in ranked order. Then take the same scoring into Power BI, including
        the cell colors for the matrix visual.
      </p>

      <RiskMatrixBuilder />

      <div className="mt-14 max-w-3xl space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing
          you paste is sent anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">A score is for sorting, not measuring.</strong>{' '}
          Likelihood and impact are ordinal ratings, so a 12 isn&apos;t &ldquo;twice as risky&rdquo;
          as a 6, and a 4×2 and a 2×4 score the same while calling for different responses. Use the
          bands to decide what gets attention first, and read the ratings themselves before deciding
          what to do.
        </p>
        <p>
          The{' '}
          <Link href="/tutorials/build-a-risk-register-dashboard" className="text-fd-primary hover:underline">
            risk register tutorial
          </Link>{' '}
          builds this in Power BI from a register with assessment history, and{' '}
          <Link href="/docs/dax-patterns/risk-score-heat-map" className="text-fd-primary hover:underline">
            Risk Score &amp; Heat Map
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
