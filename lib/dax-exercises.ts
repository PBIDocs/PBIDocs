// DAX practice exercises. Every exercise runs against the one small model
// below, so each answer can be worked out by hand from the tables on the page.
// Totals used throughout (keep in sync if the data changes):
//   all sales 1,600 · North 1,150 · South 450 · 2025 1,100 · 2026 500
//   Jan-25 350 · Feb-25 350 · Mar-25 400 · Jan-26 400 · Feb-26 100
//   Widget 1,000 · Gadget 450 · Gizmo 150 · Qty 16

export type SalesRow = {
  id: number;
  date: string;
  product: string;
  region: string;
  qty: number;
  amount: number;
};

export const SALES: SalesRow[] = [
  { id: 1, date: '2025-01-15', product: 'Widget', region: 'North', qty: 2, amount: 200 },
  { id: 2, date: '2025-01-20', product: 'Gadget', region: 'North', qty: 1, amount: 150 },
  { id: 3, date: '2025-02-03', product: 'Widget', region: 'South', qty: 3, amount: 300 },
  { id: 4, date: '2025-02-18', product: 'Gizmo', region: 'South', qty: 1, amount: 50 },
  { id: 5, date: '2025-03-05', product: 'Gadget', region: 'North', qty: 2, amount: 300 },
  { id: 6, date: '2025-03-22', product: 'Widget', region: 'South', qty: 1, amount: 100 },
  { id: 7, date: '2026-01-10', product: 'Widget', region: 'North', qty: 4, amount: 400 },
  { id: 8, date: '2026-02-14', product: 'Gizmo', region: 'North', qty: 2, amount: 100 },
];

export const PRODUCTS = [
  { product: 'Widget', category: 'Hardware', price: 100 },
  { product: 'Gadget', category: 'Hardware', price: 150 },
  { product: 'Gizmo', category: 'Accessories', price: 50 },
];

export type Level = 'Beginner' | 'Filter context' | 'Time intelligence' | 'Fix the bug';
export const LEVELS: Level[] = ['Beginner', 'Filter context', 'Time intelligence', 'Fix the bug'];

export type Option = { text: string; code?: boolean; correct?: boolean; why: string };

export type Exercise = {
  id: string;
  level: string;
  title: string;
  setup: string;
  code?: string;
  question: string;
  options: Option[];
  learn: { href: string; label: string };
};

export const EXERCISES: Exercise[] = [
  // ---------------- Beginner ----------------
  {
    id: 'distinct-products',
    level: 'Beginner',
    title: 'Counting products',
    setup: 'A card visual, with no slicers or filters on the page, shows this measure.',
    code: 'Products Sold = DISTINCTCOUNT ( Sales[Product] )',
    question: 'What does the card show?',
    options: [
      { text: '8', why: 'That is COUNTROWS(Sales): one per order. DISTINCTCOUNT counts each product once, however many orders it has.' },
      { text: '3', correct: true, why: 'Sales[Product] holds Widget, Gadget, and Gizmo. DISTINCTCOUNT counts each distinct value once: 3.' },
      { text: '16', why: 'That is the total of Sales[Qty]. DISTINCTCOUNT counts values, it never adds them up.' },
    ],
    learn: { href: '/docs/dax/distinctcount', label: 'DISTINCTCOUNT' },
  },
  {
    id: 'average-order-south',
    level: 'Beginner',
    title: 'Average order value by region',
    setup:
      'A table visual has Sales[Region] on rows and this measure as a value. [Total Sales] is SUM ( Sales[Amount] ).',
    code: 'Avg Order = DIVIDE ( [Total Sales], COUNTROWS ( Sales ) )',
    question: 'What does the South row show?',
    options: [
      { text: '150', correct: true, why: 'The South row filters Sales to orders 3, 4, and 6. Both [Total Sales] (450) and COUNTROWS (3) see that filter: 450 / 3 = 150.' },
      { text: '200', why: 'That is 1,600 / 8, the average over every order. The row filter applies to both the numerator and the denominator.' },
      { text: '56.25', why: 'That would be 450 / 8: South sales over all orders. COUNTROWS(Sales) is filtered by the row too, so it returns 3, not 8.' },
    ],
    learn: { href: '/docs/dax/divide', label: 'DIVIDE' },
  },
  {
    id: 'revenue-from-price',
    level: 'Beginner',
    title: 'Revenue from quantity and price',
    setup:
      'Suppose Sales had no Amount column, only Qty, and the price lives on the Product table. Sales relates to Product on Product, many to one.',
    code: '-- Target: a measure that returns 1,600 in a card with no filters',
    question: 'Which measure returns the true revenue, 1,600?',
    options: [
      { text: 'SUM ( Sales[Qty] ) * SUM ( Product[Price] )', code: true, why: 'Total quantity (16) times the sum of all three prices (300) is 4,800. Multiplying two totals is not the same as totalling the products.' },
      { text: 'SUMX ( Sales, Sales[Qty] * RELATED ( Product[Price] ) )', code: true, correct: true, why: 'SUMX walks Sales one order at a time, multiplies that order\'s Qty by its product\'s price via RELATED, then adds the eight results: 1,600.' },
      { text: 'Sales[Qty] * RELATED ( Product[Price] )', code: true, why: 'As a measure this is an error: a measure has no current row, so Sales[Qty] has no single value. That formula only works inside an iterator or a calculated column.' },
    ],
    learn: { href: '/docs/dax/sumx', label: 'SUMX and iterators' },
  },

  // ---------------- Filter context ----------------
  {
    id: 'calculate-replaces',
    level: 'Filter context',
    title: 'CALCULATE on a region table',
    setup: 'A table visual has Sales[Region] on rows: North and South.',
    code: 'North Sales =\nCALCULATE ( [Total Sales], Sales[Region] = "North" )',
    question: 'What does the South row show?',
    options: [
      { text: 'BLANK', why: 'It feels like South and North cancel out, but they don\'t: a filter argument on Sales[Region] replaces the row\'s filter on that same column instead of combining with it.' },
      { text: '450', why: 'That is South\'s own total. CALCULATE overwrote the South filter with North, so South never reaches the measure.' },
      { text: '1,150', correct: true, why: 'Sales[Region] = "North" replaces the existing filter on Sales[Region]. Every row of the visual returns North\'s total, 1,150, including South.' },
    ],
    learn: { href: '/docs/dax/calculate', label: 'CALCULATE' },
  },
  {
    id: 'keepfilters',
    level: 'Filter context',
    title: 'The same measure with KEEPFILTERS',
    setup: 'Same table visual, Sales[Region] on rows. The filter is now wrapped in KEEPFILTERS.',
    code: 'North Sales =\nCALCULATE ( [Total Sales], KEEPFILTERS ( Sales[Region] = "North" ) )',
    question: 'What does the South row show now?',
    options: [
      { text: 'BLANK', correct: true, why: 'KEEPFILTERS intersects the new filter with the existing one instead of replacing it. South AND North matches no rows, so the result is BLANK. North still shows 1,150.' },
      { text: '1,150', why: 'That was the answer without KEEPFILTERS. KEEPFILTERS stops the replacement, so the row\'s South filter stays in force.' },
      { text: '450', why: 'KEEPFILTERS keeps South, but it also keeps North. Both filters apply at once, and no order is in both regions.' },
    ],
    learn: { href: '/docs/dax/keepfilters', label: 'KEEPFILTERS' },
  },
  {
    id: 'all-wrong-column',
    level: 'Filter context',
    title: 'Percent of total that shows 100%',
    setup: 'A table visual has Product[Product] on rows.',
    code: '% of Total =\nDIVIDE (\n    [Total Sales],\n    CALCULATE ( [Total Sales], ALL ( Product[Category] ) )\n)',
    question: 'What does the Gizmo row show?',
    options: [
      { text: '9.4%', why: 'That is 150 / 1,600, what you\'d get with ALL ( Product ). But this ALL only clears Category, and the row filters Product[Product].' },
      { text: '100%', correct: true, why: 'ALL ( Product[Category] ) removes a filter that isn\'t there. The row\'s filter on Product[Product] = Gizmo survives, so the denominator is Gizmo\'s own 150, and 150 / 150 = 100%.' },
      { text: '50%', why: 'There is no 50% in play: Gizmo is the only Accessories product, but the measure never compares within a category. The denominator is still filtered to Gizmo.' },
    ],
    learn: { href: '/docs/dax-patterns/percent-of-total', label: 'Percent of total' },
  },
  {
    id: 'calc-column-no-transition',
    level: 'Filter context',
    title: 'A calculated column that totals sales',
    setup: 'This is a calculated column added to the Product table, not a measure.',
    code: 'Product Sales = SUM ( Sales[Amount] )',
    question: 'What value does the Gizmo row of the Product table get?',
    options: [
      { text: '150', why: 'That is what [Total Sales] would give: a measure reference triggers context transition, turning the current row into a filter. A bare SUM in a calculated column doesn\'t.' },
      { text: '1,600', correct: true, why: 'A calculated column has a row context but no filter context. SUM ignores the current row and adds the whole Sales table: 1,600, on every product.' },
      { text: 'An error', why: 'It is valid DAX. It just doesn\'t filter by the row. Wrap it in CALCULATE, or reference a measure, to get 150 for Gizmo.' },
    ],
    learn: { href: '/docs/dax/row-context', label: 'Row context and context transition' },
  },

  // ---------------- Time intelligence ----------------
  {
    id: 'ytd-february',
    level: 'Time intelligence',
    title: 'Year-to-date in February',
    setup:
      "A matrix has 'Date'[Year] and 'Date'[Month] on rows. 'Date' is a full calendar table for 2025–2026, marked as a date table and related to Sales[Date].",
    code: "Sales YTD = TOTALYTD ( [Total Sales], 'Date'[Date] )",
    question: 'What does the February 2025 row show?',
    options: [
      { text: '350', why: 'That is February on its own. TOTALYTD runs from 1 January to the end of the month in context.' },
      { text: '700', correct: true, why: 'January 2025 (350) plus February 2025 (350) = 700.' },
      { text: '1,100', why: 'That is the full year 2025. The February row only reaches the end of February.' },
    ],
    learn: { href: '/docs/dax/time-intelligence#year-to-date-ytd', label: 'Year-to-date' },
  },
  {
    id: 'ytd-year-total',
    level: 'Time intelligence',
    title: 'Year-to-date on the total row',
    setup: 'Same matrix and the same Sales YTD measure. Look at the subtotal row for the year 2025.',
    code: "Sales YTD = TOTALYTD ( [Total Sales], 'Date'[Date] )",
    question: 'What does the 2025 subtotal row show?',
    options: [
      { text: '2,150', why: 'That adds up the monthly YTD values (350 + 700 + 1,100). A subtotal row re-evaluates the measure for the whole year; it never sums the rows above it.' },
      { text: '1,100', correct: true, why: 'On the 2025 row the filter context is the whole year, so YTD runs to 31 December 2025: 1,100.' },
      { text: 'BLANK', why: 'TOTALYTD works at any level of the date table, including a year subtotal.' },
    ],
    learn: { href: '/docs/dax-patterns/totals', label: 'Why totals don\'t add up' },
  },
  {
    id: 'sply-no-sales',
    level: 'Time intelligence',
    title: 'Last year, in a month with no sales',
    setup: 'Same matrix. There are no sales at all in March 2026.',
    code: "Sales LY =\nCALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )",
    question: 'What does the March 2026 row show for Sales LY?',
    options: [
      { text: 'BLANK, because March 2026 has no sales', why: 'The row\'s month comes from the Date table, which has every day of 2026. SAMEPERIODLASTYEAR shifts those dates to March 2025, which does have sales.' },
      { text: '400', correct: true, why: 'March 2026 shifts to March 2025: orders 5 and 6, 300 + 100 = 400. This is why the date table must cover whole years.' },
      { text: '1,100', why: 'That is all of 2025. SAMEPERIODLASTYEAR keeps the period length: one month in, one month out.' },
    ],
    learn: { href: '/docs/dax/time-intelligence#previous-year-sales', label: 'Previous year sales' },
  },

  // ---------------- Fix the bug ----------------
  {
    id: 'measure-in-filter',
    level: 'Fix the bug',
    title: 'Counting big orders',
    setup: 'This measure won\'t save. Power BI says a function has been used in a True/False expression used as a table filter expression.',
    code: 'Big Orders =\nCALCULATE ( COUNTROWS ( Sales ), [Total Sales] > 200 )',
    question: 'Which version counts orders over 200 correctly?',
    options: [
      { text: 'CALCULATE ( COUNTROWS ( Sales ), KEEPFILTERS ( [Total Sales] > 200 ) )', code: true, why: 'Still an error. KEEPFILTERS changes how a filter combines; it doesn\'t make a measure valid as a filter argument.' },
      { text: 'CALCULATE ( COUNTROWS ( Sales ), FILTER ( Sales, Sales[Amount] > 200 ) )', code: true, correct: true, why: 'FILTER walks Sales row by row and keeps orders whose Amount is over 200: orders 3, 5, and 7, so 3.' },
      { text: 'IF ( [Total Sales] > 200, COUNTROWS ( Sales ) )', code: true, why: 'This tests the total once, not each order. With no filters, 1,600 > 200, so it returns all 8 orders.' },
    ],
    learn: { href: '/blog/calculate-true-false-expression-error', label: 'The True/False expression error' },
  },
  {
    id: 'var-in-calculate',
    level: 'Fix the bug',
    title: 'A variable CALCULATE can\'t change',
    setup: 'A card with no filters shows this measure. The author expected North\'s total.',
    code: 'North Sales =\nVAR Total = [Total Sales]\nRETURN\n    CALCULATE ( Total, Sales[Region] = "North" )',
    question: 'What does the card show?',
    options: [
      { text: '1,150', why: 'That is what the author wanted. But Total was already evaluated before CALCULATE ran.' },
      { text: '1,600', correct: true, why: 'A variable is evaluated once, where it is defined, in the card\'s unfiltered context: 1,600. CALCULATE can\'t re-filter a value that is already computed. Write CALCULATE ( [Total Sales], ... ) instead.' },
      { text: 'An error', why: 'It is valid DAX: CALCULATE accepts any expression, including a variable. It just has nothing left to re-evaluate.' },
    ],
    learn: { href: '/docs/dax/variables#variables-with-calculate', label: 'Variables with CALCULATE' },
  },
  {
    id: 'sort-by-hidden-filter',
    level: 'Fix the bug',
    title: 'Share of year: 100% every month',
    setup:
      "A matrix has 'Date'[Month] on rows, and Month is sorted by 'Date'[Month Number]. Every month shows 100%.",
    code: "Share of Year =\nDIVIDE (\n    [Total Sales],\n    CALCULATE ( [Total Sales], ALL ( 'Date'[Month] ) )\n)",
    question: 'Which denominator fixes it?',
    options: [
      { text: "CALCULATE ( [Total Sales], ALLSELECTED ( 'Date'[Month] ) )", code: true, why: 'Still 100%. Like ALL on Month, it only touches the Month column.' },
      { text: "CALCULATE ( [Total Sales], REMOVEFILTERS ( 'Date'[Month], 'Date'[Month Number] ) )", code: true, correct: true, why: 'Because Month is sorted by Month Number, the visual groups by both columns behind the scenes. Clearing both (or the whole Date table) gives the real share.' },
      { text: "CALCULATE ( [Total Sales], ALL ( 'Date'[Month] ), 'Date'[Month] <> BLANK () )", code: true, why: 'Adding a filter can only narrow the result. The leftover filter on Month Number is still there.' },
    ],
    learn: { href: '/blog/sort-by-column-more-than-one-value-error', label: 'Sort by Column and its DAX side effect' },
  },
];
