import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { DocsHeader, EmptyNavTitle } from '@/components/docs-header';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <>
      <DocsHeader />
      <DocsLayout
        tree={source.getPageTree()}
        {...baseOptions()}
        links={[]}
        themeSwitch={{ enabled: false }}
        searchToggle={{ enabled: false }}
        slots={{ navTitle: EmptyNavTitle }}
      >
        {children}
      </DocsLayout>
    </>
  );
}
