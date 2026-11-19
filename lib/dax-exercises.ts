// DAX practice exercises. Every exercise runs against the one small model
// below, so each answer can be worked out by hand from the tables on the page.
// Totals used throughout (keep in sync if the data changes):
//   all sales 1,600 · North 1,150 · South 450 · 2025 1,100 · 2026 500
//   Jan-25 350 · Feb-25 350 · Mar-25 400 · Jan-26 400 · Feb-26 100
//   Widget 1,000 · Gadget 450 · Gizmo 150 · Qty 16 (Widget 10 · Gadget 3 · Gizmo 3)
//   North Widget 600 · South Widget 400 · Hardware 1,450 · Jan (both years) 750 · Feb 450

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

export type Level = 'Beginner' | 'Filter context' | 'Iterators & ranking' | 'Time intelligence' | 'Fix the bug';
export const LEVELS: Level[] = ['Beginner', 'Filter context', 'Iterators & ranking', 'Time intelligence', 'Fix the bug'];

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

const CORE: Exercise[] = [
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
    learn: { href: '/blog/totals-dont-add-up', label: 'Why totals don\'t add up' },
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

// Added 2026-11-19. Answers worked by hand from the model above.
const MORE: Exercise[] = [
  // ---------------- Beginner ----------------
  {
    id: 'orders-over-200',
    level: 'Beginner',
    title: 'Counting big orders',
    setup: 'A card visual with no filters shows this measure.',
    code: 'Big Orders = COUNTROWS ( FILTER ( Sales, Sales[Amount] > 200 ) )',
    question: 'What does the card show?',
    options: [
      { text: '3', correct: true, why: 'Three orders are over 200: order 3 (300), order 5 (300), and order 7 (400). Order 1 is exactly 200, and > doesn\'t include it.' },
      { text: '4', why: 'That would be >= 200, which also counts order 1 at exactly 200.' },
      { text: '1,000', why: 'That is the total amount of those orders (300 + 300 + 400). COUNTROWS counts the rows, it doesn\'t add them up.' },
    ],
    learn: { href: '/docs/dax/filter', label: 'FILTER' },
  },
  {
    id: 'average-qty',
    level: 'Beginner',
    title: 'Average quantity',
    setup: 'A card visual with no filters shows this measure.',
    code: 'Avg Qty = AVERAGE ( Sales[Qty] )',
    question: 'What does the card show?',
    options: [
      { text: '2', correct: true, why: 'AVERAGE adds the eight Qty values (16) and divides by the number of rows (8): 2.' },
      { text: '5.33', why: 'That is 16 divided by the 3 products: an average per product. AVERAGE works per row of the column, not per product.' },
      { text: '16', why: 'That is SUM ( Sales[Qty] ). AVERAGE divides it by the row count.' },
    ],
    learn: { href: '/docs/dax/iterator', label: 'Aggregations and iterators' },
  },

  // ---------------- Filter context ----------------
  {
    id: 'filter-other-column',
    level: 'Filter context',
    title: 'A filter on a different column',
    setup: 'A table visual has Product[Product] on rows.',
    code: 'Hardware Sales =\nCALCULATE ( [Total Sales], Product[Category] = "Hardware" )',
    question: 'What does the Gizmo row show?',
    options: [
      { text: '1,450', why: 'That is all Hardware sales (Widget 1,000 + Gadget 450). But CALCULATE only replaces filters on the same column, Category. The row\'s filter on Product[Product] = Gizmo stays.' },
      { text: '150', why: 'That is Gizmo\'s own total. The Hardware filter still applies on top of it.' },
      { text: 'BLANK', correct: true, why: 'The row keeps Product = Gizmo, and CALCULATE adds Category = Hardware. Gizmo is Accessories, so no row matches both. Compare the CALCULATE exercise: replacing only happens on the same column.' },
    ],
    learn: { href: '/docs/dax/calculate', label: 'CALCULATE' },
  },
  {
    id: 'or-across-columns',
    level: 'Filter context',
    title: 'OR across two columns',
    setup: 'A card visual with no filters. Both columns are in the Sales table.',
    code: 'North or Widget =\nCALCULATE ( [Total Sales], Sales[Region] = "North" || Sales[Product] = "Widget" )',
    question: 'What does the card show?',
    options: [
      { text: '600', why: 'That is North AND Widget (orders 1 and 7). || means OR: an order qualifies if either condition is true.' },
      { text: '1,550', correct: true, why: 'All North orders (1,150) plus the Widget orders that aren\'t North: orders 3 and 6 in the South (300 + 100). 1,150 + 400 = 1,550.' },
      { text: 'An error', why: 'A filter argument can test several columns as long as they come from the same table, as Region and Product do here.' },
    ],
    learn: { href: '/docs/dax/filter-context', label: 'Filter context' },
  },
  {
    id: 'countrows-dimension',
    level: 'Filter context',
    title: 'Counting products by region',
    setup:
      'A table visual has Sales[Region] on rows. Product relates to Sales one-to-many, with the default single cross-filter direction.',
    code: 'Product Count = COUNTROWS ( Product )',
    question: 'What does the South row show?',
    options: [
      { text: '2', why: 'South did sell only two products (Widget and Gizmo), but the Region filter is on Sales, and filters flow from Product to Sales, not back.' },
      { text: '3', correct: true, why: 'The Region filter sits on the Sales table. With a single-direction relationship it can\'t reach Product, so COUNTROWS ( Product ) sees all three products on every row. To count products sold, use DISTINCTCOUNT ( Sales[Product] ).' },
      { text: '8', why: 'That is COUNTROWS ( Sales ) with no filter. This measure counts the Product table.' },
    ],
    learn: { href: '/docs/modeling/relationships', label: 'Relationships and filter direction' },
  },
  {
    id: 'allselected-share',
    level: 'Filter context',
    title: 'Share of the selection',
    setup:
      'A table visual has Product[Product] on rows. A slicer on Product[Product] has Widget and Gadget selected, so Gizmo isn\'t shown.',
    code: '% of Selected =\nDIVIDE (\n    [Total Sales],\n    CALCULATE ( [Total Sales], ALLSELECTED ( Product[Product] ) )\n)',
    question: 'What does the Widget row show?',
    options: [
      { text: '62.5%', why: 'That is 1,000 / 1,600, what ALL ( Product[Product] ) would give: it ignores the slicer too.' },
      { text: '69.0%', correct: true, why: 'ALLSELECTED removes the row\'s filter but keeps the slicer\'s selection, so the denominator is Widget + Gadget: 1,450. 1,000 / 1,450 = 69.0%, and the visible rows add up to 100%.' },
      { text: '100%', why: 'That would mean the row filter survived. ALLSELECTED removes it, back to what the slicer allows.' },
    ],
    learn: { href: '/docs/dax/filter-functions', label: 'ALL, ALLSELECTED, and REMOVEFILTERS' },
  },

  // ---------------- Iterators & ranking ----------------
  {
    id: 'filter-sum-no-transition',
    level: 'Iterators & ranking',
    title: 'Products with big sales',
    setup: 'A card visual with no filters. The author wants the number of products with more than 400 in sales.',
    code: 'Big Products =\nCOUNTROWS (\n    FILTER ( VALUES ( Product[Product] ), SUM ( Sales[Amount] ) > 400 )\n)',
    question: 'What does the card show?',
    options: [
      { text: '2', why: 'That is the intended answer (Widget 1,000 and Gadget 450). It needs [Total Sales] instead of SUM, so each product is evaluated on its own.' },
      { text: '3', correct: true, why: 'FILTER gives a row context, not a filter context, and a bare SUM ignores row context. It returns 1,600 for every product, so all three pass. Writing [Total Sales] triggers context transition and gives 2.' },
      { text: '0', why: 'The condition isn\'t evaluated per product at all, so it doesn\'t fail for everyone: 1,600 > 400 is true every time.' },
    ],
    learn: { href: '/docs/dax/row-context', label: 'Row context and context transition' },
  },
  {
    id: 'sumx-sum-no-transition',
    level: 'Iterators & ranking',
    title: 'SUMX over products',
    setup: 'A card visual with no filters.',
    code: 'Sales by Product = SUMX ( Product, SUM ( Sales[Amount] ) )',
    question: 'What does the card show?',
    options: [
      { text: '1,600', why: 'That is what SUMX ( Product, [Total Sales] ) returns: the measure reference filters each product\'s sales. A bare SUM doesn\'t.' },
      { text: '4,800', correct: true, why: 'SUMX walks the three products, but SUM ignores the row context, so it returns all sales (1,600) each time. 3 × 1,600 = 4,800.' },
      { text: '1,000', why: 'That is Widget\'s sales. SUMX adds a value for every product, and here each value is the full 1,600.' },
    ],
    learn: { href: '/docs/dax/sumx', label: 'SUMX' },
  },
  {
    id: 'rankx-no-all',
    level: 'Iterators & ranking',
    title: 'A rank that\'s always 1',
    setup: 'A table visual has Product[Product] on rows.',
    code: 'Sales Rank = RANKX ( Product, [Total Sales] )',
    question: 'What does the Gadget row show?',
    options: [
      { text: '2', why: 'Gadget is second by sales (Widget 1,000, Gadget 450, Gizmo 150), and RANKX ( ALL ( Product ), [Total Sales] ) would say so.' },
      { text: '1', correct: true, why: 'On the Gadget row, the Product table is filtered to Gadget, so RANKX ranks Gadget against a list containing only itself. Every row shows 1. Rank against ALL ( Product ) or ALLSELECTED ( Product ).' },
      { text: '3', why: 'That would be ranking ascending among all three. The problem is the comparison list: it holds one product.' },
    ],
    learn: { href: '/docs/dax/rankx', label: 'RANKX' },
  },
  {
    id: 'maxx-month-names',
    level: 'Iterators & ranking',
    title: 'The best month',
    setup:
      "A card visual with no filters. 'Date'[Month] holds the month name (January, February, ...), with no year.",
    code: "Best Month Sales = MAXX ( VALUES ( 'Date'[Month] ), [Total Sales] )",
    question: 'What does the card show?',
    options: [
      { text: '400', why: 'That is the best single month (March 2025, or January 2026). But a month name has no year in it.' },
      { text: '750', correct: true, why: 'VALUES ( \'Date\'[Month] ) gives twelve month names, and each one covers both years. January is 350 (2025) + 400 (2026) = 750, the highest. Iterate over a year-and-month column to get real months.' },
      { text: '1,600', why: 'That would be a SUMX over the months. MAXX takes the largest single value.' },
    ],
    learn: { href: '/docs/dax/iterator', label: 'Iterator functions' },
  },
  {
    id: 'averagex-per-product',
    level: 'Iterators & ranking',
    title: 'Average sales per product',
    setup: 'A card visual with no filters.',
    code: 'Avg per Product = AVERAGEX ( VALUES ( Sales[Product] ), [Total Sales] )',
    question: 'What does the card show?',
    options: [
      { text: '200', why: 'That is AVERAGE ( Sales[Amount] ): the average order. AVERAGEX here averages one value per product.' },
      { text: '533.3', correct: true, why: 'Three products: Widget 1,000, Gadget 450, Gizmo 150. (1,000 + 450 + 150) / 3 = 533.3.' },
      { text: '1,600', why: 'That is the total. AVERAGEX divides the per-product totals by the number of products.' },
    ],
    learn: { href: '/docs/dax/iterator', label: 'Iterator functions' },
  },

  // ---------------- Time intelligence ----------------
  {
    id: 'dateadd-previous-month',
    level: 'Time intelligence',
    title: 'The previous month',
    setup: "A matrix has 'Date'[Year] and 'Date'[Month] on rows.",
    code: "Sales PM =\nCALCULATE ( [Total Sales], DATEADD ( 'Date'[Date], -1, MONTH ) )",
    question: 'What does the January 2026 row show?',
    options: [
      { text: '400', why: 'That is March 2025, the last month that had sales. DATEADD moves by calendar months, not to the previous month with data.' },
      { text: 'BLANK', correct: true, why: 'One month before January 2026 is December 2025, and there were no sales in December 2025.' },
      { text: '350', why: 'That is January 2025, a year earlier. -1, MONTH moves back one month.' },
    ],
    learn: { href: '/docs/dax/dateadd-parallelperiod', label: 'DATEADD and PARALLELPERIOD' },
  },
  {
    id: 'ytd-new-year',
    level: 'Time intelligence',
    title: 'Year-to-date in a new year',
    setup: 'Same matrix, by Year and Month.',
    code: "Sales YTD = TOTALYTD ( [Total Sales], 'Date'[Date] )",
    question: 'What does the January 2026 row show?',
    options: [
      { text: '1,500', why: 'That is a running total across both years (1,100 + 400). TOTALYTD starts again every 1 January.' },
      { text: '400', correct: true, why: 'Year-to-date for January 2026 runs from 1 January 2026: just January\'s 400.' },
      { text: '750', why: 'That is January across both years. YTD stays within one year.' },
    ],
    learn: { href: '/docs/dax/time-intelligence#year-to-date-ytd', label: 'Year-to-date' },
  },
  {
    id: 'sply-partial-year',
    level: 'Time intelligence',
    title: 'Last year, on a year that\'s not over',
    setup: 'Same matrix. The data stops in February 2026. Look at the 2026 subtotal.',
    code: "Sales LY =\nCALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )",
    question: 'What does the 2026 subtotal show for Sales LY?',
    options: [
      { text: '700', why: 'That is January and February 2025, which would be a fair comparison with two months of 2026. SAMEPERIODLASTYEAR shifts every date in the filter, and the 2026 row includes all of 2026.' },
      { text: '1,100', correct: true, why: 'The 2026 row covers every day of 2026, so last year is every day of 2025: 1,100. Against 2026 sales of 500, it looks like a drop of about 55%. To compare like with like, limit the dates to those with data.' },
      { text: '500', why: 'That is 2026\'s own sales. Sales LY looks at 2025.' },
    ],
    learn: { href: '/docs/dax/time-intelligence#previous-year-sales', label: 'Previous year sales' },
  },

  // ---------------- Fix the bug ----------------
  {
    id: 'case-insensitive',
    level: 'Fix the bug',
    title: 'Lowercase in a filter',
    setup: 'A card with no filters. The product is spelled "Widget" in the data, but the measure says "widget".',
    code: 'Widget Sales =\nCALCULATE ( [Total Sales], Product[Product] = "widget" )',
    question: 'What does the card show?',
    options: [
      { text: 'BLANK, because nothing matches "widget"', why: 'DAX text comparisons ignore case, so "widget" matches "Widget". There\'s no bug here after all.' },
      { text: '1,000', correct: true, why: 'The = comparison in DAX is case-insensitive, so it matches Widget: 200 + 300 + 100 + 400 = 1,000. (Use EXACT when case matters.)' },
      { text: 'An error', why: 'A text comparison in a filter is fine. The only question is case, and DAX ignores it.' },
    ],
    learn: { href: '/docs/dax/calculate', label: 'CALCULATE' },
  },
  {
    id: 'if-never-blank',
    level: 'Fix the bug',
    title: 'Products that won\'t go away',
    setup:
      "A table visual has Product[Product] and this measure. A slicer is set to 'Date'[Year] = 2026. The author expected only products with 2026 sales.",
    code: 'Status = IF ( [Total Sales] > 0, "Active", "None" )',
    question: 'How many rows does the table show?',
    options: [
      { text: '2', why: 'Only Widget and Gizmo sold in 2026. But the measure never returns BLANK, so Gadget gets a row too.' },
      { text: '3', correct: true, why: 'A visual hides a row only when every measure is blank. Gadget has no 2026 sales, but Status returns "None" instead of blank, so it shows. Drop the third argument, and IF returns BLANK for Gadget.' },
      { text: '8', why: 'The rows come from Product[Product], three products. The question is whether Gadget is hidden.' },
    ],
    learn: { href: '/docs/dax/blank-vs-zero', label: 'BLANK vs 0' },
  },
  {
    id: 'selectedvalue-total',
    level: 'Fix the bug',
    title: 'A total that disappears',
    setup: 'A table visual has Product[Product] on rows, with a total row.',
    code: 'Revenue =\nSUM ( Sales[Qty] ) * SELECTEDVALUE ( Product[Price] )',
    question: 'What does the total row show?',
    options: [
      { text: '1,600', why: 'That is the sum of the rows (1,000 + 450 + 150). A total row doesn\'t add the rows up; it evaluates the measure again for all products.' },
      { text: 'BLANK', correct: true, why: 'On the total row there are three prices, so SELECTEDVALUE returns BLANK, and 16 × BLANK is BLANK. Use SUMX ( Sales, Sales[Qty] * RELATED ( Product[Price] ) ), which works per order and totals correctly.' },
      { text: '4,800', why: 'That would be 16 × the sum of the prices (300). SELECTEDVALUE never adds values; with more than one, it gives up.' },
    ],
    learn: { href: '/blog/totals-dont-add-up', label: 'Why totals don\'t add up' },
  },
];

// Sorted by level, keeping the original order within each level.
export const EXERCISES: Exercise[] = [...CORE, ...MORE].sort(
  (a, b) => LEVELS.indexOf(a.level as Level) - LEVELS.indexOf(b.level as Level),
);
