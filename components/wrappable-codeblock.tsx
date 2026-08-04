'use client';

import { useState, type ComponentProps } from 'react';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { WrapText } from 'lucide-react';
import { cn } from '@/lib/cn';

export function WrappableCodeBlock(props: ComponentProps<typeof CodeBlock>) {
  const [wrap, setWrap] = useState(false);

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
          {children}
        </div>
      )}
    >
      <Pre>{props.children}</Pre>
    </CodeBlock>
  );
}
