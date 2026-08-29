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
      { text: 'Pricing', url: '/pricing' },
      { text: 'Blog', url: '/blog' },
      { text: 'Changelog', url: '/changelog' },
      { text: 'FAQ', url: '/faq' },
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
