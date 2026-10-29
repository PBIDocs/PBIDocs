import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Changelog',
  description: "What's new and changed in the PBIDocs Power BI content.",
  alternates: {
    canonical: '/changelog',
  },
};

const changelog: { date: string; entries: ReactNode[] }[] = [
  {
    date: '2026-10-29',
    entries: [
      <>
        Diagram 26: <Link href="/docs/dax-patterns/running-total">Running Total</Link>. A staircase
        grid shows which dates FILTER(ALL(...)) keeps for every row of the visual, why MAX() still
        returns the current row&apos;s date, and how adding a Year condition makes the total restart
        each January.
      </>,
      <>
        Diagram 27: <Link href="/docs/dax-patterns/percent-of-total">Percent of Total</Link>. One
        numerator against three denominators (ALL, ALLEXCEPT, and none at all), with the matrix
        visual each one produces, so the every-row-shows-100% mistake is visible at a glance.
      </>,
      <>
        Diagram 28: <Link href="/docs/governance/rls-matrix">RLS Role Matrix</Link>. Four roles
        against one model, showing which tables each role&apos;s filter reaches, which it can&apos;t
        (filters don&apos;t flow back up a relationship), and why a documented full-access role
        and a forgotten one look identical in Power BI.
      </>,
      <>
        Diagram 29: <Link href="/docs/dax/variables">Variables</Link>. A variable is computed once,
        where it&apos;s declared, and stored as a value, so wrapping it in CALCULATE() later quietly
        changes nothing. Added that mistake to the page too.
      </>,
    ],
  },
  {
    date: '2026-10-26 – 2026-10-28',
    entries: [
      <>
        Eleven more anatomy diagrams, bringing the total to 22, focused on how DAX evaluates
        filters and iterations:{' '}
        <Link href="/docs/dax/calculate">CALCULATE()</Link> (filter context before and after, plus
        a second diagram for context transition), <Link href="/docs/dax/sumx">SUMX()</Link>,{' '}
        <Link href="/docs/dax/filter">FILTER()</Link>,{' '}
        <Link href="/docs/dax/filter-functions">ALL(), ALLEXCEPT() &amp; REMOVEFILTERS()</Link>,{' '}
        <Link href="/docs/dax/rankx">RANKX()</Link>, and one for every systems-engineering
        pattern: <Link href="/docs/dax-patterns/evm-metrics">EVM Metrics</Link>, a{' '}
        <Link href="/docs/dax-patterns/risk-score-heat-map">Risk Score &amp; Heat Map</Link> 5×5
        matrix, <Link href="/docs/dax-patterns/fmea-rpn-scoring">FMEA &amp; RPN Scoring</Link>{' '}
        (the severity override that catches a dangerous failure mode with the lowest RPN on the
        register), a failure timeline for{' '}
        <Link href="/docs/dax-patterns/reliability-mtbf-mttr">MTBF, MTTR &amp; Availability</Link>,
        and a requirements-to-tests matrix for{' '}
        <Link href="/docs/dax-patterns/coverage-verification">Coverage &amp; Verification</Link>.
        All five use the same datasets as their tutorials (
        <Link href="/tutorials/build-an-evm-dashboard">EVM dashboard</Link>,{' '}
        <Link href="/tutorials/build-a-risk-register-dashboard">risk register</Link>,{' '}
        <Link href="/tutorials/build-an-fmea-dashboard">FMEA dashboard</Link>,{' '}
        <Link href="/tutorials/build-a-reliability-mtbf-mttr-dashboard">reliability dashboard</Link>,{' '}
        <Link href="/tutorials/build-a-requirements-traceability-matrix">traceability matrix</Link>) so
        every number matches.
      </>,
      <>
        Three more, bringing the total to 25: <Link href="/docs/power-query/merge-queries">Merge
        Queries</Link> (the nested table column, and how a duplicate key silently inflates a total
        on expand), <Link href="/docs/power-query/table-pivot-unpivot">Unpivot</Link> (headers
        becoming values, and nulls dropping out), and{' '}
        <Link href="/docs/dax/time-intelligence">Time Intelligence</Link> (the exact months
        DATESYTD, SAMEPERIODLASTYEAR, DATEADD, and DATESINPERIOD each hand to CALCULATE).
      </>,
      <>
        Fixed a misleading example on <Link href="/docs/dax/row-context">Row Context</Link>: a
        fact-table calculated column dividing by <code>[Total Sales]</code> was presented as context
        transition working correctly, when it actually returns about 100% on every row. The
        section now explains why, and shows the correct form.
      </>,
    ],
  },
  {
    date: '2026-10-24 – 2026-10-25',
    entries: [
      <>
        Took anatomy diagrams beyond single functions into data modeling, with six more:{' '}
        <Link href="/docs/modeling/relationships">Relationships</Link>,{' '}
        <Link href="/docs/modeling/bridge-tables">Bridge Tables</Link>,{' '}
        <Link href="/docs/modeling/many-to-many">Many-to-Many</Link>,{' '}
        <Link href="/docs/modeling/slowly-changing-dimensions">Slowly Changing Dimensions</Link>,{' '}
        <Link href="/docs/modeling/storage-modes">Composite Models</Link>, and{' '}
        <Link href="/docs/modeling/aggregations">Aggregations</Link>.
      </>,
      <>
        Redesigned the homepage to embed a working DIVIDE() playground, with one-click presets,
        and the full LOOKUPVALUE() anatomy diagram directly, instead of only linking to them.
      </>,
      <>
        Added a{' '}
        <Link href="/blog/power-bi-desktop-keyboard-shortcuts-cheat-sheet">
          Power BI Desktop Keyboard Shortcuts Cheat Sheet
        </Link>{' '}
        — DAX formula bar editing, report canvas, and table/matrix navigation shortcuts, verified
        against Microsoft&apos;s own documentation.
      </>,
    ],
  },
  {
    date: '2026-10-21 – 2026-10-23',
    entries: [
      <>
        Introduced a new visual format: &quot;function anatomy&quot; diagrams that break a
        function down into numbered, color-coded pieces tied to a worked example. Replaced the
        old ASCII <Link href="/docs/modeling/star-schema">Star Schema</Link> diagram with a real
        SVG version, then shipped four more, each using a shape matched to how that function
        actually evaluates:{' '}
        <Link href="/docs/dax/lookupvalue">LOOKUPVALUE()</Link>,{' '}
        <Link href="/docs/dax/switch">SWITCH()</Link>,{' '}
        <Link href="/docs/dax/related">RELATED()</Link>, and{' '}
        <Link href="/docs/power-query/table-selectrows">Table.SelectRows()</Link>. Surfaced on
        the homepage as a second way to learn, alongside the live playgrounds.
      </>,
      <>
        Added an <Link href="/docs/power-query/m-language">M Case Sensitivity</Link> playground —
        bringing the live playground count to 75 — and fixed a real bug along the way: two
        existing playgrounds had been miscategorized since they were added, so the playground
        browser&apos;s DAX / Power Query M filter was showing and hiding them incorrectly.
      </>,
    ],
  },
  {
    date: '2026-10-17 – 2026-10-20',
    entries: [
      <>
        Added a dedicated <Link href="/docs/dax/calculatetable">CALCULATETABLE()</Link> page and
        nine more playgrounds, several of which caught real bugs while being built:{' '}
        <Link href="/docs/dax/time-intelligence">Running Totals</Link>,{' '}
        <Link href="/docs/power-query/table-transformcolumntypes">
          Table.TransformColumnTypes() vs. Table.TransformColumns()
        </Link>
        ,{' '}
        <Link href="/docs/power-query/custom-functions">Recursive Functions (Factorial)</Link>,{' '}
        <Link href="/docs/power-query/merge-vs-append">Merge vs. Append</Link> (fixed a silent
        column-name collision bug), <Link href="/docs/dax/measures">Measure Dependencies</Link>,{' '}
        <Link href="/docs/dax/user-defined-functions">UDF val vs. expr parameters</Link>,{' '}
        <Link href="/docs/power-query/query-folding">Query Folding order</Link>, and{' '}
        <Link href="/docs/power-query/table-buffer">Table.Buffer()</Link>.
      </>,
    ],
  },
  {
    date: '2026-10-03 – 2026-10-08',
    entries: [
      <>
        Added real, downloadable <code>.csv</code> sample data for all 6 tutorials, verified
        byte-for-byte against each tutorial&apos;s own source data.
      </>,
      <>
        Added three blog posts:{' '}
        <Link href="/blog/direct-active-relationship-ambiguity-error">
          Direct/Active Relationship Ambiguity Error
        </Link>
        ,{' '}
        <Link href="/blog/systems-engineering-dax-patterns-cheat-sheet">
          Systems Engineering DAX Patterns Cheat Sheet
        </Link>
        , and{' '}
        <Link href="/blog/visual-has-exceeded-available-resources-error">
          &quot;Visual Has Exceeded the Available Resources&quot;
        </Link>
        .
      </>,
      <>
        Added <Link href="/docs/power-query/list-accumulate">List.Transform() vs. Table.AddColumn()</Link>,{' '}
        <Link href="/docs/dax/calculated-tables">Calculated Tables</Link> (refresh-time vs.
        live-measure behavior), and{' '}
        <Link href="/docs/dax/filter-context">Filter Context</Link> (cross-filtering between
        visuals) playgrounds.
      </>,
    ],
  },
  {
    date: '2026-09-26 – 2026-09-29',
    entries: [
      <>
        Added a <Link href="/tutorials/build-an-fmea-dashboard">
          Build an FMEA Dashboard
        </Link>{' '}
        tutorial with its matching{' '}
        <Link href="/docs/dax-patterns/fmea-rpn-scoring">FMEA / RPN Scoring</Link> pattern
        reference, all RPN math verified independently before shipping.
      </>,
      <>
        Added <Link href="/docs/power-query/list-accumulate">List.Accumulate()</Link>,{' '}
        <Link href="/docs/power-query/list-generate">List.Generate()</Link> (an off-by-one
        boundary condition), and two DAX playgrounds for{' '}
        <Link href="/docs/dax/countrows">COUNTX()</Link> and sorting a column by another column.
      </>,
    ],
  },
  {
    date: '2026-09-12 – 2026-09-24',
    entries: [
      <>
        Added a <Link href="/blog/dax-text-functions-cheat-sheet">
          DAX Text Functions Cheat Sheet
        </Link>{' '}
        and two error-message posts:{' '}
        <Link href="/blog/table-of-multiple-values-supplied-error">
          A Table of Multiple Values Was Supplied
        </Link>{' '}
        and{' '}
        <Link href="/blog/calculate-true-false-expression-error">
          CALCULATE Used in a True/False Expression
        </Link>
        .
      </>,
      <>
        Added around 15 more playgrounds across DAX and Power Query, including{' '}
        <Link href="/docs/dax/rankx">RANKX() Skip vs. Dense ranking</Link>,{' '}
        <Link href="/docs/dax/userelationship">USERELATIONSHIP()</Link>,{' '}
        <Link href="/docs/dax/lookupvalue">LOOKUPVALUE()</Link>,{' '}
        <Link href="/docs/dax/related">RELATEDTABLE()</Link>,{' '}
        <Link href="/docs/power-query/table-replacevalue">Table.ReplaceValue()</Link>,{' '}
        <Link href="/docs/dax/distinctcount">
          DISTINCTCOUNT() vs. DISTINCTCOUNTNOBLANK()
        </Link>
        ,{' '}
        <Link href="/docs/dax/countrows">COUNTROWS() vs. COUNT() vs. COUNTA()</Link>,{' '}
        <Link href="/docs/dax/sumx">SUMX()</Link>,{' '}
        <Link href="/docs/dax/selectedvalue">SELECTEDVALUE()</Link>,{' '}
        <Link href="/docs/power-query/table-selectrows">Table.SelectRows()</Link>,{' '}
        <Link href="/docs/power-query/table-addcolumn">
          Table.AddColumn() vs. Table.TransformColumns()
        </Link>
        , <Link href="/docs/dax/earlier">EARLIER()</Link>, and{' '}
        <Link href="/docs/dax/calculate">CALCULATE() + ALL() + FILTER()</Link>.
      </>,
    ],
  },
  {
    date: '2026-09-05 – 2026-09-11',
    entries: [
      <>
        Added around 10 more playgrounds, including{' '}
        <Link href="/docs/dax/keepfilters">KEEPFILTERS()</Link>,{' '}
        <Link href="/docs/dax/values-distinct">VALUES() vs. DISTINCT()</Link>,{' '}
        <Link href="/docs/dax/addcolumns-selectcolumns">
          ADDCOLUMNS() vs. SELECTCOLUMNS()
        </Link>
        , <Link href="/docs/dax/crossfilter">CROSSFILTER()</Link>,{' '}
        <Link href="/docs/dax/iferror">IFERROR()</Link>,{' '}
        <Link href="/docs/dax/filter-functions">ALL() vs. ALLSELECTED()</Link>,{' '}
        <Link href="/docs/power-query/merge-vs-append">
          Merge Queries join-kind behavior
        </Link>
        , <Link href="/docs/power-query/table-group">Table.Group()</Link>, and{' '}
        <Link href="/docs/power-query/table-pivot-unpivot">
          Unpivot Columns vs. Unpivot Other Columns
        </Link>
        .
      </>,
      <>
        Added tag filtering to the <Link href="/blog">Blog</Link> and search + language
        filtering to the <Link href="/playground">Playground</Link> index.
      </>,
    ],
  },
  {
    date: '2026-09-04 – 2026-09-05',
    entries: [
      <>
        Added four new <Link href="/docs/dax-patterns">DAX Patterns</Link> pages built around real
        systems and program engineering scenarios, each paired with its full tutorial walkthrough:{' '}
        <Link href="/docs/dax-patterns/evm-metrics">Earned Value Management (EVM) Metrics</Link>,{' '}
        <Link href="/docs/dax-patterns/risk-score-heat-map">Risk Score &amp; Heat Map</Link>,{' '}
        <Link href="/docs/dax-patterns/coverage-verification">
          Coverage &amp; Verification (Requirements Traceability)
        </Link>
        , and{' '}
        <Link href="/docs/dax-patterns/reliability-mtbf-mttr">
          Reliability Metrics (MTBF, MTTR &amp; Availability)
        </Link>
        .
      </>,
      <>
        Switched the documentation section to a new layout with a tabbed navbar (Get Started, DAX,
        Power Query, Modeling &amp; Visuals, Service &amp; Governance) for faster jumping between
        topics, and made better use of the screen on wide monitors.
      </>,
    ],
  },
  {
    date: '2026-09-02 – 2026-09-04',
    entries: [
      <>
        Added 10 more interactive &quot;Try it live&quot; playgrounds to the Power Query and DAX
        references, bringing the total to 32 live examples across the site:{' '}
        <Link href="/docs/power-query/datetime-localnow">DateTime.LocalNow()</Link>,{' '}
        <Link href="/docs/power-query/list-distinct-contains">
          List.Distinct() &amp; List.Contains()
        </Link>
        , <Link href="/docs/dax/mid-left-right">LEFT(), RIGHT() &amp; MID()</Link>,{' '}
        <Link href="/docs/dax/blank-vs-zero">BLANK() vs 0</Link>,{' '}
        <Link href="/docs/dax/trim-upper-lower">TRIM(), UPPER() &amp; LOWER()</Link>,{' '}
        <Link href="/docs/dax/datediff">DATEDIFF()</Link>,{' '}
        <Link href="/docs/dax/calendar-calendarauto">
          CALENDAR() vs CALENDARAUTO()
        </Link>
        ,{' '}
        <Link href="/docs/dax/dateadd-parallelperiod">
          DATEADD() vs PARALLELPERIOD()
        </Link>
        , <Link href="/docs/dax/union">UNION(), EXCEPT() &amp; INTERSECT()</Link>, and{' '}
        <Link href="/docs/dax/today-now">
          TODAY() &amp; NOW(): Calculated Column vs Measure Timing
        </Link>
        .
      </>,
    ],
  },
  {
    date: '2026-08-29',
    entries: [
      <>
        Closed a major documentation gap between DAX and Power Query: added 19 full Power Query M
        pages covering table, list, text, and custom functions, error handling, date/duration
        functions, and source connectors — including{' '}
        <Link href="/docs/power-query/custom-functions">Custom Functions</Link>,{' '}
        <Link href="/docs/power-query/table-transformcolumntypes">Table.TransformColumnTypes()</Link>,{' '}
        <Link href="/docs/power-query/list-accumulate">List.Accumulate()</Link>,{' '}
        <Link href="/docs/power-query/error-handling">Error Handling (try...otherwise)</Link>, and{' '}
        <Link href="/docs/power-query/sql-database">Sql.Database()</Link>. Each linked from the{' '}
        <Link href="/docs/power-query/functions">M Function Reference</Link>.
      </>,
      <>
        Added two more error-message posts:{' '}
        <Link href="/blog/too-many-elements-in-enumeration-pivot-error">
          There Were Too Many Elements in the Enumeration
        </Link>{' '}
        (a Table.Pivot duplicate-key error) and{' '}
        <Link href="/blog/cannot-convert-null-to-type-table-error">
          We Cannot Convert the Value Null to Type Table
        </Link>
        .
      </>,
      <>
        Added a dedicated <Link href="/pricing">Pricing</Link> page for the DAX Formula Builder and
        Ask AI Pro tier, linked from the main navigation.
      </>,
    ],
  },
  {
    date: '2026-08-27 – 2026-08-28',
    entries: [
      <>
        Added four more Power Query pages closing the biggest remaining gaps:{' '}
        <Link href="/docs/power-query/table-selectrows">Table.SelectRows()</Link>,{' '}
        <Link href="/docs/power-query/table-addcolumn">Table.AddColumn()</Link>,{' '}
        <Link href="/docs/power-query/table-pivot-unpivot">
          Table.Pivot() &amp; Table.Unpivot()
        </Link>
        , and <Link href="/docs/power-query/merge-vs-append">Merge vs. Append</Link>.
      </>,
      <>
        Added six more error-message blog posts, continuing the pattern of titling posts after the
        literal error text:{' '}
        <Link href="/blog/web-contents-literal-string-parameter-error">
          Web.Contents Can Only Accept a Literal String
        </Link>
        ,{' '}
        <Link href="/blog/not-enough-memory-power-bi-desktop">
          There Isn&apos;t Enough Memory to Complete This Operation
        </Link>
        , <Link href="/blog/ole-db-odbc-connection-error">OLE DB or ODBC Error</Link>, and{' '}
        <Link href="/blog/dax-comparison-operations-do-not-support-error">
          DAX Comparison Operations Do Not Support...
        </Link>
        .
      </>,
    ],
  },
  {
    date: '2026-08-26',
    entries: [
      <>
        Launched <strong>Ask AI</strong> — a page-scoped AI chat panel on every documentation page,
        free up to 5 questions a day.
      </>,
    ],
  },
  {
    date: '2026-08-24 – 2026-08-25',
    entries: [
      <>
        Launched the{' '}
        <Link href="/tools/dax-formula-builder">DAX Formula Builder</Link> — describe a
        calculation or transformation in plain English and get back a real DAX measure or Power
        Query M step, free up to 5 requests a day.
      </>,
      <>
        Added <Link href="/docs/dax/user-defined-functions">DAX User-Defined Functions (UDFs)</Link>,{' '}
        <Link href="/docs/dax/divide">DIVIDE</Link>, <Link href="/docs/dax/if">IF</Link>,{' '}
        <Link href="/docs/dax/sumx">SUMX</Link>,{' '}
        <Link href="/docs/dax/countrows">COUNTROWS</Link>,{' '}
        <Link href="/docs/dax/distinctcount">DISTINCTCOUNT</Link>, and{' '}
        <Link href="/docs/dax/earlier">EARLIER</Link>.
      </>,
      <>
        Added two new tutorials:{' '}
        <Link href="/tutorials/build-a-risk-register-dashboard">
          Build a Risk Register Dashboard
        </Link>{' '}
        and{' '}
        <Link href="/tutorials/build-a-reliability-mtbf-mttr-dashboard">
          Build a Reliability (MTBF/MTTR) Dashboard
        </Link>
        .
      </>,
    ],
  },
  {
    date: '2026-08-11',
    entries: [
      <>
        Added a <Link href="/docs/dax/functions">DAX Function Reference</Link> — a categorized
        index of common DAX functions, linking to the full explanations where available.
      </>,
      <>
        Launched the <Link href="/blog">Blog</Link> — practical fixes and cheat sheets, starting
        with{' '}
        <Link href="/blog/fix-circular-dependency-dax">Fix a Circular Dependency in DAX</Link>,{' '}
        <Link href="/blog/power-query-expression-error-field-not-found">
          Power Query&apos;s &quot;field wasn&apos;t found&quot; error
        </Link>
        , and a{' '}
        <Link href="/blog/dax-time-intelligence-cheat-sheet">
          DAX Time Intelligence Cheat Sheet
        </Link>
        .
      </>,
    ],
  },
  {
    date: '2026-08-10',
    entries: [
      <>
        Built out the <Link href="/docs/fabric/introduction">Microsoft Fabric</Link> section:{' '}
        <Link href="/docs/fabric/onelake">OneLake</Link>,{' '}
        <Link href="/docs/fabric/lakehouse">Lakehouse</Link>,{' '}
        <Link href="/docs/fabric/data-warehouse">Data Warehouse</Link>,{' '}
        <Link href="/docs/fabric/data-factory">Data Factory</Link>,{' '}
        <Link href="/docs/fabric/direct-lake">Direct Lake Mode</Link>, and{' '}
        <Link href="/docs/fabric/capacity">Fabric Capacity &amp; Cost Management</Link>.
      </>,
      <>
        Added <Link href="/docs/dax/related">RELATED &amp; RELATEDTABLE</Link>,{' '}
        <Link href="/docs/dax/lookupvalue">LOOKUPVALUE</Link>,{' '}
        <Link href="/docs/dax/selectedvalue">SELECTEDVALUE</Link>,{' '}
        <Link href="/docs/dax/switch">SWITCH</Link>, <Link href="/docs/dax/rankx">RANKX</Link>,{' '}
        <Link href="/docs/dax/topn">TOPN</Link>,{' '}
        <Link href="/docs/dax/summarize">SUMMARIZE</Link>,{' '}
        <Link href="/docs/dax/userelationship">USERELATIONSHIP</Link>, and{' '}
        <Link href="/docs/dax/performance">Performance Optimization</Link>.
      </>,
      <>
        Filled in several placeholder pages that had little or no real content, across{' '}
        <Link href="/docs/modeling/bridge-tables">Modeling</Link>,{' '}
        <Link href="/docs/power-query/editor">Power Query</Link>, and{' '}
        <Link href="/docs/ai-power-bi/dax-with-ai">AI-Assisted Power BI</Link>.
      </>,
      <>
        Added worked <Link href="/docs/power-query/editor">Advanced Editor</Link> examples: error
        handling with <code>try...otherwise</code>, and what a UI-built merge actually generates.
      </>,
      <>
        Fixed 11 broken internal links and wired two pages that existed but weren&apos;t
        reachable from navigation back into the site.
      </>,
    ],
  },
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
