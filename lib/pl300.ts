import type { Exercise } from '@/lib/dax-exercises';

// PL-300 skills outline, transcribed from Microsoft's study guide
// ("Skills measured as of April 20, 2026"), mapped to PBIDocs pages.
// A skill with no links is shown as not covered here yet.
// Source: https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300

export const SKILLS_AS_OF = 'April 20, 2026';
export const STUDY_GUIDE_URL = 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300';

type L = { href: string; label: string };
export type Skill = { text: string; links: L[] };
export type Area = { name: string; skills: Skill[] };
export type Domain = { id: string; name: string; short: string; weight: string; areas: Area[] };

const l = (href: string, label: string): L => ({ href, label });

export const DOMAINS: Domain[] = [
  {
    id: 'prepare',
    name: 'Prepare the data',
    short: 'Prepare',
    weight: '25–30%',
    areas: [
      {
        name: 'Get or connect to data',
        skills: [
          { text: 'Identify and connect to data sources or a shared semantic model', links: [l('/docs/power-query/introduction', 'Power Query introduction'), l('/docs/power-query/sql-database', 'Sql.Database'), l('/docs/power-query/excel-workbook', 'Excel.Workbook')] },
          { text: 'Change data source settings, including credentials and privacy levels', links: [l('/blog/formula-firewall-privacy-level-error', 'Privacy levels and Formula.Firewall'), l('/blog/refresh-credentials-invalid-error', 'Invalid credentials')] },
          { text: 'Choose between DirectLake, DirectQuery, and Import', links: [l('/docs/modeling/storage-modes', 'DirectQuery vs. Import'), l('/docs/fabric/direct-lake', 'Direct Lake mode'), l('/docs/modeling/composite-models', 'Composite models')] },
          { text: 'Create and modify parameters', links: [l('/blog/dynamic-data-source-refresh-error', 'Parameters and dynamic sources')] },
        ],
      },
      {
        name: 'Profile and clean the data',
        skills: [
          { text: 'Evaluate data, including data statistics and column properties', links: [l('/docs/power-query/editor', 'Power Query Editor')] },
          { text: 'Resolve inconsistencies, unexpected or null values, and data quality issues', links: [l('/docs/power-query/table-replacevalue', 'Table.ReplaceValue'), l('/docs/power-query/text-trim-upper-lower', 'Text.Trim and casing'), l('/docs/power-query/value-type-null', 'Comparing to null')] },
          { text: 'Resolve data import errors', links: [l('/docs/power-query/error-handling', 'Error handling'), l('/blog/couldnt-convert-to-number-date-error', 'Couldn\'t convert to number'), l('/blog/invalid-cell-value-na-error', 'Invalid cell value #N/A')] },
        ],
      },
      {
        name: 'Transform and load the data',
        skills: [
          { text: 'Select appropriate column data types', links: [l('/docs/power-query/table-transformcolumntypes', 'Table.TransformColumnTypes')] },
          { text: 'Create and transform columns', links: [l('/docs/power-query/table-addcolumn', 'Table.AddColumn'), l('/docs/power-query/table-transformcolumns', 'Table.TransformColumns'), l('/docs/power-query/table-splitcolumn-combinecolumns', 'Split and combine columns')] },
          { text: 'Group and aggregate rows', links: [l('/docs/power-query/table-group', 'Table.Group')] },
          { text: 'Pivot, unpivot, and transpose data', links: [l('/docs/power-query/table-pivot-unpivot', 'Pivot and unpivot')] },
          { text: 'Convert semi-structured data to a table', links: [l('/docs/power-query/json-document', 'Json.Document'), l('/blog/cannot-convert-list-to-text-error', '[List] and [Record] columns')] },
          { text: 'Create fact tables and dimension tables', links: [l('/docs/modeling/fact-tables', 'Fact tables'), l('/docs/modeling/dimension-tables', 'Dimension tables'), l('/docs/modeling/star-schema', 'Star schema')] },
          { text: 'Identify when to use reference or duplicate queries and the resulting impact', links: [l('/docs/power-query/reference-vs-duplicate', 'Reference vs. duplicate')] },
          { text: 'Merge and append queries', links: [l('/docs/power-query/merge-vs-append', 'Merge vs. append'), l('/docs/power-query/merge-queries', 'Merge queries')] },
          { text: 'Identify and create appropriate keys for relationships', links: [l('/docs/modeling/relationships', 'Relationships'), l('/blog/column-contains-duplicate-value-error', 'Duplicate value error')] },
          { text: 'Configure data loading for queries', links: [l('/docs/power-query/reference-vs-duplicate#enable-load-which-queries-reach-the-model', 'Enable load')] },
        ],
      },
    ],
  },
  {
    id: 'model',
    name: 'Model the data',
    short: 'Model',
    weight: '25–30%',
    areas: [
      {
        name: 'Design and implement a data model',
        skills: [
          { text: 'Configure table and column properties', links: [l('/blog/sort-by-column-more-than-one-value-error', 'Sort by Column')] },
          { text: 'Implement role-playing dimensions', links: [l('/docs/dax/userelationship', 'USERELATIONSHIP'), l('/docs/modeling/date-tables#multiple-date-relationships', 'Multiple date relationships')] },
          { text: "Define a relationship's cardinality and cross-filter direction", links: [l('/docs/modeling/relationships', 'Relationships'), l('/docs/modeling/many-to-many', 'Many-to-many'), l('/docs/dax/crossfilter', 'CROSSFILTER')] },
          { text: 'Create a common date table', links: [l('/docs/modeling/date-tables', 'Date tables'), l('/tools/date-table-generator', 'Date table generator')] },
          { text: 'Identify use cases for calculated columns and calculated tables', links: [l('/docs/dax/calculated-columns', 'Calculated columns'), l('/docs/dax/calculated-tables', 'Calculated tables')] },
        ],
      },
      {
        name: 'Create model calculations by using DAX',
        skills: [
          { text: 'Create single aggregation measures', links: [l('/docs/dax/measures', 'Measures'), l('/docs/dax/distinctcount', 'DISTINCTCOUNT'), l('/docs/dax/countrows', 'COUNTROWS')] },
          { text: 'Use the CALCULATE function', links: [l('/docs/dax/calculate', 'CALCULATE'), l('/docs/dax/filter-functions', 'ALL and REMOVEFILTERS'), l('/dax-practice', 'DAX practice')] },
          { text: 'Implement time intelligence measures', links: [l('/docs/dax/time-intelligence', 'Time intelligence'), l('/tools/time-intelligence-generator', 'Time intelligence generator')] },
          { text: 'Use basic statistical functions', links: [l('/docs/dax/iterator', 'Iterator (X) functions')] },
          { text: 'Create semi-additive measures', links: [l('/docs/dax-patterns/semi-additive', 'Semi-additive measures')] },
          { text: 'Create a measure by using quick measures', links: [] },
          { text: 'Create calculated tables or columns', links: [l('/docs/dax/calculated-tables', 'Calculated tables'), l('/docs/dax/calendar-calendarauto', 'CALENDAR')] },
          { text: 'Create calculation groups', links: [l('/docs/modeling/calculation-groups', 'Calculation groups')] },
        ],
      },
      {
        name: 'Optimize model performance',
        skills: [
          { text: 'Improve performance by identifying and removing unnecessary rows and columns', links: [l('/docs/dax/performance', 'Performance optimization'), l('/blog/not-enough-memory-power-bi-desktop', 'Not enough memory')] },
          { text: 'Identify poorly performing measures, relationships, and visuals by using Performance Analyzer and DAX query view', links: [l('/docs/dax/performance', 'Performance optimization'), l('/blog/visual-has-exceeded-available-resources-error', 'Visual exceeded resources')] },
          { text: 'Improve performance by reducing granularity', links: [l('/docs/modeling/aggregations', 'Aggregations')] },
        ],
      },
    ],
  },
  {
    id: 'visualize',
    name: 'Visualize and analyze the data',
    short: 'Visualize',
    weight: '25–30%',
    areas: [
      {
        name: 'Create reports',
        skills: [
          { text: 'Select an appropriate visual', links: [l('/docs/visuals/charts', 'Charts'), l('/docs/visuals/tables', 'Tables and matrices')] },
          { text: 'Format and configure visuals', links: [l('/docs/visuals/formatting', 'Formatting')] },
          { text: 'Create a narrative visual with Copilot', links: [] },
          { text: 'Apply and customize a theme', links: [l('/docs/governance/report-themes', 'Report theme JSON')] },
          { text: 'Apply conditional formatting', links: [l('/docs/visuals/formatting', 'Formatting')] },
          { text: 'Apply slicing and filtering', links: [l('/docs/visuals/slicers', 'Slicers')] },
          { text: 'Use Copilot to create a new report page', links: [l('/docs/ai-power-bi/report-design', 'Report design with AI')] },
          { text: 'Use Copilot to suggest content for a new report page', links: [l('/docs/ai-power-bi/report-design', 'Report design with AI')] },
          { text: 'Configure the report page', links: [l('/docs/visuals/report-layout#page-settings', 'Page settings')] },
          { text: 'Choose when to use a paginated report', links: [] },
          { text: 'Create visual calculations by using DAX', links: [l('/docs/dax/visual-calculations', 'Visual calculations')] },
        ],
      },
      {
        name: 'Enhance reports for usability and storytelling',
        skills: [
          { text: 'Configure bookmarks', links: [l('/docs/visuals/bookmarks', 'Bookmarks')] },
          { text: 'Create custom tooltips', links: [l('/docs/visuals/tooltips', 'Report page tooltips')] },
          { text: 'Edit and configure interactions between visuals', links: [l('/docs/visuals/bookmarks', 'Bookmarks and interactivity')] },
          { text: 'Configure navigation for a report', links: [l('/docs/visuals/bookmarks', 'Bookmarks and interactivity')] },
          { text: 'Apply sorting to visuals', links: [l('/blog/sort-by-column-more-than-one-value-error', 'Sort by Column')] },
          { text: 'Configure sync slicers', links: [l('/docs/visuals/slicers', 'Slicers')] },
          { text: 'Group and layer visuals by using the Selection pane', links: [l('/docs/visuals/report-layout#the-selection-pane', 'Selection pane')] },
          { text: 'Configure drillthrough navigation, including pages, filters, and buttons', links: [l('/docs/visuals/drillthrough', 'Drillthrough')] },
          { text: 'Configure export settings', links: [] },
          { text: 'Design reports for mobile devices', links: [l('/docs/visuals/report-layout#mobile-layout', 'Mobile layout')] },
          { text: 'Enable personalization in a report, including personalized visuals', links: [l('/docs/visuals/field-parameters', 'Field parameters')] },
          { text: 'Design and configure Power BI reports for accessibility', links: [l('/docs/visuals/report-layout#accessibility', 'Accessibility')] },
          { text: 'Configure automatic page refresh', links: [] },
        ],
      },
      {
        name: 'Identify patterns and trends',
        skills: [
          { text: 'Use the Analyze feature in Power BI', links: [] },
          { text: 'Use grouping, binning, and clustering', links: [] },
          { text: 'Use AI visuals', links: [] },
          { text: 'Use reference lines, error bars, and forecasting', links: [l('/tutorials/build-an-spc-control-chart-dashboard', 'Control chart limits as reference lines')] },
          { text: 'Detect outliers and anomalies', links: [l('/tools/control-chart-builder', 'SPC control chart builder')] },
          { text: 'Use Copilot to summarize the underlying semantic model', links: [] },
        ],
      },
    ],
  },
  {
    id: 'manage',
    name: 'Manage and secure Power BI',
    short: 'Manage',
    weight: '15–20%',
    areas: [
      {
        name: 'Create and manage workspaces and assets',
        skills: [
          { text: 'Create and configure a workspace', links: [l('/docs/power-bi-service/workspaces', 'Workspaces')] },
          { text: 'Configure and update an app', links: [l('/docs/power-bi-service/workspaces', 'Workspaces')] },
          { text: 'Publish, import, or update items in a workspace', links: [l('/docs/power-bi-service/deployment-pipelines', 'Deployment pipelines')] },
          { text: 'Create dashboards', links: [l('/docs/power-bi-service/dashboards', 'Dashboards')] },
          { text: 'Choose a distribution method', links: [l('/docs/power-bi-service/sharing-and-permissions#four-ways-to-give-someone-access', 'Four ways to give access'), l('/docs/power-bi-service/workspaces', 'Workspaces')] },
          { text: 'Configure subscriptions and data alerts', links: [l('/docs/power-bi-service/dashboards', 'Dashboards')] },
          { text: 'Promote or certify Power BI content', links: [l('/docs/power-bi-service/sharing-and-permissions#endorsement-promoted-and-certified', 'Endorsement')] },
          { text: 'Identify when a gateway is required', links: [l('/docs/governance/gateway-refresh', 'Gateways and refresh'), l('/blog/gateway-offline-refresh-error', 'Gateway offline error')] },
          { text: 'Configure a semantic model scheduled refresh', links: [l('/docs/power-bi-service/refresh', 'Refresh'), l('/blog/scheduled-refresh-turned-off', 'Why scheduled refresh turns off')] },
        ],
      },
      {
        name: 'Secure and govern Power BI items',
        skills: [
          { text: 'Assign workspace roles', links: [l('/docs/power-bi-service/workspaces', 'Workspaces')] },
          { text: 'Configure item-level access', links: [l('/docs/power-bi-service/sharing-and-permissions#sharing-a-single-item', 'Sharing an item')] },
          { text: 'Configure access to semantic models', links: [l('/docs/power-bi-service/sharing-and-permissions#semantic-model-permissions', 'Semantic model permissions')] },
          { text: 'Implement row-level security roles', links: [l('/docs/power-bi-service/security', 'Row-level security'), l('/docs/governance/rls-matrix', 'RLS role matrix')] },
          { text: 'Configure row-level security group membership', links: [l('/docs/power-bi-service/security', 'Row-level security'), l('/blog/rls-works-in-desktop-not-in-service', 'RLS works in Desktop, not Service')] },
          { text: 'Apply sensitivity labels', links: [l('/docs/power-bi-service/sharing-and-permissions#sensitivity-labels', 'Sensitivity labels')] },
        ],
      },
    ],
  },
];

export const PL300_LEVELS = DOMAINS.map((d) => d.short);

// Practice questions, four per domain. Scenario-style, like the exam, and
// limited to behaviour that is stable and documented.
export const PL300_QUESTIONS: Exercise[] = [
  // ---- Prepare ----
  {
    id: 'pl-reference-duplicate',
    level: 'Prepare',
    title: 'Reference or duplicate',
    setup:
      'You have a cleaned Customers query. You need a second query that starts from it and automatically picks up any future changes to the Customers steps.',
    question: 'What should you create?',
    options: [
      { text: 'A duplicate of Customers', why: 'Duplicate copies the steps once. The copy is independent, so later changes to Customers don\'t reach it.' },
      { text: 'A reference to Customers', correct: true, why: 'A reference starts from the output of Customers, so any change to its steps flows through. The trade-off: change Customers carelessly and every referencing query changes too.' },
      { text: 'An appended query with Customers as the first table', why: 'Append stacks rows from several queries. It doesn\'t create a query that builds on another one\'s steps.' },
    ],
    learn: { href: '/docs/power-query/reference-vs-duplicate', label: 'Reference vs. duplicate queries' },
  },
  {
    id: 'pl-unpivot',
    level: 'Prepare',
    title: 'Months as columns',
    setup: 'A budget sheet has one row per department and one column per month, Jan to Dec. You need one row per department per month, so you can relate it to a date table.',
    question: 'Which transformation should you use?',
    options: [
      { text: 'Select Department, then Unpivot Other Columns', correct: true, why: 'Unpivot turns the twelve month columns into Attribute and Value rows. Unpivot Other Columns keeps working when a new month column appears.' },
      { text: 'Pivot Column on the month columns', why: 'Pivot goes the other way: it turns row values into columns. The data is already too wide.' },
      { text: 'Transpose the table', why: 'Transpose swaps all rows and columns, giving one column per department. It doesn\'t produce one row per department per month.' },
    ],
    learn: { href: '/docs/power-query/table-pivot-unpivot', label: 'Pivot and unpivot' },
  },
  {
    id: 'pl-column-profile',
    level: 'Prepare',
    title: 'Column quality says 0% errors',
    setup:
      'Column quality in Power Query shows 0% errors for a 2-million-row table, but refresh fails with a data type error.',
    question: 'What is the most likely explanation?',
    options: [
      { text: 'Column profiling is based on the top 1,000 rows by default', correct: true, why: 'By default the profile only reads the first 1,000 rows. Switch it to the entire data set in the status bar to find the bad value further down.' },
      { text: 'Column quality ignores type conversion errors', why: 'Type conversion errors are exactly what the Error percentage counts, within the rows it profiles.' },
      { text: 'Errors only appear after the query is loaded to the model', why: 'Errors show in the editor as soon as a profiled row has one. The issue is which rows were profiled.' },
    ],
    learn: { href: '/blog/couldnt-convert-to-number-date-error', label: 'Type conversion errors' },
  },
  {
    id: 'pl-storage-mode',
    level: 'Prepare',
    title: 'Near-real-time data',
    setup:
      'Reports must show sales from an on-premises SQL Server within a few minutes of each transaction. The table is too large to import, and the workspace is on shared (Pro) capacity.',
    question: 'Which storage mode should you use for the sales table?',
    options: [
      { text: 'Import, with scheduled refresh', why: 'On shared capacity, scheduled refresh runs at most 8 times a day, so data can be hours old. The table is also too large to import.' },
      { text: 'DirectQuery', correct: true, why: 'DirectQuery sends queries to SQL Server when visuals load, so reports show current data without importing it. An on-premises source still needs a gateway.' },
      { text: 'Direct Lake', why: 'Direct Lake reads Delta tables in OneLake, on Fabric capacity. It doesn\'t connect to an on-premises SQL Server.' },
    ],
    learn: { href: '/docs/modeling/storage-modes', label: 'DirectQuery vs. Import' },
  },
  // ---- Model ----
  {
    id: 'pl-role-playing',
    level: 'Model',
    title: 'Order date and ship date',
    setup:
      'Sales has OrderDate and ShipDate, both related to the Date table. The OrderDate relationship is active. You need a Sales by Ship Date measure.',
    question: 'What should the measure use?',
    options: [
      { text: "CALCULATE ( [Total Sales], USERELATIONSHIP ( Sales[ShipDate], 'Date'[Date] ) )", code: true, correct: true, why: 'USERELATIONSHIP turns the inactive ShipDate relationship on for this calculation only.' },
      { text: "CALCULATE ( [Total Sales], RELATED ( 'Date'[Date] ) )", code: true, why: 'RELATED fetches a value across the active relationship in a row context. It can\'t switch relationships.' },
      { text: 'Make both relationships active', why: 'Power BI allows only one active relationship between two tables. A second date table, or USERELATIONSHIP, is the answer.' },
    ],
    learn: { href: '/docs/dax/userelationship', label: 'USERELATIONSHIP' },
  },
  {
    id: 'pl-semi-additive',
    level: 'Model',
    title: 'Inventory balance by quarter',
    setup:
      'An Inventory table has one row per product per day with the units on hand. A quarter row in a matrix should show the balance at the end of the quarter.',
    question: 'Which measure fits?',
    options: [
      { text: 'SUM ( Inventory[Units] )', code: true, why: 'Summing daily balances across a quarter adds about 90 snapshots together. Balances are semi-additive: they add across products, not across time.' },
      { text: "CALCULATE ( SUM ( Inventory[Units] ), LASTDATE ( 'Date'[Date] ) )", code: true, correct: true, why: 'LASTDATE keeps only the last date in the current period, so the quarter shows its closing balance while products still add up.' },
      { text: 'AVERAGE ( Inventory[Units] )', code: true, why: 'That averages every row in the quarter, across products and days. It is neither the closing balance nor a total across products.' },
    ],
    learn: { href: '/docs/dax-patterns/semi-additive', label: 'Semi-additive measures' },
  },
  {
    id: 'pl-cross-filter',
    level: 'Model',
    title: 'Which way filters flow',
    setup: 'Product relates to Sales one-to-many, with the default cross-filter direction.',
    question: 'What does the relationship filter?',
    options: [
      { text: 'Product filters Sales, but Sales doesn\'t filter Product', correct: true, why: 'The default for one-to-many is single direction, from the one side to the many side.' },
      { text: 'Both tables filter each other', why: 'That is Both direction, which you have to set explicitly. Use it sparingly: it can make filters ambiguous.' },
      { text: 'Sales filters Product, but Product doesn\'t filter Sales', why: 'That is backwards. Dimensions filter facts.' },
    ],
    learn: { href: '/docs/modeling/relationships', label: 'Relationships' },
  },
  {
    id: 'pl-performance-analyzer',
    level: 'Model',
    title: 'Which visual is slow',
    setup: 'A report page takes 12 seconds to load. You need to find which visual is responsible and copy its query.',
    question: 'Which tool should you use?',
    options: [
      { text: 'Performance Analyzer', correct: true, why: 'Performance Analyzer records each visual\'s DAX query, visual display, and other times, and lets you copy the query to run in DAX query view.' },
      { text: 'Query diagnostics in Power Query', why: 'Query diagnostics times Power Query steps during refresh, not visuals rendering in the report.' },
      { text: 'View lineage in the Service', why: 'Lineage shows how items depend on each other. It has no timings.' },
    ],
    learn: { href: '/docs/dax/performance', label: 'Performance optimization' },
  },
  // ---- Visualize ----
  {
    id: 'pl-drillthrough',
    level: 'Visualize',
    title: 'From a product to its details',
    setup: 'Users should right-click a product in any visual and open a details page filtered to that product.',
    question: 'What should you configure?',
    options: [
      { text: 'A bookmark', why: 'A bookmark saves a fixed page state. It can\'t carry the product the user clicked.' },
      { text: 'Drillthrough on the details page, with Product as the drillthrough field', correct: true, why: 'Drillthrough passes the clicked product as a filter to the target page and adds a back button.' },
      { text: 'A report page tooltip', why: 'A tooltip page shows on hover, in place. It doesn\'t navigate to a page.' },
    ],
    learn: { href: '/docs/visuals/drillthrough', label: 'Drillthrough' },
  },
  {
    id: 'pl-sync-slicers',
    level: 'Visualize',
    title: 'One slicer across pages',
    setup: 'A Region slicer on page 1 should filter pages 2 and 3 too, and keep the same selection on all three.',
    question: 'What should you use?',
    options: [
      { text: 'Sync slicers', correct: true, why: 'The Sync slicers pane links copies of a slicer across pages so they share one selection.' },
      { text: 'Edit interactions', why: 'Edit interactions controls how visuals on the same page affect each other.' },
      { text: 'A visual-level filter on every visual', why: 'Fixed filters can\'t be changed by users and don\'t follow a slicer selection.' },
    ],
    learn: { href: '/docs/visuals/slicers', label: 'Slicers' },
  },
  {
    id: 'pl-paginated',
    level: 'Visualize',
    title: 'A printable invoice run',
    setup: 'Finance needs a print-ready document listing every invoice line, which runs to hundreds of pages, with headers repeated on each page.',
    question: 'What should you build?',
    options: [
      { text: 'A Power BI report with a table visual', why: 'Interactive reports are designed for the screen. Long tables scroll inside the visual instead of flowing across printed pages.' },
      { text: 'A paginated report', correct: true, why: 'Paginated reports are built for pixel-exact, multi-page output, with headers and footers repeated on every page and every row of the data printed in full.' },
      { text: 'A dashboard', why: 'Dashboards pin tiles for monitoring. They don\'t print detailed lists.' },
    ],
    learn: { href: '/docs/visuals/tables', label: 'Tables and matrices' },
  },
  {
    id: 'pl-edit-interactions',
    level: 'Visualize',
    title: 'A KPI that ignores the chart',
    setup: 'Clicking a bar in a chart filters a company-wide KPI card on the same page. The card should never change when the chart is clicked.',
    question: 'What should you do?',
    options: [
      { text: 'Select the chart, turn on Edit interactions, and set the card to None', correct: true, why: 'Edit interactions sets, per pair of visuals, whether a selection filters, highlights, or does nothing.' },
      { text: 'Hide the card in the Selection pane', why: 'That removes the card from view, which isn\'t the goal.' },
      { text: 'Turn off cross-highlighting in report settings for the whole report', why: 'There is no single switch that does only this. Edit interactions is the per-visual control.' },
    ],
    learn: { href: '/docs/visuals/bookmarks', label: 'Bookmarks and interactivity' },
  },
  // ---- Manage ----
  {
    id: 'pl-workspace-role',
    level: 'Manage',
    title: 'Publish, but don\'t manage access',
    setup: 'An analyst must publish and update reports in a workspace but must not add or remove people.',
    question: 'Which workspace role should they get?',
    options: [
      { text: 'Viewer', why: 'Viewers can view content but can\'t publish.' },
      { text: 'Contributor', correct: true, why: 'Contributors can create, edit, and publish content. They can\'t add people to the workspace; Members and Admins can.' },
      { text: 'Member', why: 'Members can publish, but they can also add other people, which this analyst must not do.' },
    ],
    learn: { href: '/docs/power-bi-service/workspaces', label: 'Workspaces' },
  },
  {
    id: 'pl-gateway',
    level: 'Manage',
    title: 'Which source needs a gateway',
    setup: 'A semantic model combines several sources and must refresh on a schedule in the Service.',
    question: 'Which source requires an on-premises data gateway?',
    options: [
      { text: 'A SharePoint Online list', why: 'SharePoint Online is a cloud source: the Service connects to it directly.' },
      { text: 'A SQL Server database in the company data center', correct: true, why: 'The Service can\'t reach a server inside your network. The gateway relays the refresh to it.' },
      { text: 'An Azure SQL Database', why: 'Azure SQL is a cloud source. Unless it is locked inside a private network, no gateway is needed.' },
    ],
    learn: { href: '/docs/governance/gateway-refresh', label: 'Gateways and refresh' },
  },
  {
    id: 'pl-rls-members',
    level: 'Manage',
    title: 'RLS that doesn\'t filter',
    setup: 'You created RLS roles in Desktop, published, and assigned users in the Service. One user still sees every region. They are a Member of the workspace.',
    question: 'Why?',
    options: [
      { text: 'RLS only applies to users with the Viewer role or app and shared access', correct: true, why: 'Workspace Admins, Members, and Contributors can edit the model, so RLS doesn\'t restrict them. Give report readers Viewer access or an app instead.' },
      { text: 'Roles must be assigned in Desktop, not the Service', why: 'It\'s the reverse: roles are defined in Desktop and members are assigned in the Service.' },
      { text: 'RLS only works with DirectQuery', why: 'RLS works with Import and DirectQuery models alike.' },
    ],
    learn: { href: '/blog/rls-works-in-desktop-not-in-service', label: 'RLS works in Desktop, not in the Service' },
  },
  {
    id: 'pl-app',
    level: 'Manage',
    title: 'Sharing with 400 readers',
    setup: 'Several reports and a dashboard must go to 400 read-only users as one package, with its own navigation, without giving them workspace access.',
    question: 'Which distribution method fits?',
    options: [
      { text: 'Publish an app from the workspace', correct: true, why: 'An app bundles workspace content with navigation for an audience, separate from the people who build it, and updates when you republish.' },
      { text: 'Add all 400 as workspace Viewers', why: 'It works, but readers see the raw workspace, including content not meant for them. An app is the packaged route.' },
      { text: 'Share each report individually', why: 'Sharing item by item doesn\'t scale and gives no single navigation.' },
    ],
    learn: { href: '/docs/power-bi-service/sharing-and-permissions#four-ways-to-give-someone-access', label: 'Four ways to give access' },
  },
];
