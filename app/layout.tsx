import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';

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
        <RootProvider
          search={{
            options: {
              type: 'static',
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}