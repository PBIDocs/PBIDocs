'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { Logo } from '@/components/logo';
import { GitHubIcon } from '@/components/github-icon';
import { appName, gitConfig } from '@/lib/shared';

function SearchTrigger() {
  const { setOpenSearch, hotKey } = useSearchContext();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenSearch(true)}
        aria-label="Search"
        className="rounded-md p-2 text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground sm:hidden"
      >
        <Search className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => setOpenSearch(true)}
        className="hidden w-full max-w-[240px] items-center gap-2 rounded-full border border-fd-border bg-fd-secondary/50 px-3 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-secondary sm:flex"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search</span>
        <div className="flex items-center gap-0.5">
          {hotKey.map((key, i) => (
            <kbd key={i} className="rounded-md border bg-fd-background px-1.5 text-xs">
              {key.display}
            </kbd>
          ))}
        </div>
      </button>
    </>
  );
}

// DocsLayout's sidebar renders this in place of its own logo/title, since
// DocsHeader already covers that. Must be a named component (not an inline
// arrow function) so it can be passed as a `slots` prop from the server
// component that renders <DocsLayout>.
export function EmptyNavTitle() {
  return null;
}

export function DocsHeader() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-fd-border bg-fd-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-full max-w-(--fd-layout-width) items-center gap-4 px-4 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-semibold">
          <Logo className="size-5" />
          {appName}
        </Link>

        <nav className="flex items-center gap-1 text-sm text-fd-muted-foreground max-sm:hidden">
          <Link
            href="/docs"
            className="rounded-md px-2 py-1 transition-colors hover:text-fd-accent-foreground"
          >
            Docs
          </Link>
          <Link
            href="/changelog"
            className="rounded-md px-2 py-1 transition-colors hover:text-fd-accent-foreground"
          >
            Changelog
          </Link>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <SearchTrigger />
          <ThemeSwitch />
          <a
            href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="rounded-md p-2 text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground"
          >
            <GitHubIcon className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
