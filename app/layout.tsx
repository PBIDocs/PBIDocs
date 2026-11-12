import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { FixMoreMenuPosition } from '@/components/fix-more-menu-position';
import { Banner } from 'fumadocs-ui/components/banner';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pbidocs.com'),
  title: {
    default: 'PBIDocs',
    template: '%s | PBIDocs',
  },
  description:
    'Learn DAX, Power Query, Data Modeling, Microsoft Fabric, and AI-assisted Power BI development with clear documentation and practical examples.',
  openGraph: {
    type: 'website',
    siteName: 'PBIDocs',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  verification: {
    other: {
      'msvalidate.01': 'D7B9EC9B5210AB7F934CCCC1C1B95DFF',
    },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <NextTopLoader color="var(--color-fd-primary)" height={3} showSpinner={false} shadow={false} />
        <RootProvider
          search={{
            options: {
              type: 'static',
            },
          }}
        >
          {/* Dismissible; changing the id shows it again to people who closed it */}
          <Banner id="askstack-health-check-1" className="text-sm">
            <a
              href="https://askstack.dev/health-check?utm_source=pbidocs&utm_medium=banner"
              className="underline-offset-4 hover:underline"
            >
              <span className="font-semibold">New: free Power BI model health check.</span>{' '}
              <span className="max-sm:hidden">Find what&apos;s making your numbers wrong and your model slow. </span>
              Check your model →
            </a>
          </Banner>
          {children}
        </RootProvider>
        <FixMoreMenuPosition />
      </body>
    </html>
  );
}