import type { Metadata } from 'next';
import Link from 'next/link';
import { DateTableGenerator } from '@/components/tools/date-table-generator';

export const metadata: Metadata = {
  title: 'Power BI Date Table Generator',
  description:
    'Generate a ready-to-paste Power BI date table in DAX or Power Query M: pick a date range, fiscal year start, week start, and columns, then copy the code and preview the rows.',
  alternates: {
    canonical: '/tools/date-table-generator',
  },
};

export default function DateTableGeneratorPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Date Table Generator</h1>
      <p className="mb-10 text-lg text-fd-muted-foreground">
        Pick a range, a fiscal calendar, and the columns you need. Get a date table you can paste
        straight into Power BI as a DAX calculated table or a Power Query M query, with a preview of
        the rows it produces.
      </p>

      <DateTableGenerator />

      <div className="mt-14 space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing
          you type is sent anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">DAX or Power Query?</strong> Both produce the same
          table. Use Power Query if you want the date table to live with the rest of your data
          preparation or to reuse it across files with a dataflow. Use DAX if you&apos;d rather keep
          it in the model, or if you&apos;re building it from a fact table that only exists after
          load.
        </p>
        <p>
          New to date tables? Start with{' '}
          <Link href="/docs/modeling/date-tables" className="text-fd-primary hover:underline">
            Date Tables
          </Link>
          , then see{' '}
          <Link href="/docs/dax/calendar-calendarauto" className="text-fd-primary hover:underline">
            CALENDAR() vs CALENDARAUTO()
          </Link>{' '}
          for why this generator never uses CALENDARAUTO(), and{' '}
          <Link href="/docs/dax/time-intelligence" className="text-fd-primary hover:underline">
            Time Intelligence
          </Link>{' '}
          for the measures that depend on it.
        </p>
      </div>
    </div>
  );
}
