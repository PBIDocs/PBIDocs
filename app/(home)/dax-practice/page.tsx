import type { Metadata } from 'next';
import Link from 'next/link';
import { Dumbbell } from 'lucide-react';
import { DaxPractice, PracticeModel } from '@/components/dax-practice';
import { EXERCISES } from '@/lib/dax-exercises';

export const metadata: Metadata = {
  title: 'DAX Practice Exercises',
  description: `${EXERCISES.length} free DAX exercises with instant answers: filter context, CALCULATE, KEEPFILTERS, time intelligence, and real bugs to fix. Every question runs on one small model you can check by hand, and every answer explains why.`,
  alternates: {
    canonical: '/dax-practice',
  },
};

export default function DaxPracticePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-fd-primary/10 px-3 py-1 text-xs font-semibold text-fd-primary">
        <Dumbbell className="size-3.5" />
        DAX Practice
      </span>
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Do you know what this measure returns?</h1>
      <p className="mb-4 text-lg text-fd-muted-foreground">
        Reading about filter context is one thing. Predicting what a measure shows in a real visual is another, and
        it&apos;s the skill that actually fixes reports. Each exercise gives you a measure, a visual, and three
        answers. Pick one and see why it&apos;s right or wrong.
      </p>
      <p className="mb-10 text-sm text-fd-muted-foreground">
        Free, no sign-up. Your progress is saved in this browser. Want to experiment instead? Try the{' '}
        <Link href="/playground" className="text-fd-primary hover:underline">
          interactive examples
        </Link>
        .
      </p>

      <div className="mb-10">
        <PracticeModel />
      </div>

      <DaxPractice />

      <p className="mt-12 text-sm text-fd-muted-foreground">
        Studying for the exam? The{' '}
        <Link href="/pl-300" className="text-fd-primary hover:underline">
          PL-300 study guide
        </Link>{' '}
        maps every skill to a page and has scenario questions for each area. Got one wrong here? That&apos;s the point. Each answer links to the page that explains it. For the full picture,
        start with{' '}
        <Link href="/docs/dax/filter-context" className="text-fd-primary hover:underline">
          filter context
        </Link>{' '}
        and{' '}
        <Link href="/docs/dax/calculate" className="text-fd-primary hover:underline">
          CALCULATE
        </Link>
        .
      </p>
    </div>
  );
}
