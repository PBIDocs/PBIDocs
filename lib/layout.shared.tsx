import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Logo } from '@/components/logo';
import { GitHubIcon } from '@/components/github-icon';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Logo className="size-5" />
          {appName}
        </>
      ),
    },
    links: [
      { text: 'Docs', url: '/docs' },
      { text: 'Tutorials', url: '/tutorials' },
      { text: 'DAX Formula Builder', url: '/tools/dax-formula-builder' },
      { text: 'Blog', url: '/blog' },
      { text: 'Pricing', url: '/pricing' },
      {
        type: 'menu',
        text: 'More',
        items: [
          {
            text: 'Changelog',
            url: '/changelog',
            // fumadocs-ui's "menu" nav item renders each child as an
            // icon+description card by default (rounded-lg border bg-fd-card
            // p-3) - built for richer entries, not plain text links. With
            // only two of these now (Blog moved to a top-level link above),
            // strip the card chrome down to a plain row so it matches the
            // compact link-list style docs pages use for the same "More"
            // menu (a different, simpler component there). cn() here is
            // tailwind-merge-compatible, so these utilities replace rather
            // than stack with the defaults.
            menu: { className: 'border-none bg-transparent p-2 gap-0 rounded-md' },
          },
          {
            text: 'FAQ',
            url: '/faq',
            menu: { className: 'border-none bg-transparent p-2 gap-0 rounded-md' },
          },
        ],
      },
      {
        type: 'icon',
        label: 'GitHub',
        text: 'GitHub',
        icon: <GitHubIcon />,
        url: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
        external: true,
      },
    ],
  };
}
