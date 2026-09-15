import type { Metadata } from 'next';
import Link from 'next/link';
import { FlaskConical } from 'lucide-react';
import { PlaygroundBrowser, type PlaygroundEntry } from '@/components/playground-browser';

export const metadata: Metadata = {
  title: 'Interactive Examples',
  description:
    'Every live, editable example on PBIDocs in one place — edit real DAX and Power Query M formulas and see the actual result recalculate, right on the page.',
  alternates: {
    canonical: '/playground',
  },
};

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
  {
    fn: 'MID()',
    href: '/docs/dax/mid-left-right#try-it-live',
    pitch: 'See the same substring need a different start number than Power Query’s Text.Middle().',
  },
  {
    fn: 'ISBLANK() vs = 0',
    href: '/docs/dax/blank-vs-zero#try-it-live',
    pitch: 'Watch BLANK() = 0 come back TRUE while ISBLANK() on that same 0 comes back FALSE.',
  },
  {
    fn: 'TRIM()',
    href: '/docs/dax/trim-upper-lower#try-it-live',
    pitch: 'Watch DAX collapse a double space between words while Power Query leaves it untouched.',
  },
  {
    fn: 'DATEDIFF()',
    href: '/docs/dax/datediff#try-it-live',
    pitch: 'Watch a 1-day gap across January 31st return 1 for MONTH — it counts boundaries, not periods.',
  },
  {
    fn: 'CALENDARAUTO()',
    href: '/docs/dax/calendar-calendarauto#try-it-live',
    pitch: 'Add an unrelated audit-log date column and watch it silently widen your whole date table.',
  },
  {
    fn: 'DATEADD() vs PARALLELPERIOD()',
    href: '/docs/dax/dateadd-parallelperiod#try-it-live',
    pitch: 'Filter to just half a month and watch PARALLELPERIOD grab the whole prior month anyway.',
  },
  {
    fn: 'UNION()',
    href: '/docs/dax/union#try-it-live',
    pitch: 'Swap a table’s column order and watch UNION() silently mix Amount values into the Region column.',
  },
  {
    fn: 'TODAY() / NOW()',
    href: '/docs/dax/today-now#try-it-live',
    pitch: 'Watch a calculated column freeze at last refresh while a measure keeps counting the real days.',
  },
  {
    fn: 'KEEPFILTERS()',
    href: '/docs/dax/keepfilters#try-it-live',
    pitch: 'Watch CALCULATE silently replace your visual filter, then fix it by ANDing instead of overwriting.',
  },
  {
    fn: 'VALUES() vs DISTINCT()',
    href: '/docs/dax/values-distinct#try-it-live',
    pitch: 'Add an orphaned fact row and watch VALUES() grow an extra blank row that DISTINCT() never gets.',
  },
  {
    fn: 'ADDCOLUMNS() vs SELECTCOLUMNS()',
    href: '/docs/dax/addcolumns-selectcolumns#try-it-live',
    pitch: 'Watch SELECTCOLUMNS silently drop every column you didn’t explicitly list back in.',
  },
  {
    fn: 'CROSSFILTER()',
    href: '/docs/dax/crossfilter#try-it-live',
    pitch: 'Filter the fact table and watch it do nothing to the dimension table — until CROSSFILTER lets it.',
  },
  {
    fn: 'IFERROR()',
    href: '/docs/dax/iferror#try-it-live',
    pitch: 'Watch IFERROR catch a real error, then pass a BLANK() straight through untouched.',
  },
  {
    fn: 'ALL() vs ALLSELECTED()',
    href: '/docs/dax/filter-functions#try-it-live',
    pitch: 'Pick a slicer region and watch ALLSELECTED track it while ALL ignores the selection entirely.',
  },
  {
    fn: 'RANKX() — Skip vs Dense',
    href: '/docs/dax/rankx#try-it-live',
    pitch: 'Create a tie and watch Skip jump a rank ahead while Dense keeps counting with no gap.',
  },
  {
    fn: 'TOPN() — Ties at the Cutoff',
    href: '/docs/dax/topn#try-it-live',
    pitch: 'Ask for the Top 3 and watch a tie for last place hand back 4 rows instead.',
  },
  {
    fn: 'USERELATIONSHIP()',
    href: '/docs/dax/userelationship#try-it-live',
    pitch: 'Pick a month and watch Total Sales and Sales by Ship Date disagree on the same fact table.',
  },
  {
    fn: 'LOOKUPVALUE()',
    href: '/docs/dax/lookupvalue#try-it-live',
    pitch: 'Give two matching rows different prices and watch a real error appear, live.',
  },
  {
    fn: 'RELATEDTABLE()',
    href: '/docs/dax/related#try-it-live',
    pitch: 'Switch off the relationship and watch a real order count silently become BLANK().',
  },
  {
    fn: 'DISTINCTCOUNT() vs DISTINCTCOUNTNOBLANK()',
    href: '/docs/dax/distinctcount#try-it-live',
    pitch: 'Clear one cell and watch DISTINCTCOUNT quietly count "nothing" as its own value.',
  },
  {
    fn: 'COUNTROWS() vs COUNT() vs COUNTA()',
    href: '/docs/dax/countrows#try-it-live',
    pitch: 'Type "N/A" into one cell and watch all three functions land on a different number.',
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
    fn: 'Number.From() locale ambiguity',
    href: '/blog/couldnt-convert-to-number-date-error#try-it-live-number',
    pitch: 'Watch "1.234,56" parse into two different numbers depending on the decimal separator.',
  },
  {
    fn: 'error / try',
    href: '/docs/power-query/error-handling#try-it-live-error',
    pitch: 'Raise your own error and watch your exact message come back in [Error][Message].',
  },
  {
    fn: 'Number.ToText()',
    href: '/docs/power-query/number-totext#try-it-live',
    pitch: 'Format 0.5 as "P" and watch it become "50.00%", not "0.50%".',
  },
  {
    fn: 'null = null',
    href: '/docs/power-query/value-type-null#try-it-live',
    pitch: 'See null = null return true in M — unlike SQL, where NULL = NULL is UNKNOWN.',
  },
  {
    fn: 'Table.SelectColumns()',
    href: '/docs/power-query/table-selectcolumns#try-it-live',
    pitch: 'Request a column that doesn’t exist and watch it error — then fix it with MissingField.',
  },
  {
    fn: 'Table.FirstN() vs SelectRows()',
    href: '/docs/power-query/table-firstn-skip#try-it-live',
    pitch: 'Watch FirstN stop at the first non-match and miss a later matching row entirely.',
  },
  {
    fn: 'DateTime.LocalNow()',
    href: '/docs/power-query/datetime-localnow#try-it-live',
    pitch: 'See your own browser’s local time vs UTC, right now — the exact gap a scheduled refresh hits.',
  },
  {
    fn: 'Csv.Document()',
    href: '/docs/power-query/csv-document#try-it-live',
    pitch: 'See the raw Column1/Column2 output before Table.PromoteHeaders ever runs.',
  },
  {
    fn: 'Table.SplitColumn()',
    href: '/docs/power-query/table-splitcolumn-combinecolumns#try-it-live',
    pitch: 'Add a one-word name and watch the missing column fill with null, not an error.',
  },
  {
    fn: 'Table.Sort()',
    href: '/docs/power-query/table-sort#try-it-live',
    pitch: 'Sort 10, 9, 2, 1 as text and watch "10" land right after "1" instead of after "9".',
  },
  {
    fn: 'Table.Distinct()',
    href: '/docs/power-query/table-distinct#try-it-live',
    pitch: 'Dedupe by CustomerID and watch a second email get silently discarded, not merged.',
  },
  {
    fn: 'Table.AddIndexColumn()',
    href: '/docs/power-query/table-addindexcolumn#try-it-live',
    pitch: 'See the default index start at 0, then set initialValue to 1 to fix it.',
  },
  {
    fn: 'List.Distinct() & List.Contains()',
    href: '/docs/power-query/list-distinct-contains#try-it-live',
    pitch: 'Watch "Apple" and "apple" both survive List.Distinct() until you check the comparer box.',
  },
  {
    fn: 'Merge Queries — Join Kinds',
    href: '/docs/power-query/merge-queries#try-it-live',
    pitch: 'Switch from Left Outer to Inner and watch an unmatched customer silently vanish from the result.',
  },
  {
    fn: 'Table.Group()',
    href: '/docs/power-query/table-group#try-it-live',
    pitch: 'Type "bikes" instead of "Bikes" and watch it silently become its own extra group.',
  },
  {
    fn: 'Table.Unpivot() vs UnpivotOtherColumns()',
    href: '/docs/power-query/table-pivot-unpivot#try-it-live',
    pitch: 'Add a new month column and watch a fixed-list unpivot silently leave it behind.',
  },
  {
    fn: 'Table.ReplaceValue()',
    href: '/docs/power-query/table-replacevalue#try-it-live',
    pitch: 'Leave a column off the search list and watch a real "N/A" survive with no warning at all.',
  },
];

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

      <PlaygroundBrowser dax={daxPlaygrounds} powerQuery={powerQueryPlaygrounds} />

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
