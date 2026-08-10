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
      { text: 'Blog', url: '/blog' },
      { text: 'Changelog', url: '/changelog' },
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
