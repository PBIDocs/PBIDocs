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
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
