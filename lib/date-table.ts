// Pure generation logic for the Date Table Generator tool. Every column is
// defined once with its DAX expression, its M expression, and a preview
// function that mirrors both, so the code and the preview can't drift apart.

export type WeekStart = 'monday' | 'sunday';
export type FiscalNaming = 'end' | 'start';
export type RangeMode = 'fixed' | 'fact';

export type ColumnGroup = 'dateKey' | 'labels' | 'day' | 'week' | 'fiscal' | 'relative';

export interface DateTableOptions {
  tableName: string;
  rangeMode: RangeMode;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  factTable: string;
  factColumn: string;
  groups: Record<ColumnGroup, boolean>;
  weekStart: WeekStart;
  fiscalStartMonth: number; // 1-12
  fiscalNaming: FiscalNaming;
}

export interface PreviewDay {
  date: Date; // UTC midnight
  y: number;
  m: number; // 1-12
  d: number;
  dowMon: number; // 0 = Monday … 6 = Sunday
}

type PreviewValue = string | number | boolean;

export interface ColumnSpec {
  name: string;
  dax: string;
  m: string;
  mType: string;
  sortBy?: string;
  preview: (day: PreviewDay, today: PreviewDay) => PreviewValue;
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_MS = 86_400_000;

export function toPreviewDay(date: Date): PreviewDay {
  return {
    date,
    y: date.getUTCFullYear(),
    m: date.getUTCMonth() + 1,
    d: date.getUTCDate(),
    dowMon: (date.getUTCDay() + 6) % 7,
  };
}

export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function dayOfYear(day: PreviewDay): number {
  return Math.round((day.date.getTime() - Date.UTC(day.y, 0, 1)) / DAY_MS) + 1;
}

function isoThursday(day: PreviewDay): PreviewDay {
  return toPreviewDay(addDays(day.date, 3 - day.dowMon));
}

function fiscalMonth(day: PreviewDay, fsm: number): number {
  return ((day.m - fsm + 12) % 12) + 1;
}

function fiscalYear(day: PreviewDay, fsm: number, naming: FiscalNaming): number {
  if (naming === 'end') return day.y + (fsm > 1 && day.m >= fsm ? 1 : 0);
  return day.y - (day.m < fsm ? 1 : 0);
}

// Always quote DAX table names: names like Date collide with function names
// and fail unquoted, and quoting is valid for every name.
export function daxTableRef(name: string): string {
  return `'${name.replace(/'/g, "''")}'`;
}

// M identifiers need #"..." unless they're a plain identifier.
export function mIdentifier(name: string): string {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : `#"${name.replace(/"/g, '""')}"`;
}

function escapeBracket(name: string): string {
  return name.replace(/]/g, ']]');
}

export function buildColumns(opts: DateTableOptions): ColumnSpec[] {
  const { groups, weekStart, fiscalNaming } = opts;
  const fsm = opts.fiscalStartMonth;
  const dowNumDax = weekStart === 'monday' ? 'WEEKDAY([Date], 2)' : 'WEEKDAY([Date], 1)';
  const mDay = weekStart === 'monday' ? 'Day.Monday' : 'Day.Sunday';
  const dowNum = (day: PreviewDay) => (weekStart === 'monday' ? day.dowMon + 1 : ((day.dowMon + 1) % 7) + 1);

  const cols: ColumnSpec[] = [];

  if (groups.dateKey) {
    cols.push({
      name: 'Date Key',
      dax: 'YEAR([Date]) * 10000 + MONTH([Date]) * 100 + DAY([Date])',
      m: 'Date.Year([Date]) * 10000 + Date.Month([Date]) * 100 + Date.Day([Date])',
      mType: 'Int64.Type',
      preview: (day) => day.y * 10000 + day.m * 100 + day.d,
    });
  }

  cols.push(
    {
      name: 'Year',
      dax: 'YEAR([Date])',
      m: 'Date.Year([Date])',
      mType: 'Int64.Type',
      preview: (day) => day.y,
    },
    {
      name: 'Quarter',
      dax: '"Q" & QUARTER([Date])',
      m: '"Q" & Text.From(Date.QuarterOfYear([Date]))',
      mType: 'type text',
      preview: (day) => `Q${Math.ceil(day.m / 3)}`,
    },
    {
      name: 'Month Number',
      dax: 'MONTH([Date])',
      m: 'Date.Month([Date])',
      mType: 'Int64.Type',
      preview: (day) => day.m,
    },
    {
      name: 'Month Name',
      dax: 'FORMAT([Date], "MMMM")',
      m: 'Date.MonthName([Date])',
      mType: 'type text',
      sortBy: 'Month Number',
      preview: (day) => MONTH_NAMES[day.m - 1],
    },
  );

  if (groups.labels) {
    cols.push(
      {
        name: 'Month Short',
        dax: 'FORMAT([Date], "MMM")',
        m: 'Text.Start(Date.MonthName([Date]), 3)',
        mType: 'type text',
        sortBy: 'Month Number',
        preview: (day) => MONTH_NAMES[day.m - 1].slice(0, 3),
      },
      {
        name: 'Year Month Sort',
        dax: 'YEAR([Date]) * 100 + MONTH([Date])',
        m: 'Date.Year([Date]) * 100 + Date.Month([Date])',
        mType: 'Int64.Type',
        preview: (day) => day.y * 100 + day.m,
      },
      {
        name: 'Month Year',
        dax: 'FORMAT([Date], "MMM YYYY")',
        m: 'Text.Start(Date.MonthName([Date]), 3) & " " & Text.From(Date.Year([Date]))',
        mType: 'type text',
        sortBy: 'Year Month Sort',
        preview: (day) => `${MONTH_NAMES[day.m - 1].slice(0, 3)} ${day.y}`,
      },
      {
        name: 'Year Quarter',
        dax: 'YEAR([Date]) & " Q" & QUARTER([Date])',
        m: 'Text.From(Date.Year([Date])) & " Q" & Text.From(Date.QuarterOfYear([Date]))',
        mType: 'type text',
        preview: (day) => `${day.y} Q${Math.ceil(day.m / 3)}`,
      },
    );
  }

  if (groups.day) {
    cols.push(
      {
        name: 'Day of Month',
        dax: 'DAY([Date])',
        m: 'Date.Day([Date])',
        mType: 'Int64.Type',
        preview: (day) => day.d,
      },
      {
        name: 'Day of Year',
        dax: 'DATEDIFF(DATE(YEAR([Date]), 1, 1), [Date], DAY) + 1',
        m: 'Date.DayOfYear([Date])',
        mType: 'Int64.Type',
        preview: dayOfYear,
      },
      {
        name: 'Day of Week Number',
        dax: dowNumDax,
        m: `Date.DayOfWeek([Date], ${mDay}) + 1`,
        mType: 'Int64.Type',
        preview: dowNum,
      },
      {
        name: 'Day Name',
        dax: 'FORMAT([Date], "DDDD")',
        m: 'Date.DayOfWeekName([Date])',
        mType: 'type text',
        sortBy: 'Day of Week Number',
        preview: (day) => DAY_NAMES[day.dowMon],
      },
      {
        name: 'Day Short',
        dax: 'FORMAT([Date], "DDD")',
        m: 'Text.Start(Date.DayOfWeekName([Date]), 3)',
        mType: 'type text',
        sortBy: 'Day of Week Number',
        preview: (day) => DAY_NAMES[day.dowMon].slice(0, 3),
      },
      {
        name: 'Is Weekend',
        dax: 'WEEKDAY([Date], 2) > 5',
        m: 'Date.DayOfWeek([Date], Day.Monday) >= 5',
        mType: 'type logical',
        preview: (day) => day.dowMon >= 5,
      },
    );
  }

  if (groups.week) {
    cols.push(
      {
        name: 'Week Start',
        dax: `[Date] - ${dowNumDax} + 1`,
        m: `Date.StartOfWeek([Date], ${mDay})`,
        mType: 'type date',
        preview: (day) => formatIsoDate(addDays(day.date, 1 - dowNum(day))),
      },
      {
        name: 'ISO Week',
        dax: 'WEEKNUM([Date], 21)',
        m: 'let Thursday = Date.AddDays([Date], 3 - Date.DayOfWeek([Date], Day.Monday)) in Number.IntegerDivide(Date.DayOfYear(Thursday) - 1, 7) + 1',
        mType: 'Int64.Type',
        preview: (day) => Math.floor((dayOfYear(isoThursday(day)) - 1) / 7) + 1,
      },
      {
        name: 'ISO Year',
        dax: 'YEAR([Date] - WEEKDAY([Date], 3) + 3)',
        m: 'Date.Year(Date.AddDays([Date], 3 - Date.DayOfWeek([Date], Day.Monday)))',
        mType: 'Int64.Type',
        preview: (day) => isoThursday(day).y,
      },
    );
  }

  if (groups.fiscal) {
    const fyDax =
      fiscalNaming === 'end'
        ? 'YEAR([Date]) + IF(FiscalStartMonth > 1 && MONTH([Date]) >= FiscalStartMonth, 1, 0)'
        : 'YEAR([Date]) - IF(MONTH([Date]) < FiscalStartMonth, 1, 0)';
    const fyM =
      fiscalNaming === 'end'
        ? 'Date.Year([Date]) + (if FiscalStartMonth > 1 and Date.Month([Date]) >= FiscalStartMonth then 1 else 0)'
        : 'Date.Year([Date]) - (if Date.Month([Date]) < FiscalStartMonth then 1 else 0)';
    const fiscalMonthDax = 'MOD(MONTH([Date]) - FiscalStartMonth + 12, 12) + 1';
    cols.push(
      {
        name: 'Fiscal Year',
        dax: fyDax,
        m: fyM,
        mType: 'Int64.Type',
        preview: (day) => fiscalYear(day, fsm, fiscalNaming),
      },
      {
        name: 'Fiscal Year Label',
        dax: `"FY" & (${fyDax})`,
        m: '"FY" & Text.From([Fiscal Year])',
        mType: 'type text',
        preview: (day) => `FY${fiscalYear(day, fsm, fiscalNaming)}`,
      },
      {
        name: 'Fiscal Month Number',
        dax: fiscalMonthDax,
        m: 'Number.Mod(Date.Month([Date]) - FiscalStartMonth + 12, 12) + 1',
        mType: 'Int64.Type',
        preview: (day) => fiscalMonth(day, fsm),
      },
      {
        name: 'Fiscal Quarter',
        dax: '"FQ" & (INT(MOD(MONTH([Date]) - FiscalStartMonth + 12, 12) / 3) + 1)',
        m: '"FQ" & Text.From(Number.IntegerDivide([Fiscal Month Number] - 1, 3) + 1)',
        mType: 'type text',
        preview: (day) => `FQ${Math.floor((fiscalMonth(day, fsm) - 1) / 3) + 1}`,
      },
    );
  }

  if (groups.relative) {
    cols.push(
      {
        name: 'Year Offset',
        dax: 'YEAR([Date]) - YEAR(TODAY())',
        m: 'Date.Year([Date]) - Date.Year(Today)',
        mType: 'Int64.Type',
        preview: (day, today) => day.y - today.y,
      },
      {
        name: 'Month Offset',
        dax: '(YEAR([Date]) - YEAR(TODAY())) * 12 + MONTH([Date]) - MONTH(TODAY())',
        m: '(Date.Year([Date]) - Date.Year(Today)) * 12 + Date.Month([Date]) - Date.Month(Today)',
        mType: 'Int64.Type',
        preview: (day, today) => (day.y - today.y) * 12 + day.m - today.m,
      },
      {
        name: 'Is Future',
        dax: '[Date] > TODAY()',
        m: '[Date] > Today',
        mType: 'type logical',
        preview: (day, today) => day.date.getTime() > today.date.getTime(),
      },
    );
  }

  return cols;
}

function dateLiteralDax(date: Date): string {
  return `DATE(${date.getUTCFullYear()}, ${date.getUTCMonth() + 1}, ${date.getUTCDate()})`;
}

function dateLiteralM(date: Date): string {
  return `#date(${date.getUTCFullYear()}, ${date.getUTCMonth() + 1}, ${date.getUTCDate()})`;
}

export function generateDax(opts: DateTableOptions): string {
  const cols = buildColumns(opts);
  const lines: string[] = [`${opts.tableName || 'Date'} =`];
  const fsm = opts.groups.fiscal ? opts.fiscalStartMonth : 1;

  if (opts.rangeMode === 'fact') {
    const ref = `${daxTableRef(opts.factTable || 'Sales')}[${escapeBracket(opts.factColumn || 'Order Date')}]`;
    lines.push(`VAR MinDate = MIN(${ref})`, `VAR MaxDate = MAX(${ref})`);
    if (fsm > 1) {
      lines.push(
        `VAR FiscalStartMonth = ${fsm} -- ${MONTH_NAMES[fsm - 1]}`,
        '-- Widen to whole fiscal years so year-to-date totals start and end cleanly',
        'VAR StartDate = DATE(YEAR(MinDate) - IF(MONTH(MinDate) < FiscalStartMonth, 1, 0), FiscalStartMonth, 1)',
        'VAR EndDate = EOMONTH(DATE(YEAR(MaxDate) + IF(MONTH(MaxDate) >= FiscalStartMonth, 1, 0), FiscalStartMonth, 1), -1)',
      );
    } else {
      lines.push(
        '-- Widen to whole calendar years so year-to-date totals start and end cleanly',
        'VAR StartDate = DATE(YEAR(MinDate), 1, 1)',
        'VAR EndDate = DATE(YEAR(MaxDate), 12, 31)',
      );
      if (opts.groups.fiscal) lines.push(`VAR FiscalStartMonth = ${fsm} -- ${MONTH_NAMES[fsm - 1]}`);
    }
  } else {
    const start = parseIsoDate(opts.startDate);
    const end = parseIsoDate(opts.endDate);
    lines.push(
      `VAR StartDate = ${start ? dateLiteralDax(start) : 'DATE(2020, 1, 1)'}`,
      `VAR EndDate = ${end ? dateLiteralDax(end) : 'DATE(2030, 12, 31)'}`,
    );
    if (opts.groups.fiscal) lines.push(`VAR FiscalStartMonth = ${fsm} -- ${MONTH_NAMES[fsm - 1]}`);
  }

  lines.push('RETURN', '    ADDCOLUMNS(', '        CALENDAR(StartDate, EndDate),');
  cols.forEach((col, i) => {
    lines.push(`        "${col.name}", ${col.dax}${i < cols.length - 1 ? ',' : ''}`);
  });
  lines.push('    )');
  return lines.join('\n');
}

export function generateM(opts: DateTableOptions): string {
  const cols = buildColumns(opts);
  const fsm = opts.groups.fiscal ? opts.fiscalStartMonth : 1;
  const lines: string[] = ['let'];

  if (opts.rangeMode === 'fact') {
    const ref = `${mIdentifier(opts.factTable || 'Sales')}[${escapeBracket(opts.factColumn || 'Order Date')}]`;
    lines.push(
      `    MinDate = Date.From(List.Min(${ref})),`,
      `    MaxDate = Date.From(List.Max(${ref})),`,
    );
    if (fsm > 1) {
      lines.push(
        `    FiscalStartMonth = ${fsm}, // ${MONTH_NAMES[fsm - 1]}`,
        '    // Widen to whole fiscal years so year-to-date totals start and end cleanly',
        '    StartDate = #date(Date.Year(MinDate) - (if Date.Month(MinDate) < FiscalStartMonth then 1 else 0), FiscalStartMonth, 1),',
        '    EndDate = Date.EndOfMonth(Date.AddMonths(#date(Date.Year(MaxDate) + (if Date.Month(MaxDate) >= FiscalStartMonth then 1 else 0), FiscalStartMonth, 1), -1)),',
      );
    } else {
      lines.push(
        '    // Widen to whole calendar years so year-to-date totals start and end cleanly',
        '    StartDate = #date(Date.Year(MinDate), 1, 1),',
        '    EndDate = #date(Date.Year(MaxDate), 12, 31),',
      );
      if (opts.groups.fiscal) lines.push(`    FiscalStartMonth = ${fsm}, // ${MONTH_NAMES[fsm - 1]}`);
    }
  } else {
    const start = parseIsoDate(opts.startDate);
    const end = parseIsoDate(opts.endDate);
    lines.push(
      `    StartDate = ${start ? dateLiteralM(start) : '#date(2020, 1, 1)'},`,
      `    EndDate = ${end ? dateLiteralM(end) : '#date(2030, 12, 31)'},`,
    );
    if (opts.groups.fiscal) lines.push(`    FiscalStartMonth = ${fsm}, // ${MONTH_NAMES[fsm - 1]}`);
  }

  if (opts.groups.relative) {
    lines.push('    // Evaluated at refresh time; in the Power BI service this is UTC', '    Today = Date.From(DateTime.LocalNow()),');
  }

  lines.push(
    '    DayCount = Duration.Days(EndDate - StartDate) + 1,',
    '    Dates = List.Dates(StartDate, DayCount, #duration(1, 0, 0, 0)),',
    '    Source = Table.FromColumns({Dates}, type table [Date = date]),',
  );

  let previous = 'Source';
  cols.forEach((col, i) => {
    const step = mIdentifier(`Added ${col.name}`);
    const last = i === cols.length - 1;
    lines.push(`    ${step} = Table.AddColumn(${previous}, "${col.name}", each ${col.m}, ${col.mType})${last ? '' : ','}`);
    previous = step;
  });

  lines.push('in', `    ${previous}`);
  return lines.join('\n');
}

export function sortByPairs(opts: DateTableOptions): { column: string; sortBy: string }[] {
  return buildColumns(opts)
    .filter((col) => col.sortBy)
    .map((col) => ({ column: col.name, sortBy: col.sortBy as string }));
}

// The year_end_date argument TOTALYTD/DATESYTD need for a fiscal year that
// ends the day before FiscalStartMonth begins, e.g. 7 -> "6/30".
export function fiscalYearEndArg(fsm: number): string {
  const endMonth = fsm === 1 ? 12 : fsm - 1;
  const lastDay = new Date(Date.UTC(2023, endMonth, 0)).getUTCDate(); // non-leap year on purpose
  return `${endMonth}/${lastDay}`;
}

