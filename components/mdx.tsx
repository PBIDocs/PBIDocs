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
import { AddColumnsSelectColumnsPlayground } from './addcolumns-selectcolumns-playground';
import { CrossFilterPlayground } from './crossfilter-playground';
import { IfErrorPlayground } from './iferror-playground';
import { AllSelectedPlayground } from './allselected-playground';
import { MergeJoinKindPlayground } from './merge-join-kind-playground';
import { TableGroupPlayground } from './table-group-playground';
import { UnpivotOtherColumnsPlayground } from './unpivot-other-columns-playground';
import { RankxTiesPlayground } from './rankx-ties-playground';
import { TopNTiesPlayground } from './topn-ties-playground';
import { UserRelationshipPlayground } from './userelationship-playground';
import { LookupValuePlayground } from './lookupvalue-playground';
import { RelatedTablePlayground } from './relatedtable-playground';
import { TableReplaceValuePlayground } from './table-replacevalue-playground';
import { DistinctCountBlankPlayground } from './distinctcount-blank-playground';
import { CountRowsCountCountaPlayground } from './countrows-count-counta-playground';
import { SumXPlayground } from './sumx-playground';
import { SelectedValuePlayground } from './selectedvalue-playground';
import { TableSelectRowsPlayground } from './table-selectrows-playground';
import { TableAddColumnPlayground } from './table-addcolumn-playground';
import { TableTransformColumnsPlayground } from './table-transformcolumns-playground';
import { EarlierPlayground } from './earlier-playground';
import { CalculatePercentOfTotalPlayground } from './calculate-percent-of-total-playground';
import { FilterAboveAveragePlayground } from './filter-above-average-playground';
import { ListAccumulatePlayground } from './list-accumulate-playground';
import { ListGenerateOffByOnePlayground } from './list-generate-offbyone-playground';
import { CountXBlankPlayground } from './countx-blank-playground';
import { SortByColumnPlayground } from './sort-by-column-playground';
import { ListTransformVsAddColumnPlayground } from './list-transform-vs-addcolumn-playground';
import { CalculatedTableRefreshPlayground } from './calculated-table-refresh-playground';
import { CrossFilterVisualsPlayground } from './crossfilter-visuals-playground';
import { RunningTotalPlayground } from './running-total-playground';
import { TransformColumnTypesVsTransformColumnsPlayground } from './transformcolumntypes-vs-transformcolumns-playground';
import { RecursiveFactorialPlayground } from './recursive-factorial-playground';
import { AppendColumnMismatchPlayground } from './append-column-mismatch-playground';
import { CalculateVsCalculateTablePlayground } from './calculate-vs-calculatetable-playground';
import { MeasureDependencyChainPlayground } from './measure-dependency-chain-playground';
import { UdfValExprPlayground } from './udf-val-expr-playground';
import { QueryFoldingOrderPlayground } from './query-folding-order-playground';
import { TableBufferPlayground } from './table-buffer-playground';
import { SummarizeGroupingPlayground } from './summarize-grouping-playground';
import { StarSchemaDiagram } from './star-schema-diagram';
import { LookupValueAnatomyDiagram } from './lookupvalue-anatomy-diagram';
import { SwitchAnatomyDiagram } from './switch-anatomy-diagram';
import { RelatedAnatomyDiagram } from './related-anatomy-diagram';
import { SelectRowsAnatomyDiagram } from './selectrows-anatomy-diagram';
import { MCaseSensitivityPlayground } from './m-case-sensitivity-playground';
import { RelationshipAnatomyDiagram } from './relationship-anatomy-diagram';
import { BridgeTableAnatomyDiagram } from './bridge-table-anatomy-diagram';
import { ManyToManyAnatomyDiagram } from './many-to-many-anatomy-diagram';
import { ScdAnatomyDiagram } from './scd-anatomy-diagram';
import { CompositeModelAnatomyDiagram } from './composite-model-anatomy-diagram';
import { AggregationAnatomyDiagram } from './aggregation-anatomy-diagram';
import { CalculateAnatomyDiagram } from './calculate-anatomy-diagram';
import { EvmAnatomyDiagram } from './evm-anatomy-diagram';
import { SumXAnatomyDiagram } from './sumx-anatomy-diagram';
import { FilterAnatomyDiagram } from './filter-anatomy-diagram';
import { ContextTransitionAnatomyDiagram } from './context-transition-anatomy-diagram';
import { AllFunctionsAnatomyDiagram } from './all-functions-anatomy-diagram';
import { RankxAnatomyDiagram } from './rankx-anatomy-diagram';
import { RiskMatrixAnatomyDiagram } from './risk-matrix-anatomy-diagram';
import { FmeaAnatomyDiagram } from './fmea-anatomy-diagram';
import { ReliabilityAnatomyDiagram } from './reliability-anatomy-diagram';
import { TraceabilityAnatomyDiagram } from './traceability-anatomy-diagram';
import { MergeAnatomyDiagram } from './merge-anatomy-diagram';
import { UnpivotAnatomyDiagram } from './unpivot-anatomy-diagram';
import { TimeIntelligenceAnatomyDiagram } from './time-intelligence-anatomy-diagram';
import { RunningTotalAnatomyDiagram } from './running-total-anatomy-diagram';
import { PercentOfTotalAnatomyDiagram } from './percent-of-total-anatomy-diagram';
import { RlsMatrixAnatomyDiagram } from './rls-matrix-anatomy-diagram';
import { VariablesAnatomyDiagram } from './variables-anatomy-diagram';
import { DateTableAnatomyDiagram } from './date-table-anatomy-diagram';

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
    AddColumnsSelectColumnsPlayground,
    CrossFilterPlayground,
    IfErrorPlayground,
    AllSelectedPlayground,
    MergeJoinKindPlayground,
    TableGroupPlayground,
    UnpivotOtherColumnsPlayground,
    RankxTiesPlayground,
    TopNTiesPlayground,
    UserRelationshipPlayground,
    LookupValuePlayground,
    RelatedTablePlayground,
    TableReplaceValuePlayground,
    DistinctCountBlankPlayground,
    CountRowsCountCountaPlayground,
    SumXPlayground,
    SelectedValuePlayground,
    TableSelectRowsPlayground,
    TableAddColumnPlayground,
    TableTransformColumnsPlayground,
    EarlierPlayground,
    CalculatePercentOfTotalPlayground,
    FilterAboveAveragePlayground,
    ListAccumulatePlayground,
    ListGenerateOffByOnePlayground,
    CountXBlankPlayground,
    SortByColumnPlayground,
    ListTransformVsAddColumnPlayground,
    CalculatedTableRefreshPlayground,
    CrossFilterVisualsPlayground,
    RunningTotalPlayground,
    TransformColumnTypesVsTransformColumnsPlayground,
    RecursiveFactorialPlayground,
    AppendColumnMismatchPlayground,
    CalculateVsCalculateTablePlayground,
    MeasureDependencyChainPlayground,
    UdfValExprPlayground,
    QueryFoldingOrderPlayground,
    TableBufferPlayground,
    SummarizeGroupingPlayground,
    StarSchemaDiagram,
    LookupValueAnatomyDiagram,
    SwitchAnatomyDiagram,
    RelatedAnatomyDiagram,
    SelectRowsAnatomyDiagram,
    MCaseSensitivityPlayground,
    RelationshipAnatomyDiagram,
    BridgeTableAnatomyDiagram,
    ManyToManyAnatomyDiagram,
    ScdAnatomyDiagram,
    CompositeModelAnatomyDiagram,
    AggregationAnatomyDiagram,
    CalculateAnatomyDiagram,
    EvmAnatomyDiagram,
    SumXAnatomyDiagram,
    FilterAnatomyDiagram,
    ContextTransitionAnatomyDiagram,
    AllFunctionsAnatomyDiagram,
    RankxAnatomyDiagram,
    RiskMatrixAnatomyDiagram,
    FmeaAnatomyDiagram,
    ReliabilityAnatomyDiagram,
    TraceabilityAnatomyDiagram,
    MergeAnatomyDiagram,
    UnpivotAnatomyDiagram,
    TimeIntelligenceAnatomyDiagram,
    RunningTotalAnatomyDiagram,
    PercentOfTotalAnatomyDiagram,
    RlsMatrixAnatomyDiagram,
    VariablesAnatomyDiagram,
    DateTableAnatomyDiagram,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
