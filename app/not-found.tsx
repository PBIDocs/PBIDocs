import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-4 text-sm font-semibold tracking-wide text-fd-primary">404</p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="mb-10 max-w-md text-fd-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist, or may have moved. Try heading back
          to the docs, or search for what you need.
        </p>
        <div className="flex gap-4">
          <Link
            href="/docs/getting-started"
            className="rounded-lg bg-fd-primary px-6 py-3 font-semibold text-fd-primary-foreground hover:bg-fd-primary/90"
          >
            Browse Documentation
          </Link>
          <Link
            href="/"
            className="rounded-lg border px-6 py-3 font-semibold hover:bg-fd-muted"
          >
            Go Home
          </Link>
        </div>
      </main>
    </HomeLayout>
  );
}
