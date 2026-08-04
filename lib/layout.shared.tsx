import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Logo } from '@/components/logo';
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
    links: [{ text: 'Changelog', url: '/changelog' }],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
