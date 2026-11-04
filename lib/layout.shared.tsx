import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Logo } from '@/components/logo';
import { GitHubIcon } from '@/components/github-icon';
import { SiteNavMenu } from '@/components/site-nav-menu';
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
      // Desktop: Tools, Blog, Pricing, and More come from one Radix
      // navigation menu (Fumadocs' built-in menu item anchored its popup to
      // the whole nav bar and was unreliable). Mobile: plain links in
      // Fumadocs' collapsible menu.
      { type: 'custom', on: 'nav', children: <SiteNavMenu /> },
      { text: 'Tools', url: '/tools', on: 'menu' },
      { text: 'Blog', url: '/blog', on: 'menu' },
      { text: 'Pricing', url: '/pricing', on: 'menu' },
      { text: 'Changelog', url: '/changelog', on: 'menu' },
      { text: 'FAQ', url: '/faq', on: 'menu' },
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
