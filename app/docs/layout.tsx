import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import type { LayoutTab } from 'fumadocs-ui/layouts/shared';
import { baseOptions } from '@/lib/layout.shared';

// Curated tab groups -- our 10 top-level doc categories collapsed into 5
// tabs by content weight/relatedness, rather than one tab per category
// (which would crowd/wrap a navbar-style tab row). Each tab's `urls` set is
// every actual page URL under its member folders, computed from the real
// page list below -- so tab-active-highlighting works correctly without
// requiring any change to the underlying folder/URL structure.
const TAB_GROUPS: { title: string; folders: string[]; landing: string }[] = [
  { title: 'Get Started', folders: ['getting-started', 'ai-power-bi'], landing: '/docs/getting-started/introduction' },
  { title: 'DAX', folders: ['dax', 'dax-patterns'], landing: '/docs/dax/introduction' },
  { title: 'Power Query', folders: ['power-query'], landing: '/docs/power-query/introduction' },
  { title: 'Modeling & Visuals', folders: ['modeling', 'visuals'], landing: '/docs/modeling/introduction' },
  { title: 'Service & Governance', folders: ['power-bi-service', 'fabric', 'governance'], landing: '/docs/power-bi-service/workspaces' },
];

function buildTabs(): LayoutTab[] {
  const pages = source.getPages();

  return TAB_GROUPS.map((group) => {
    const urls = new Set(
      pages
        .filter((page) =>
          group.folders.some((folder) => page.url === `/docs/${folder}` || page.url.startsWith(`/docs/${folder}/`)),
        )
        .map((page) => page.url),
    );

    return {
      title: group.title,
      url: group.landing,
      urls,
    };
  });
}

export default function Layout({ children }: LayoutProps<'/docs'>) {
  const { nav, ...rest } = baseOptions();

  return (
    <DocsLayout
      tree={source.getPageTree()}
      tabs={buildTabs()}
      tabMode="navbar"
      nav={nav}
      {...rest}
    >
      {children}
    </DocsLayout>
  );
}
