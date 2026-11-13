import { Activity, CalendarClock, CalendarDays, ChartColumnDecreasing, ChartLine, ChartScatter, Gauge, Grid3x3, Hash, ListChecks, ShieldAlert, SlidersHorizontal, Sparkles, SpellCheck, TrendingUp, type LucideIcon } from 'lucide-react';

// Shared by the /tools hub, the homepage tools section, and the nav's Tools menu.
export interface Tool {
  href: string;
  title: string;
  group: 'ai' | 'model' | 'engineering';
  // Engineering tools only: splits them into two columns in the nav's Tools menu.
  area?: 'project' | 'quality';
  description: string;
  badge: string;
  icon: LucideIcon;
  // Lucide file name of the same icon, for the server-rendered share image (lib/tool-og-image.tsx).
  iconName: string;
  ai?: boolean;
}

export const tools: Tool[] = [
  {
    href: '/tools/dax-formula-builder',
    group: 'ai',
    title: 'DAX Formula Builder',
    description:
      'Describe a calculation in plain English and get a working DAX measure or Power Query M step, with an explanation of every function it uses.',
    badge: 'AI · 5 free a day',
    icon: Sparkles,
    iconName: 'sparkles',
    ai: true,
  },
  {
    href: '/tools/dax-syntax-checker',
    group: 'model',
    title: 'DAX Syntax Checker',
    description:
      'Paste a formula that says "the syntax is incorrect" to see the real mistake marked in place: commas, parentheses, separators, smart quotes, and table names, with one-click fixes.',
    badge: 'Free · unlimited',
    icon: SpellCheck,
    iconName: 'spell-check',
  },
  {
    href: '/tools/date-table-generator',
    group: 'model',
    title: 'Date Table Generator',
    description:
      'A complete date table in DAX or Power Query M, with fiscal years, ISO weeks, day-of-week, and relative-date columns, plus a row preview.',
    badge: 'Free · unlimited',
    icon: CalendarDays,
    iconName: 'calendar-days',
  },
  {
    href: '/tools/time-intelligence-generator',
    group: 'model',
    title: 'Time Intelligence Generator',
    description:
      'YTD, prior year, YoY %, rolling 12 months, and running totals for any measure, as separate measures or one calculation group.',
    badge: 'Free · unlimited',
    icon: TrendingUp,
    iconName: 'trending-up',
  },
  {
    href: '/tools/format-string-builder',
    group: 'model',
    title: 'Format String Builder',
    description:
      'Custom format strings for K, M, and B, currency, percentages, and negatives in parentheses, checked against real values before you paste.',
    badge: 'Free · unlimited',
    icon: Hash,
    iconName: 'hash',
  },
  {
    href: '/tools/field-parameter-generator',
    group: 'model',
    title: 'Field Parameter Generator',
    description:
      'Let users pick which measure or column a visual shows: display names, sort order, and grouped options, with a slicer preview and a dynamic title.',
    badge: 'Free · unlimited',
    icon: SlidersHorizontal,
    iconName: 'sliders-horizontal',
  },
  {
    href: '/tools/evm-calculator',
    group: 'engineering',
    area: 'project',
    title: 'EVM Calculator',
    description:
      'BAC, PV, EV, and AC in; CPI, SPI, EAC, ETC, VAC, and TCPI out, with a plain-English status, three EAC methods compared, and the DAX.',
    badge: 'Free · unlimited',
    icon: Gauge,
    iconName: 'gauge',
  },
  {
    href: '/tools/schedule-risk-simulator',
    group: 'engineering',
    area: 'project',
    title: 'Schedule Risk Simulator',
    description:
      'Three-point estimates and predecessors in; a Monte Carlo S-curve, P50/P80/P90 finish dates, your odds on a target date, and task criticality out, with the DAX.',
    badge: 'Free · unlimited',
    icon: CalendarClock,
    iconName: 'calendar-clock',
  },
  {
    href: '/tools/reliability-calculator',
    group: 'engineering',
    area: 'quality',
    title: 'Reliability Calculator',
    description:
      'Paste a failure log or enter totals for MTBF, MTTR, availability, failure rate, and mission reliability, per asset, with the DAX.',
    badge: 'Free · unlimited',
    icon: Activity,
    iconName: 'activity',
  },
  {
    href: '/tools/weibull-analysis',
    group: 'engineering',
    area: 'quality',
    title: 'Weibull Analysis',
    description:
      'Paste failure and running-unit hours for Weibull β and η, B10 life, reliability at your replacement interval, a probability plot, and the DAX.',
    badge: 'Free · unlimited',
    icon: ChartScatter,
    iconName: 'chart-scatter',
  },
  {
    href: '/tools/control-chart-builder',
    group: 'engineering',
    area: 'quality',
    title: 'Control Chart Builder',
    description:
      'Paste measurements or defect counts for an I-MR, X-bar R, or p control chart with limits from a baseline, Western Electric rule signals, Cp/Cpk, and the DAX.',
    badge: 'Free · unlimited',
    icon: ChartLine,
    iconName: 'chart-line',
  },
  {
    href: '/tools/pareto-chart-builder',
    group: 'engineering',
    area: 'quality',
    title: 'Pareto Chart Builder',
    description:
      'Paste defect causes for a Pareto chart ranked by count or cost, the vital few that reach 80%, ties and "Other" handled, and the DAX for Power BI.',
    badge: 'Free · unlimited',
    icon: ChartColumnDecreasing,
    iconName: 'chart-column-decreasing',
  },
  {
    href: '/tools/risk-matrix-builder',
    group: 'engineering',
    area: 'project',
    title: 'Risk Matrix Builder',
    description:
      'Paste a risk register for a 5×5 heat map, scores, adjustable Critical/High/Medium bands, a ranked list, and the DAX with matrix cell colors.',
    badge: 'Free · unlimited',
    icon: Grid3x3,
    iconName: 'grid-3x3',
  },
  {
    href: '/tools/fmea-calculator',
    group: 'engineering',
    area: 'quality',
    title: 'FMEA Calculator',
    description:
      'Paste failure modes for RPNs and High/Medium/Low action priority, with a severity override that catches rare but serious failures, and the DAX.',
    badge: 'Free · unlimited',
    icon: ShieldAlert,
    iconName: 'shield-alert',
  },
  {
    href: '/tools/traceability-matrix-builder',
    group: 'engineering',
    area: 'project',
    title: 'Traceability Matrix Builder',
    description:
      'Paste requirements, trace links, and test results for a requirements traceability matrix, coverage and verified %, the untested gap list, and the DAX.',
    badge: 'Free · unlimited',
    icon: ListChecks,
    iconName: 'list-checks',
  },
];
