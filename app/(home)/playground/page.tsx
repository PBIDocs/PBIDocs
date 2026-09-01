import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FlaskConical } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Interactive Examples',
  description:
    'Every live, editable example on PBIDocs in one place — edit real DAX and Power Query M formulas and see the actual result recalculate, right on the page.',
  alternates: {
    canonical: '/playground',
  },
};

interface PlaygroundEntry {
  fn: string;
  href: string;
  pitch: string;
}

const daxPlaygrounds: PlaygroundEntry[] = [
  {
    fn: 'DIVIDE()',
    href: '/docs/dax/divide#try-it-live',
    pitch: 'Set the denominator to 0 and watch the fallback trigger instead of an error.',
  },
  {
    fn: 'IF()',
    href: '/docs/dax/if#try-it-live',
    pitch: 'Clear the false result and see the optional third argument actually return BLANK().',
  },
  {
    fn: 'SWITCH(TRUE(), ...)',
    href: '/docs/dax/switch#try-it-live',
    pitch: "Reorder a condition and reproduce the exact shadowing bug the page warns about, yourself.",
  },
];

const powerQueryPlaygrounds: PlaygroundEntry[] = [
  {
    fn: 'Text.Middle()',
    href: '/docs/power-query/text-substring-functions#try-it-live',
    pitch: 'Shift Start by one and watch the zero-indexing off-by-one happen on a live character ruler.',
  },
  {
    fn: 'Text.Split()',
    href: '/docs/power-query/text-split-combine#try-it-live',
    pitch: 'Type two separators back to back and get a real empty-string element, not a skipped one.',
  },
  {
    fn: 'Date.AddMonths()',
    href: '/docs/power-query/date-functions#try-it-live',
    pitch: 'Add a month to January 31st and watch it clamp to February 28th instead of erroring.',
  },
  {
    fn: 'Text.Contains()',
    href: '/docs/power-query/text-contains-replace#try-it-live',
    pitch: 'Flip a case-sensitive false into true with the Comparer.OrdinalIgnoreCase checkbox.',
  },
  {
    fn: 'Text.Trim()',
    href: '/docs/power-query/text-trim-upper-lower#try-it-live',
    pitch: 'Swap in a non-breaking space and see it survive trimming, made visible on a character ruler.',
  },
  {
    fn: 'try ... otherwise',
    href: '/docs/power-query/error-handling#try-it-live',
    pitch: "Type anything that isn't a date and watch the fallback catch it instead of erroring.",
  },
  {
    fn: 'Number.RoundUp() / RoundDown()',
    href: '/docs/power-query/number-functions#try-it-live',
    pitch: 'Round a negative number and see "up" mean away from zero, not toward positive infinity.',
  },
  {
    fn: 'Date.From() locale ambiguity',
    href: '/blog/couldnt-convert-to-number-date-error#try-it-live',
    pitch: 'Watch the same date text silently parse into two different days depending on locale.',
  },
  {
    fn: 'Csv.Document()',
    href: '/docs/power-query/csv-document#try-it-live',
    pitch: 'See the raw Column1/Column2 output before Table.PromoteHeaders ever runs.',
  },
];

function PlaygroundGroup({ title, items }: { title: string; items: PlaygroundEntry[] }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between gap-4 rounded-xl border border-fd-border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-fd-primary/50 hover:bg-fd-accent/50 hover:shadow-md"
          >
            <div>
              <p className="font-mono text-sm font-semibold text-fd-foreground">{item.fn}</p>
              <p className="mt-1 text-sm text-fd-muted-foreground">{item.pitch}</p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-fd-primary" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function PlaygroundIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-fd-primary/10 px-3 py-1 text-xs font-semibold text-fd-primary">
        <FlaskConical className="size-3.5" />
        Interactive Examples
      </span>
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Stop reading examples. Try them.</h1>
      <p className="mb-12 text-lg text-fd-muted-foreground">
        Most Power BI references show you a formula and a result and leave it at that. On the
        function pages below, you can edit the numbers yourself and watch the actual result
        recalculate — right on the page, no Excel, no upload, unlimited use.
      </p>

      <div className="flex flex-col gap-12">
        <PlaygroundGroup title="DAX" items={daxPlaygrounds} />
        <PlaygroundGroup title="Power Query M" items={powerQueryPlaygrounds} />
      </div>

      <p className="mt-12 text-sm text-fd-muted-foreground">
        More on the way — see the{' '}
        <Link href="/changelog" className="text-fd-primary hover:underline">
          changelog
        </Link>{' '}
        for what&apos;s new, or browse the full{' '}
        <Link href="/docs" className="text-fd-primary hover:underline">
          documentation
        </Link>
        .
      </p>
    </div>
  );
}
