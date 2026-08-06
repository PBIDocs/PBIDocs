import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Changelog',
  description: "What's new and changed in the PBIDocs Power BI content.",
};

const changelog: { date: string; entries: ReactNode[] }[] = [
  {
    date: '2026-08-06',
    entries: [
      <>
        Added <Link href="/docs/fabric/introduction">Microsoft Fabric</Link> — OneLake, core
        workloads (Lakehouse, Warehouse, Data Factory, Real-Time Intelligence), and how Direct
        Lake connects Power BI to Fabric data.
      </>,
      <>
        Added a <Link href="/docs">documentation landing page</Link> at <code>/docs</code>, which
        previously had no page of its own.
      </>,
      <>
        Added a <Link href="/docs/governance/rls-matrix">Governance</Link> section —{' '}
        <Link href="/docs/governance/rls-matrix">RLS Role Matrix</Link>,{' '}
        <Link href="/docs/governance/gateway-refresh">Gateway &amp; Refresh Architecture</Link>,
        and <Link href="/docs/governance/report-themes">Report Theme JSON Files</Link>.
      </>,
    ],
  },
  {
    date: '2026-08-05',
    entries: [
      <>
        Added <Link href="/docs/power-bi-service/dataflows">Dataflows</Link>,{' '}
        <Link href="/docs/power-bi-service/deployment-pipelines">Deployment Pipelines</Link>,{' '}
        <Link href="/docs/visuals/field-parameters">Field Parameters</Link>, and{' '}
        <Link href="/docs/modeling/aggregations">Aggregations</Link>.
      </>,
      <>
        Added <Link href="/docs/modeling/composite-models">Composite Models</Link> — combining
        multiple data sources in one model, cross-source relationships, and query performance.
      </>,
    ],
  },
  {
    date: '2026-08-04',
    entries: [
      <>
        Added <Link href="/docs/power-bi-service/security">Row-Level Security</Link> — static vs.
        dynamic RLS, <code>USERPRINCIPALNAME()</code>-based dynamic security, and common mistakes.
      </>,
      <>
        Added <Link href="/docs/modeling/storage-modes">DirectQuery vs. Import</Link> — storage
        modes, composite models, and when to use each.
      </>,
      <>
        Added <Link href="/docs/visuals/bookmarks">Bookmarks &amp; Interactivity</Link> —
        bookmarks, drill-through, and report page tooltips.
      </>,
      <>
        Added the remaining Power BI Service pages:{' '}
        <Link href="/docs/power-bi-service/workspaces">Workspaces</Link>,{' '}
        <Link href="/docs/power-bi-service/dashboards">Dashboards</Link>,{' '}
        <Link href="/docs/power-bi-service/refresh">Refresh</Link>.
      </>,
      <>
        Added the remaining Visuals pages: <Link href="/docs/visuals/charts">Charts</Link>,{' '}
        <Link href="/docs/visuals/tables">Tables</Link>,{' '}
        <Link href="/docs/visuals/slicers">Slicers</Link>,{' '}
        <Link href="/docs/visuals/formatting">Formatting</Link>.
      </>,
      <>
        Added the remaining DAX Patterns pages:{' '}
        <Link href="/docs/dax-patterns/totals">Totals</Link>,{' '}
        <Link href="/docs/dax-patterns/ranking">Ranking</Link>,{' '}
        <Link href="/docs/dax-patterns/percent-of-total">Percent of Total</Link>,{' '}
        <Link href="/docs/dax-patterns/running-total">Running Total</Link>.
      </>,
      <>
        Added <Link href="/docs/dax/calculated-tables">Calculated Tables</Link>, the remaining
        Power Query pages (<Link href="/docs/power-query/introduction">Introduction</Link>,{' '}
        <Link href="/docs/power-query/transformations">Transformations</Link>,{' '}
        <Link href="/docs/power-query/query-folding">Query Folding</Link>), and the remaining
        Getting Started pages (
        <Link href="/docs/getting-started/installation">Installation</Link>,{' '}
        <Link href="/docs/getting-started/power-bi-overview">Power BI Overview</Link>).
      </>,
      <>
        Fixed several DAX and Power Query code examples that were mislabeled as SQL, which gave
        them incorrect syntax highlighting.
      </>,
    ],
  },
  {
    date: '2026-08-03',
    entries: [
      <>
        Fixed garbled characters (arrows, em dashes, checkmarks) across 9 pages, left behind by a
        prior encoding issue.
      </>,
      <>Fixed stray leftover text and formatting issues in the Power Query content.</>,
    ],
  },
  {
    date: '2026-07-31 – 2026-08-02',
    entries: [
      <>
        Added <Link href="/docs/dax/iterator">Iterator Functions (X Functions)</Link> and{' '}
        <Link href="/docs/dax/variables">Variables (VAR)</Link>.
      </>,
      <>
        Updated <Link href="/docs/dax/time-intelligence">Time Intelligence</Link> content and
        fixed frontmatter formatting issues.
      </>,
    ],
  },
  {
    date: '2026-07-30',
    entries: [<>Initial launch of the PBIDocs Power BI documentation site.</>],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-3">Changelog</h1>
      <p className="text-lg text-fd-muted-foreground mb-16">
        A running record of meaningful additions and fixes to the Power BI content on this site.
        Site design, theming, and infrastructure changes aren&apos;t tracked here.
      </p>

      <div className="changelog-entries relative space-y-14">
        <div
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[5px] w-px bg-fd-border"
        />
        {changelog.map((group) => (
          <section key={group.date} className="relative pl-8">
            <span className="absolute left-0 top-1.5 size-2.5 rounded-full bg-fd-primary ring-4 ring-fd-background" />
            <h2 className="text-sm font-semibold text-fd-muted-foreground tracking-wide mb-4">
              {group.date}
            </h2>
            <ul className="space-y-3">
              {group.entries.map((entry, i) => (
                <li key={i} className="flex gap-2.5 leading-relaxed">
                  <span className="text-fd-muted-foreground/60 select-none">–</span>
                  <span>{entry}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
