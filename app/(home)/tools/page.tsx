import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { tools } from '@/lib/tools';

export const metadata: Metadata = {
  title: 'Power BI Tools',
  description:
    'Free Power BI tools: generate DAX measures from plain English, build a date table, write time intelligence measures, create custom format strings, calculate earned value (EVM) and reliability (MTBF/MTTR) metrics, and build a 5×5 risk matrix.',
  alternates: {
    canonical: '/tools',
  },
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Power BI Tools</h1>
      <p className="mb-10 max-w-2xl text-lg text-fd-muted-foreground">
        Generators for the parts of a Power BI model you end up writing over and over. Pick your
        options, check the preview, and paste the result into your model.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex flex-col gap-3 rounded-xl border border-fd-border p-5 transition-colors hover:border-fd-primary/50 hover:bg-fd-accent/50"
          >
            <div className="flex items-center justify-between gap-3">
              <tool.icon className="size-5 text-fd-primary" />
              <span className="rounded-full bg-fd-secondary px-2.5 py-0.5 text-xs font-medium text-fd-muted-foreground">
                {tool.badge}
              </span>
            </div>
            <h2 className="text-lg font-semibold transition-colors group-hover:text-fd-primary">{tool.title}</h2>
            <p className="flex-1 text-sm text-fd-muted-foreground">{tool.description}</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary">
              Open
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-sm text-fd-muted-foreground">
        Looking to see how a function behaves rather than generate one? The{' '}
        <Link href="/playground" className="text-fd-primary hover:underline">
          interactive examples
        </Link>{' '}
        let you change the inputs to DAX and Power Query functions and watch the results update.
      </p>
    </div>
  );
}
