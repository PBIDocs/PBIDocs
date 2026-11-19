import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { SiteFooter } from '@/components/site-footer';
import { MobileThemeToggle } from '@/components/mobile-theme-toggle';

export default function Layout({ children }: LayoutProps<'/'>) {
  const options = baseOptions();
  return (
    <HomeLayout {...options} nav={{ ...options.nav, children: <MobileThemeToggle /> }}>
      {children}
      <SiteFooter />
    </HomeLayout>
  );
}
