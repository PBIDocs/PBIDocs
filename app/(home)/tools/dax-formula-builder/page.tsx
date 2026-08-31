import type { Metadata } from 'next';
import Link from 'next/link';
import { DaxFormulaBuilder } from '@/components/tools/dax-formula-builder';
import { UpgradeBanner } from '@/components/upgrade-banner';
import { AskAi } from '@/components/ask-ai';

export const metadata: Metadata = {
  title: 'DAX Formula Builder',
  description:
    'Describe a calculation or transformation in plain English and get back a working DAX measure or Power Query M step, with an explanation and a breakdown of every function used.',
  alternates: {
    canonical: '/tools/dax-formula-builder',
  },
};

export default function DaxFormulaBuilderPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">DAX Formula Builder</h1>
      <p className="mb-6 text-lg text-fd-muted-foreground">
        Describe what you want to calculate or transform. Get back a real DAX measure or Power
        Query M step, a plain-English explanation, and a breakdown of every function it uses.
      </p>

      <div className="mb-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-fd-border bg-fd-secondary/40 px-4 py-3 text-sm text-fd-muted-foreground">
        <p>
          Free: 5 requests a day. Need more?{' '}
          <Link href="/pricing" className="underline decoration-dotted hover:text-fd-foreground">
            See pricing
          </Link>
        </p>
        <div className="flex items-center gap-3">
          <AskAi pageTitle="DAX Formula Builder" />
          <UpgradeBanner />
        </div>
      </div>

      <DaxFormulaBuilder />

      <div className="mt-14 space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free to use, up to 5 requests per day. Generated formulas are a starting point — always
          verify them against your own model, since column and table names have to match exactly.
        </p>
        <p>
          Want to understand the DAX behind the results instead of just generating it? Start with{' '}
          <Link href="/docs/dax/measures" className="text-fd-primary hover:underline">
            Measures
          </Link>{' '}
          and{' '}
          <Link href="/docs/dax/variables" className="text-fd-primary hover:underline">
            Variables (VAR)
          </Link>
          , or browse the full{' '}
          <Link href="/docs/dax/functions" className="text-fd-primary hover:underline">
            DAX Function Reference
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
