import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Hash, Sparkles, TrendingUp, type LucideIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Power BI Tools',
  description:
    'Free Power BI tools: generate DAX measures from plain English, build a date table, write time intelligence measures, and create custom format strings.',
  alternates: {
    canonical: '/tools',
  },
};

const tools: { href: string; title: string; description: string; badge: string; icon: LucideIcon }[] = [
  {
    href: '/tools/dax-formula-builder',
    title: 'DAX Formula Builder',
    description:
      'Describe a calculation in plain English and get a working DAX measure or Power Query M step, with an explanation of every function it uses.',
    badge: 'AI · 5 free a day',
    icon: Sparkles,
  },
  {
    href: '/tools/date-table-generator',
    title: 'Date Table Generator',
    description:
      'A complete date table in DAX or Power Query M, with fiscal years, ISO weeks, day-of-week, and relative-date columns, plus a row preview.',
    badge: 'Free · unlimited',
    icon: CalendarDays,
  },
  {
    href: '/tools/time-intelligence-generator',
    title: 'Time Intelligence Generator',
    description:
      'YTD, prior year, YoY %, rolling 12 months, and running totals for any measure, as separate measures or one calculation group.',
    badge: 'Free · unlimited',
    icon: TrendingUp,
  },
  {
    href: '/tools/format-string-builder',
    title: 'Format String Builder',
    description:
      'Custom format strings for K, M, and B, currency, percentages, and negatives in parentheses, checked against real values before you paste.',
    badge: 'Free · unlimited',
    icon: Hash,
  },
];

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
