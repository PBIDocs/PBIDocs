import Link from 'next/link';
import { appName, gitConfig } from '@/lib/shared';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-fd-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-10 text-sm text-fd-muted-foreground sm:flex-row sm:justify-between">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/docs" className="transition-colors hover:text-fd-foreground">
            Docs
          </Link>
          <Link href="/tutorials" className="transition-colors hover:text-fd-foreground">
            Tutorials
          </Link>
          <Link href="/tools/dax-formula-builder" className="transition-colors hover:text-fd-foreground">
            DAX Formula Builder
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-fd-foreground">
            Pricing
          </Link>
          <Link href="/blog" className="transition-colors hover:text-fd-foreground">
            Blog
          </Link>
          <Link href="/changelog" className="transition-colors hover:text-fd-foreground">
            Changelog
          </Link>
          <Link href="/faq" className="transition-colors hover:text-fd-foreground">
            FAQ
          </Link>
          <a href="/rss.xml" className="transition-colors hover:text-fd-foreground">
            RSS
          </a>
        </nav>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a
            href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-fd-foreground"
          >
            GitHub
          </a>
          <Link href="/about" className="transition-colors hover:text-fd-foreground">
            About
          </Link>
          <Link href="/contact" className="transition-colors hover:text-fd-foreground">
            Contact
          </Link>
          <Link href="/terms" className="transition-colors hover:text-fd-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-fd-foreground">
            Privacy
          </Link>
          <p>
            &copy; {new Date().getFullYear()} {appName}
          </p>
        </div>
      </div>
    </footer>
  );
}
