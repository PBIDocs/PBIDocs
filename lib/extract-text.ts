import type { ReactNode } from 'react';

/**
 * Recursively concatenates the text content of a React node tree. Used both
 * for structured-data extraction (tutorial HowTo steps) and for pulling the
 * raw source text back out of a syntax-highlighted code block, whose
 * rendered tree is just nested <span> tokens around the original text.
 */
export function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return extractText(props?.children);
  }
  return '';
}
