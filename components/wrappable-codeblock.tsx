'use client';

import { useState, type ComponentProps, type MouseEvent } from 'react';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { Sparkles, WrapText } from 'lucide-react';
import { cn } from '@/lib/cn';
import { askAi, buildAskAiPrompt } from '@/lib/ask-ai-events';

function CodeBlockImpl({
  showAskAi,
  ...props
}: ComponentProps<typeof CodeBlock> & { showAskAi: boolean }) {
  const [wrap, setWrap] = useState(false);

  // Reads from the live DOM (.innerText, not .textContent) rather than
  // walking the JSX children tree: Shiki's line-numbered output wraps each
  // line in its own block-level <span>, with layout (not literal "\n"
  // characters) producing the line breaks -- .innerText is CSS-aware and
  // reconstructs them correctly; a text-tree walk silently squashes every
  // line onto one, which was verified against a real multi-line example
  // before landing on this approach.
  function askAiAboutThis(e: MouseEvent<HTMLButtonElement>) {
    const pre = e.currentTarget.closest('figure')?.querySelector('pre');
    const code = (pre?.innerText ?? '').replace(/\n+$/, '');
    askAi(buildAskAiPrompt('Explain this code:\n\n```\n', code, '\n```'));
  }

  return (
    <CodeBlock
      {...props}
      data-wrap={wrap || undefined}
      Actions={({ className, children }) => (
        <div className={cn('flex items-center gap-1', className)}>
          <button
            type="button"
            aria-label={wrap ? 'Disable line wrap' : 'Enable line wrap'}
            aria-pressed={wrap}
            data-checked={wrap || undefined}
            onClick={() => setWrap((w) => !w)}
            className="inline-flex items-center justify-center rounded-md p-1 text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground data-checked:text-fd-primary"
          >
            <WrapText className="size-3.5" />
          </button>
          {showAskAi && (
            <button
              type="button"
              aria-label="Ask AI about this code"
              onClick={askAiAboutThis}
              className="inline-flex items-center justify-center rounded-md p-1 text-fd-muted-foreground transition-colors hover:text-fd-primary"
            >
              <Sparkles className="size-3.5" />
            </button>
          )}
          {children}
        </div>
      )}
    >
      <Pre>{props.children}</Pre>
    </CodeBlock>
  );
}

export function WrappableCodeBlock(props: ComponentProps<typeof CodeBlock>) {
  return <CodeBlockImpl {...props} showAskAi={false} />;
}

// Opt-in variant, used on docs, blog, and tutorial pages -- everywhere an
// AskAi instance is actually mounted to listen for the event this dispatches.
// Not the default: rendering this icon on a page with no AskAi mounted would
// be a dead button with nothing listening, so each route passes it in
// explicitly via getMDXComponents({ pre: DocsCodeBlock }) rather than it
// being registered as the sitewide default.
export function DocsCodeBlock(props: ComponentProps<typeof CodeBlock>) {
  return <CodeBlockImpl {...props} showAskAi={true} />;
}
