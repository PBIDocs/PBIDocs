import Link from 'next/link';
import type { Metadata } from 'next';
import { Calendar } from 'lucide-react';
import { getTutorials, type Tutorial } from '@/lib/tutorial-source';

export const metadata: Metadata = {
  title: 'Tutorials',
  description:
    'End-to-end Power BI tutorials — real data, real DAX, real models, built start to finish.',
  alternates: {
    canonical: '/tutorials',
  },
};

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function TutorialMeta({ tutorial }: { tutorial: Tutorial }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-fd-muted-foreground/80">
      <span className="inline-flex items-center gap-1.5">
        <Calendar className="size-3.5" />
        <time dateTime={tutorial.date}>{formatDate(tutorial.date)}</time>
      </span>
      {tutorial.tags?.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-fd-primary/10 px-2.5 py-0.5 text-xs font-medium text-fd-primary"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export default function TutorialsIndexPage() {
  const [latest, ...rest] = getTutorials();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[400px] w-[100%] -translate-x-1/2 rounded-full bg-fd-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <div className="mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-6 inline-flex rounded-full border px-4 py-1 text-sm text-fd-muted-foreground">
            End-to-End Walkthroughs
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Tutorials</h1>
          <p className="mx-auto max-w-xl text-lg text-fd-muted-foreground">
            Not a single function or a single fix — a whole build, start to finish, with one
            consistent dataset the whole way through.
          </p>
        </div>

        {latest && (
          <Link
            href={`/tutorials/${latest.slug}`}
            className="group mb-10 block rounded-2xl border border-fd-border p-8 transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/50 hover:bg-fd-accent/50 hover:shadow-lg"
          >
            <span className="mb-4 inline-flex rounded-full bg-fd-primary/10 px-3 py-1 text-xs font-semibold text-fd-primary">
              Latest
            </span>
            <h2 className="mb-2 text-2xl font-semibold transition-colors group-hover:text-fd-primary">
              {latest.title}
            </h2>
            <p className="mb-4 text-fd-muted-foreground">{latest.description}</p>
            <TutorialMeta tutorial={latest} />
          </Link>
        )}

        <div className="space-y-4">
          {rest.map((tutorial) => (
            <Link
              key={tutorial.slug}
              href={`/tutorials/${tutorial.slug}`}
              className="group block rounded-xl border border-fd-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/50 hover:bg-fd-accent/50 hover:shadow-md"
            >
              <h2 className="mb-2 text-xl font-semibold transition-colors group-hover:text-fd-primary">
                {tutorial.title}
              </h2>
              <p className="mb-4 text-fd-muted-foreground">{tutorial.description}</p>
              <TutorialMeta tutorial={tutorial} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
