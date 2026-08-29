'use client';

import type { TOCItemType } from 'fumadocs-core/toc';
import { TOCProvider, TOCScrollArea, useTOCItems } from 'fumadocs-ui/components/toc';
import { TOCItem, TOCItems } from 'fumadocs-ui/components/toc/default';
import { Text } from 'lucide-react';

function PageTocList() {
  const items = useTOCItems();

  return (
    <TOCItems>
      {items.map((item) => (
        <TOCItem key={item.url} item={item} />
      ))}
    </TOCItems>
  );
}

export function PageToc({ toc }: { toc: TOCItemType[] }) {
  if (toc.length === 0) return null;

  return (
    <TOCProvider toc={toc}>
      <h3 className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground">
        <Text className="size-4" />
        On this page
      </h3>
      <TOCScrollArea>
        <PageTocList />
      </TOCScrollArea>
    </TOCProvider>
  );
}
