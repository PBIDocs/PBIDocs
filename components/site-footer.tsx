import Link from 'next/link';
import { appName, gitConfig } from '@/lib/shared';
import { Logo } from '@/components/logo';
import { GitHubIcon } from '@/components/github-icon';

const columns: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'Tutorials', href: '/tutorials' },
      { label: 'DAX Formula Builder', href: '/tools/dax-formula-builder' },
      { label: 'Interactive Examples', href: '/playground' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'FAQ', href: '/faq' },
      { label: 'RSS', href: '/rss.xml', external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-fd-border">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-fd-foreground">
              <Logo className="size-6" />
              {appName}
            </Link>
            <p className="mt-3 max-w-[22ch] text-sm text-fd-muted-foreground">
              Power BI docs, built from real reports.
            </p>
            <a
              href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="PBIDocs on GitHub"
              className="mt-5 inline-flex size-9 items-center justify-center rounded-lg border border-fd-border text-fd-muted-foreground transition-colors hover:border-fd-primary/40 hover:text-fd-primary"
            >
              <GitHubIcon className="size-4" />
            </a>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
                {column.title}
              </p>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        className="text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-fd-border pt-6 text-center text-sm text-fd-muted-foreground">
          &copy; {new Date().getFullYear()} {appName}
        </div>
      </div>
    </footer>
  );
}
