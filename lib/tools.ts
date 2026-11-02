import { CalendarDays, Hash, Sparkles, TrendingUp, type LucideIcon } from 'lucide-react';

// Shared by the /tools hub and the homepage tools section.
export interface Tool {
  href: string;
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  ai?: boolean;
}

export const tools: Tool[] = [
  {
    href: '/tools/dax-formula-builder',
    title: 'DAX Formula Builder',
    description:
      'Describe a calculation in plain English and get a working DAX measure or Power Query M step, with an explanation of every function it uses.',
    badge: 'AI · 5 free a day',
    icon: Sparkles,
    ai: true,
  },
  {
    href: '/tools/date-table-generator',
    title: 'Date Table Generator',
    description:
      'A complete date table in DAX or Power Query M, with fiscal years, ISO weeks, day-of-week, and relative-date columns, plus a row preview.',
    badge: 'Free · unlimited',
    icon: CalendarDays,
  },
  {
    href: '/tools/time-intelligence-generator',
    title: 'Time Intelligence Generator',
    description:
      'YTD, prior year, YoY %, rolling 12 months, and running totals for any measure, as separate measures or one calculation group.',
    badge: 'Free · unlimited',
    icon: TrendingUp,
  },
  {
    href: '/tools/format-string-builder',
    title: 'Format String Builder',
    description:
      'Custom format strings for K, M, and B, currency, percentages, and negatives in parentheses, checked against real values before you paste.',
    badge: 'Free · unlimited',
    icon: Hash,
  },
];
