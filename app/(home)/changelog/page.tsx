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
    date: '2026-11-22',
    entries: [
      <>
        New: <Link href="/docs/dax-patterns/earned-schedule">Earned Schedule</Link>, the time-based extension of
        earned value. One DAX measure finds the date your baseline planned to reach today&apos;s EV; from it come
        SPI(t), schedule variance in days, and a forecast finish date, which keep reporting a delay after money-based
        SPI has drifted back to 1.0. The <Link href="/tutorials/build-an-evm-dashboard#step-6-add-earned-schedule">EVM
        dashboard tutorial</Link> gains a Step 6 (its program is 41 days behind, heading for November 2), and the{' '}
        <Link href="/tools/evm-calculator">EVM Calculator</Link> now takes a cumulative PV baseline and status date
        and works out Earned Schedule for you.
      </>,
      <>
        Accuracy review of all 11 tutorials, the last part of the site-wide review. Six were corrected so they
        match the fixed docs: the <Link href="/tutorials/build-a-requirements-traceability-matrix">traceability
        matrix</Link> now explains why the Priority slicer doesn&apos;t move Pass Rate (and the one-line fix), the{' '}
        <Link href="/tutorials/build-a-fabric-lakehouse-dashboard">Fabric Lakehouse</Link> tutorial reflects
        automatic reframing, and the <Link href="/tutorials/build-a-sales-analysis-report">sales report</Link>{' '}
        tutorial no longer repeats the divide-by-zero myth or overstates what an unmarked date table breaks. EVM and
        reliability tutorials got the same SPI and MTTR corrections as their pattern pages.
      </>,
    ],
  },
  {
    date: '2026-11-21',
    entries: [
      <>
        Accuracy review of the visuals, Fabric, governance, AI, getting-started, Service, and modeling pages (20
        corrected). Biggest fixes: <Link href="/docs/modeling/bridge-tables">bridge tables</Link> need the
        bridge-to-dimension relationship set to Both, and per-row totals adding up to more than the grand total is
        expected, not double-counting; <Link href="/docs/fabric/capacity">Fabric capacity</Link> throttles
        interactive requests first, and F SKUs don&apos;t autoscale; <Link href="/docs/fabric/direct-lake">Direct
        Lake</Link> reframes automatically by default; Free users can view capacity content only on F64 or larger (
        <Link href="/docs/getting-started/power-bi-overview">Power BI Overview</Link>); and Q&amp;A is retiring in
        December 2026. Also: cross-source relationships in composite models are limited relationships, a theme file
        has to be re-imported to update a report, and Report Server needs its own Desktop build.
      </>,
      <>
        Accuracy review of the remaining DAX function and DAX pattern pages (32 pages, 10 corrected). Fixed
        formulas that would fail or mislead:{' '}
        <Link href="/docs/dax-patterns/running-total">Running Total</Link>&apos;s within-year version referenced a
        column FILTER couldn&apos;t see, and its by-rank version showed each product&apos;s own sales;{' '}
        <Link href="/docs/dax/crossfilter">CROSSFILTER</Link>&apos;s direction is <code>ONEWAY</code>, not
        ONEDIRECTION; and <Link href="/docs/dax/today-now">TODAY() - a date</Link> gives a date/time, not a day
        count. Also: DAX <Link href="/docs/dax/union">UNION</Link> keeps duplicates, USERELATIONSHIP can&apos;t be
        used on a table with RLS, plain division by zero returns Infinity on the Totals page too, and clearer
        notes on SPI, MTTR, EARLIER, and DATEDIFF.
      </>,
      <>
        Accuracy review of the Power Query docs (45 pages, 20 corrected). The biggest fix:{' '}
        <Link href="/docs/power-query/number-functions">Number.Round</Link> breaks ties to even by default, so{' '}
        <code>Number.Round(2.5)</code> is 2, and <code>Number.RoundUp(-2.1)</code> is -2, not -3 as in Excel; the
        page and its live example were rewritten, and now include <code>Number.RoundAwayFromZero</code>. Also
        corrected: <Link href="/docs/power-query/text-split-combine">Text.Combine</Link> skips nulls rather than
        erroring, <Link href="/docs/power-query/json-document">Table.FromRecords</Link> errors on a missing field
        unless you pass <code>MissingField.UseNull</code>,{' '}
        <Link href="/docs/power-query/table-pivot-unpivot">Table.Pivot</Link> with duplicates and no aggregation
        raises an error, a renamed sheet raises &quot;key didn&apos;t match any rows&quot; in{' '}
        <Link href="/docs/power-query/excel-workbook">Excel.Workbook</Link>, and a sort before{' '}
        <Link href="/docs/power-query/table-distinct">Table.Distinct</Link> needs Table.Buffer. Smaller fixes to
        Web.Contents, List.Generate, dates, merges, query folding, Sql.Database, and the Editor.
      </>,
    ],
  },
  {
    date: '2026-11-20',
    entries: [
      <>
        Accuracy review of the core docs, part 2: 29 DAX function pages. The biggest correction: dividing by zero
        with <code>/</code> doesn&apos;t raise an error in DAX, it returns Infinity (or NaN), so{' '}
        <Link href="/docs/dax/divide">DIVIDE()</Link> and <Link href="/docs/dax/iferror">IFERROR()</Link> were
        rewritten (IFERROR&apos;s live example now shows all three cases). Also fixed: CALCULATE never returns a
        table (<Link href="/docs/dax/calculatetable">CALCULATETABLE</Link>), DAX text comparison is
        case-insensitive (<Link href="/docs/dax/trim-upper-lower">TRIM, UPPER &amp; LOWER</Link>),{' '}
        <Link href="/docs/dax/related">RELATED</Link> follows a chain of relationships, and smaller fixes to
        FILTER, IF, BLANK vs 0, CALENDARAUTO, COUNTROWS, SUMX, VALUES, KEEPFILTERS, and performance.
      </>,
      <>
        Accuracy review of the core docs, part 1 (15 pages). Corrected{' '}
        <Link href="/docs/power-bi-service/security">Row-Level Security</Link> (readers in no role see no data, not
        all of it; how a mapping table&apos;s filter actually reaches the model),{' '}
        <Link href="/docs/power-bi-service/workspaces">Workspaces</Link> (paginated reports work on Pro),{' '}
        <Link href="/docs/modeling/storage-modes">storage modes</Link> (the 1 GB and 1-million-row limits),
        and smaller fixes to CALCULATE, filter context, row context, relationships, and time intelligence. Sixteen
        core pages also got real titles and descriptions in place of a placeholder.
      </>,
      <>
        Accuracy review of every blog post from August to October. Rewrote five whose diagnosis was wrong:{' '}
        <Link href="/blog/formula-firewall-privacy-level-error">Formula.Firewall</Link> (the &quot;references other
        queries&quot; version is about query structure, not privacy levels),{' '}
        <Link href="/blog/web-contents-literal-string-parameter-error">Web.Contents with a dynamic URL</Link>,{' '}
        <Link href="/blog/cannot-convert-null-to-type-table-error">null to type Table</Link>,{' '}
        <Link href="/blog/calculate-true-false-expression-error">CALCULATE in a True/False expression</Link>, and{' '}
        <Link href="/blog/direct-active-relationship-ambiguity-error">direct active relationship</Link>. Corrected
        sections in eleven more, including single value for column, duplicate values (case and Table.Buffer),
        not enough memory, and the keyboard shortcuts sheet.
      </>,
      <>
        Rewrote <Link href="/blog/key-didnt-match-any-rows-error">The Key Didn&apos;t Match Any Rows in the Table</Link>.
        It&apos;s a Power Query navigation error (a renamed sheet, a moved SharePoint file, a changed schema), not a
        LOOKUPVALUE one as the earlier version said. The genuine LOOKUPVALUE advice moved to a new{' '}
        <Link href="/docs/dax/lookupvalue#when-it-returns-blank-unexpectedly">when it returns blank</Link> section.
      </>,
      <>
        <Link href="/blog/fix-circular-dependency-dax">How to Fix a Circular Dependency Error</Link> now covers the
        two causes people hit most: two calculated columns that both use CALCULATE, and a calculated table built with
        VALUES that&apos;s related back to its source.
      </>,
    ],
  },
  {
    date: '2026-11-19',
    entries: [
      <>
        New blog post: <Link href="/blog/totals-dont-add-up">Power BI Totals Don&apos;t Add Up</Link>, on why the
        total row re-evaluates the measure instead of adding the rows, the two usual causes, when a different
        total is actually right, and the SUMX fix. Also new on the homepage: a block for DAX practice and the PL-300
        guide.
      </>,
      <>
        The <Link href="/dax-practice">DAX practice exercises</Link> grow from 13 to 30, with a new Iterators
        &amp; ranking group (context transition, RANKX, MAXX over month names) and more filter context, time
        intelligence, and fix-the-bug questions.
      </>,
      <>
        New docs page: <Link href="/docs/ai-power-bi/copilot">Copilot in Power BI</Link>, covering what it needs
        (a paid capacity, not just a Pro license), the narrative visual, summarizing a semantic model, and preparing
        a model for it. With it, the <Link href="/pl-300">PL-300 study guide</Link> now covers every skill in the
        exam outline.
      </>,
      <>
        Two new docs pages: <Link href="/docs/dax/quick-measures">Quick Measures</Link>, and{' '}
        <Link href="/docs/power-bi-service/report-delivery">Paginated Reports, Export &amp; Page Refresh</Link>{' '}
        (when a paginated report is the right tool, export settings and row limits, and automatic page refresh for
        DirectQuery).
      </>,
    ],
  },
  {
    date: '2026-11-17',
    entries: [
      <>
        New docs page: <Link href="/docs/visuals/finding-patterns">Finding Patterns</Link>. Explain the
        increase, groups and bins, automatic clusters, forecasts and anomalies, Key Influencers, and the
        Decomposition Tree, with what each needs and where it doesn&apos;t work.
      </>,
      <>
        New docs page:{' '}
        <Link href="/docs/power-bi-service/sharing-and-permissions">Sharing, Permissions &amp; Endorsement</Link>.
        Sharing an item, Read, Build, Reshare, and Write on semantic models (and why Build isn&apos;t a security
        boundary), promoted and certified content, and sensitivity labels.
      </>,
    ],
  },
  {
    date: '2026-11-16',
    entries: [
      <>
        The <Link href="/tools/dax-syntax-checker">DAX Syntax Checker</Link> now formats DAX too: long calls
        split one argument per line, VAR and RETURN on their own lines, comments kept. It runs in the browser, and
        it refuses to change anything except spacing and capitals.
      </>,
    ],
  },
  {
    date: '2026-11-15',
    entries: [
      <>
        New docs page: <Link href="/docs/visuals/report-layout">Report Layout</Link>, covering page settings,
        layering and grouping in the Selection pane, mobile layout, and accessibility (alt text, tab order, and
        color).
      </>,
      <>
        New docs page: <Link href="/docs/power-query/reference-vs-duplicate">Reference vs. Duplicate Queries</Link>,
        with the staging-query pattern for building facts and dimensions from one source, why references
        don&apos;t make refresh run once, and what Enable load and Include in report refresh do.
      </>,
      <>
        New docs page: <Link href="/docs/dax/visual-calculations">Visual Calculations</Link>. RUNNINGSUM,
        MOVINGAVERAGE, PREVIOUS, and COLLAPSEALL worked through on one example, the Axis and Reset parameters, and
        when a measure is still the better choice.
      </>,
      <>
        Two more docs pages: <Link href="/docs/visuals/drillthrough">Drillthrough</Link> (Keep all filters,
        buttons, cross-report, and why the option goes missing) and{' '}
        <Link href="/docs/visuals/tooltips">Report Page Tooltips</Link> (setup, filtering, and why a tooltip shows
        totals).
      </>,
      <>
        Two new docs pages from the PL-300 gaps:{' '}
        <Link href="/docs/dax-patterns/semi-additive">Semi-Additive Measures</Link> (closing, opening, and average
        balances, including snapshots that skip days) and{' '}
        <Link href="/docs/modeling/calculation-groups">Calculation Groups</Link> (one PY, YoY, and YTD for every
        measure, format strings, and the traps).
      </>,
      <>
        New: the <Link href="/pl-300">PL-300 study guide</Link>. Every skill in Microsoft&apos;s current exam
        outline mapped to the page that teaches it, and sixteen scenario practice questions, four per skill area.
      </>,
      <>
        New:{' '}
        <Link href="/dax-practice">DAX practice exercises</Link>. Thirteen questions on one small model, from
        DISTINCTCOUNT to KEEPFILTERS, time intelligence, and real bugs to fix, each answer explained and linked to
        the page that covers it. Also in the More menu.
      </>,
      <>
        New blog post:{' '}
        <Link href="/blog/sort-by-column-more-than-one-value-error">
          Power BI Sort by Column Error: There Can&apos;t Be More Than One Value
        </Link>
        , covering sort keys that include the year, repeating week labels, duplicate names, and a DAX query
        that finds the offending rows.
      </>,
      <>
        New blog post:{' '}
        <Link href="/blog/scheduled-refresh-turned-off">
          Why Power BI Turned Off Your Scheduled Refresh
        </Link>
        , on schedules disabled after four failures or paused for inactivity, how to tell which from the
        refresh history, and how to keep refresh running.
      </>,
      <>
        Three new Power Query error posts:{' '}
        <Link href="/blog/cannot-apply-operator-text-number-error">We Cannot Apply Operator &amp; to Types Text and Number</Link>,{' '}
        <Link href="/blog/cannot-convert-list-to-text-error">We Cannot Convert a Value of Type List to Type Text</Link>, and{' '}
        <Link href="/blog/invalid-cell-value-na-error">DataFormat.Error: Invalid Cell Value &apos;#N/A&apos;</Link>, the type
        errors almost everyone meets in their first week of Power Query.
      </>,
      <>
        New blog post:{' '}
        <Link href="/blog/dynamic-data-source-refresh-error">
          This Dataset Includes a Dynamic Data Source and Won&apos;t Be Refreshed
        </Link>
        , on why the Service can&apos;t refresh a source whose address comes from data, and the fix
        for URLs, API paging, server names from a table, per-row file paths, and custom functions.
      </>,
    ],
  },
  {
    date: '2026-11-13',
    entries: [
      <>
        New blog post:{' '}
        <Link href="/blog/gateway-offline-refresh-error">
          The Gateway Is Either Offline or Could Not Be Reached
        </Link>
        , covering sleeping gateway machines, a stopped gateway service, blocked ports, out-of-date
        gateways, and why a second cluster member is the real fix.
      </>,
      <>
        Launched <Link href="/tools/weibull-analysis">Weibull Analysis</Link>: paste failure and
        running-unit hours for the shape β, scale η, B10 life, reliability at a replacement interval,
        a Weibull probability plot, and the DAX. The new tutorial{' '}
        <Link href="/tutorials/build-a-weibull-reliability-dashboard">
          Build a Weibull Reliability Dashboard in Power BI
        </Link>{' '}
        fits the same Weibull with LINESTX and shows why a replacement interval set from MTBF let three
        pumps in four fail first.
      </>,
      <>
        New blog post:{' '}
        <Link href="/blog/refresh-credentials-invalid-error">
          The Credentials Provided for the Data Source Are Invalid
        </Link>
        , on why scheduled refresh fails in the Service when Desktop works: expired OAuth tokens,
        another owner&apos;s credentials, the wrong authentication method, gateway connections, and
        &ldquo;Skip test connection&rdquo;.
      </>,
      <>
        New blog post:{' '}
        <Link href="/blog/variant-data-type-calculated-column-error">
          Expressions That Yield Variant Data-Type Cannot Be Used to Define Calculated Columns
        </Link>
        , covering the five ways a calculated column ends up returning two data types, from an
        &ldquo;N/A&rdquo; fallback to a LOOKUPVALUE default, and why the same formula works as a
        measure.
      </>,
    ],
  },
  {
    date: '2026-11-12',
    entries: [
      <>
        Launched the <Link href="/tools/pareto-chart-builder">Pareto Chart Builder</Link>: paste
        defect causes with counts and costs to get a Pareto chart, the vital few that reach 80%, and
        the DAX for a line and clustered column chart, with ties and &ldquo;Other&rdquo; ranked the
        way they should be. The new tutorial{' '}
        <Link href="/tutorials/build-a-pareto-chart-dashboard">
          Build a Pareto Chart Dashboard in Power BI
        </Link>{' '}
        shows how ranking by cost instead of count changes which problem gets fixed first.
      </>,
      <>
        Added the tutorial
        {' '}
        <Link href="/tutorials/build-an-spc-control-chart-dashboard">
          Build an SPC Control Chart Dashboard in Power BI
        </Link>
        : an individuals and moving range chart in DAX with limits from a baseline, the four Western
        Electric rules flagged point by point, and Cp/Cpk, including why limits from all the data hide
        the very shift the chart should catch.
      </>,
      <>
        Launched the <Link href="/tools/dax-syntax-checker">DAX Syntax Checker</Link>: paste a
        formula that fails with &ldquo;The syntax for &lsquo;...&rsquo; is incorrect&rdquo; to see
        the real mistake marked in place, from trailing commas and unbalanced parentheses to curly
        quotes, semicolon separators, and unquoted table names, with one-click fixes. Each cause is
        explained in <Link href="/blog/dax-syntax-is-incorrect-error">the new blog post</Link>.
      </>,
    ],
  },
  {
    date: '2026-11-11',
    entries: [
      <>
        Launched the <Link href="/tools/control-chart-builder">Control Chart Builder</Link>: paste
        measurements or defect counts to get an I-MR, X̄-R, or p control chart with limits set from a
        baseline, the four Western Electric rules flagged point by point, and Cp/Cpk against spec
        limits, plus the DAX to build the same chart in Power BI.
      </>,
    ],
  },
  {
    date: '2026-11-08',
    entries: [
      <>
        Added a{' '}
        <Link href="/tutorials/build-a-schedule-risk-monte-carlo-dashboard">
          Monte Carlo schedule risk dashboard tutorial
        </Link>
        : 10,000 simulated schedules built in DAX from three-point estimates, with an S-curve,
        P50/P80/P90 finish dates, the real odds of hitting the plan, and which tasks drive the finish.
      </>,
    ],
  },
  {
    date: '2026-11-07',
    entries: [
      <>
        Launched the <Link href="/tools/schedule-risk-simulator">Schedule Risk Simulator</Link>: paste
        tasks with three-point duration estimates and predecessors to run a Monte Carlo simulation of
        the finish date, with an S-curve, P50/P80/P90 dates, the chance of hitting a target, and how
        often each task is critical, plus a CSV of the runs and the DAX to chart them in Power BI.
      </>,
    ],
  },
  {
    date: '2026-11-06',
    entries: [
      <>
        Launched the{' '}
        <Link href="/tools/traceability-matrix-builder">Traceability Matrix Builder</Link>: paste
        requirements, requirement-to-test links, and test results to get a traceability matrix,
        coverage %, verified %, pass rate, and the requirements with no test mapped, plus the
        matching DAX.
      </>,
    ],
  },
  {
    date: '2026-11-05',
    entries: [
      <>
        Launched the <Link href="/tools/fmea-calculator">FMEA Calculator</Link>: paste failure modes
        to get RPNs and High/Medium/Low action priority, with a severity override that flags rare but
        serious failure modes RPN alone would rank low, plus the matching DAX.
      </>,
      <>
        Every tool page now has its own preview image when shared, and the Tools and More menus in
        the header were rebuilt.
      </>,
    ],
  },
  {
    date: '2026-11-04',
    entries: [
      <>
        Launched the{' '}
        <Link href="/tools/field-parameter-generator">Field Parameter Generator</Link>: list measures
        or columns with display names, sort order, and optional groups to get the field parameter
        DAX, a slicer preview, and a dynamic title measure.
      </>,
      <>
        Launched the <Link href="/tools/risk-matrix-builder">Risk Matrix Builder</Link>: paste a risk
        register to get a 5×5 heat map, scores, adjustable Critical/High/Medium bands, and a ranked
        list, plus the DAX for Risk Score, Risk Level, and the matrix visual&apos;s cell colors.
      </>,
    ],
  },
  {
    date: '2026-11-03',
    entries: [
      <>
        Launched the <Link href="/tools/reliability-calculator">Reliability Calculator</Link>: paste
        a failure log or enter totals to get MTBF, MTTR, availability, failure rate, and mission
        reliability, with a per-asset breakdown that flags single-failure assets and the matching
        DAX measures.
      </>,
      <>
        Linked the free tools from the docs pages, tutorials, and cheat sheets that cover what each
        one generates.
      </>,
    ],
  },
  {
    date: '2026-11-02',
    entries: [
      <>
        Launched the <Link href="/tools/evm-calculator">EVM Calculator</Link>: enter BAC, PV, EV,
        and AC to get CPI, SPI, variances, EAC, ETC, VAC, and TCPI, with a plain-English status, a
        cost-vs-schedule chart, three EAC methods side by side, and the matching DAX measures. Also
        added a free tools section to the homepage.
      </>,
    ],
  },
  {
    date: '2026-11-01',
    entries: [
      <>
        Added a <Link href="/tools">Tools</Link> page that collects every generator in one place,
        and launched the <Link href="/tools/format-string-builder">Format String Builder</Link>:
        custom format strings for K, M, and B, currency, percentages, and negatives in parentheses,
        with a live preview and a dynamic format string for automatic K/M/B.
      </>,
      <>
        Launched the{' '}
        <Link href="/tools/time-intelligence-generator">Time Intelligence Generator</Link>: pick a
        base measure and get YTD, prior year, YoY %, rolling 12 month, and running total measures,
        either as separate measures (or one DAX query view script) or as a calculation group, with
        fiscal year support and a month-by-month preview.
      </>,
      <>
        Launched the <Link href="/tools/date-table-generator">Date Table Generator</Link>: pick a
        range, fiscal year start, week start, and columns, and get a date table to paste into Power BI
        as DAX or Power Query M, with a row preview and the sort-by-column settings it needs. Free,
        with no request limit.
      </>,
    ],
  },
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
      <>
        Diagram 30: <Link href="/docs/modeling/date-tables">Date Tables</Link>. Each column&apos;s
        job on real rows across a July fiscal year boundary, why a date table built from sales
        dates has gaps, and how one order lands in a different fiscal year depending on which
        date relationship is active.
      </>,
      <>
        Diagram 31: <Link href="/docs/visuals/field-parameters">Field Parameters</Link>. The real
        three-column table Desktop generates (display name, hidden NAMEOF() reference, order), and
        one chart switching from Revenue by Category to Profit by Region. Also corrected how
        slicer labels are renamed: edit the display-name string, no calculated column needed.
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
