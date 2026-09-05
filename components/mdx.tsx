import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { WrappableCodeBlock } from './wrappable-codeblock';
import { DividePlayground } from './divide-playground';
import { IfPlayground } from './if-playground';
import { SwitchPlayground } from './switch-playground';
import { TextMiddlePlayground } from './text-middle-playground';
import { TextSplitPlayground } from './text-split-playground';
import { DateAddMonthsPlayground } from './date-addmonths-playground';
import { TextContainsPlayground } from './text-contains-playground';
import { TextTrimPlayground } from './text-trim-playground';
import { TryOtherwisePlayground } from './try-otherwise-playground';
import { NumberRoundPlayground } from './number-round-playground';
import { DateLocalePlayground } from './date-locale-playground';
import { CsvPromoteHeadersPlayground } from './csv-promote-headers-playground';
import { TableSplitColumnPlayground } from './table-splitcolumn-playground';
import { TableSortPlayground } from './table-sort-playground';
import { TableDistinctPlayground } from './table-distinct-playground';
import { TableAddIndexColumnPlayground } from './table-addindexcolumn-playground';
import { NumberLocalePlayground } from './number-locale-playground';
import { CustomErrorPlayground } from './custom-error-playground';
import { NumberToTextPlayground } from './number-totext-playground';
import { NullEqualityPlayground } from './null-equality-playground';
import { TableSelectColumnsPlayground } from './table-selectcolumns-playground';
import { TableFirstNPlayground } from './table-firstn-playground';
import { LocalVsUtcPlayground } from './local-vs-utc-playground';
import { ListDistinctContainsPlayground } from './list-distinct-contains-playground';
import { DaxMidPlayground } from './dax-mid-playground';
import { BlankEqualityPlayground } from './blank-equality-playground';
import { DaxTrimPlayground } from './dax-trim-playground';
import { DateDiffPlayground } from './datediff-playground';
import { CalendarAutoPlayground } from './calendarauto-playground';
import { DateAddParallelPeriodPlayground } from './dateadd-parallelperiod-playground';
import { UnionPlayground } from './union-playground';
import { TodayNowPlayground } from './today-now-playground';
import { KeepFiltersPlayground } from './keepfilters-playground';
import { ValuesDistinctPlayground } from './values-distinct-playground';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    pre: WrappableCodeBlock,
    DividePlayground,
    IfPlayground,
    SwitchPlayground,
    TextMiddlePlayground,
    TextSplitPlayground,
    DateAddMonthsPlayground,
    TextContainsPlayground,
    TextTrimPlayground,
    TryOtherwisePlayground,
    NumberRoundPlayground,
    DateLocalePlayground,
    CsvPromoteHeadersPlayground,
    TableSplitColumnPlayground,
    TableSortPlayground,
    TableDistinctPlayground,
    TableAddIndexColumnPlayground,
    NumberLocalePlayground,
    CustomErrorPlayground,
    NumberToTextPlayground,
    NullEqualityPlayground,
    TableSelectColumnsPlayground,
    TableFirstNPlayground,
    LocalVsUtcPlayground,
    ListDistinctContainsPlayground,
    DaxMidPlayground,
    BlankEqualityPlayground,
    DaxTrimPlayground,
    DateDiffPlayground,
    CalendarAutoPlayground,
    DateAddParallelPeriodPlayground,
    UnionPlayground,
    TodayNowPlayground,
    KeepFiltersPlayground,
    ValuesDistinctPlayground,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
