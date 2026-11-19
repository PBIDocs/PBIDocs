import type { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { Quiz } from '@/components/dax-practice';
import { DOMAINS, PL300_LEVELS, PL300_QUESTIONS, SKILLS_AS_OF, STUDY_GUIDE_URL } from '@/lib/pl300';

export const metadata: Metadata = {
  title: 'PL-300 Study Guide and Practice Questions',
  description: `A free study guide for the PL-300 Power BI Data Analyst exam: every skill in Microsoft's outline (as of ${SKILLS_AS_OF}) mapped to a page that teaches it, plus ${PL300_QUESTIONS.length} scenario questions with explained answers.`,
  alternates: {
    canonical: '/pl-300',
  },
};

const allSkills = DOMAINS.flatMap((d) => d.areas.flatMap((a) => a.skills));
const covered = allSkills.filter((s) => s.links.length > 0).length;

const linkClass = 'text-fd-primary hover:underline';

export default function Pl300Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-fd-primary/10 px-3 py-1 text-xs font-semibold text-fd-primary">
        <GraduationCap className="size-3.5" />
        PL-300 Study Guide
      </span>
      <h1 className="mb-3 text-4xl font-bold tracking-tight">PL-300: Power BI Data Analyst study guide</h1>
      <p className="mb-6 text-lg text-fd-muted-foreground">
        Every skill Microsoft lists for the exam, each linked to a page that teaches it, and practice questions in the
        same scenario style as the exam. Free, no sign-up.
      </p>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DOMAINS.map((d) => (
          <a
            key={d.id}
            href={`#${d.id}`}
            className="rounded-lg border border-fd-border p-3 transition-colors hover:border-fd-primary/50"
          >
            <p className="text-xl font-bold tabular-nums">{d.weight}</p>
            <p className="text-sm text-fd-muted-foreground">{d.name}</p>
          </a>
        ))}
      </div>

      <section className="prose-sm mb-12 space-y-3 text-sm text-fd-muted-foreground">
        <h2 className="text-lg font-semibold text-fd-foreground">The exam in brief</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            You need <strong className="text-fd-foreground">700 out of 1,000</strong> to pass. The certification
            expires each year, and renewing it is a free online assessment on Microsoft Learn.
          </li>
          <li>
            The four skill areas above carry the weights shown. Prepare, Model, and Visualize are each about a quarter
            of the exam, so DAX and Power Query together decide most of the result.
          </li>
          <li>
            The outline below is the one Microsoft published for exams taken from{' '}
            <strong className="text-fd-foreground">{SKILLS_AS_OF}</strong>. Check the{' '}
            <a href={STUDY_GUIDE_URL} className={linkClass} rel="noopener">
              official study guide
            </a>{' '}
            before you book, in case it has changed, and take Microsoft&apos;s free practice assessment linked from it.
          </li>
          <li>
            {covered === allSkills.length ? (
              <>
                Every one of the {allSkills.length} skills links to at least one PBIDocs page. For the Service and
                Copilot features, which change most often, check Microsoft Learn for anything released since.
              </>
            ) : (
              <>
                PBIDocs covers {covered} of the {allSkills.length} skills so far. Skills marked{' '}
                <em>not covered here yet</em> are best studied on Microsoft Learn.
              </>
            )}
          </li>
        </ul>
        <p className="text-xs">PBIDocs is independent and not affiliated with Microsoft.</p>
      </section>

      <section aria-labelledby="practice" className="mb-16">
        <h2 id="practice" className="mb-2 text-2xl font-bold tracking-tight">
          Practice questions
        </h2>
        <p className="mb-6 text-sm text-fd-muted-foreground">
          {PL300_QUESTIONS.length} scenario questions, four per skill area. Each answer explains why, and links to the
          page that covers it. For DAX, the{' '}
          <Link href="/dax-practice" className={linkClass}>
            DAX practice exercises
          </Link>{' '}
          go deeper into filter context and time intelligence.
        </p>
        <Quiz exercises={PL300_QUESTIONS} levels={PL300_LEVELS} storageKey="pbidocs-pl300-practice-v1" />
      </section>

      <h2 className="mb-6 text-2xl font-bold tracking-tight">Skills measured, with where to learn each one</h2>
      <div className="grid grid-cols-1 gap-10">
        {DOMAINS.map((d) => {
          const skills = d.areas.flatMap((a) => a.skills);
          const n = skills.filter((s) => s.links.length > 0).length;
          return (
            <section key={d.id} id={d.id} aria-labelledby={`${d.id}-h`} className="min-w-0 scroll-mt-24">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-fd-border pb-2">
                <h3 id={`${d.id}-h`} className="text-xl font-semibold">
                  {d.name} <span className="font-normal text-fd-muted-foreground">({d.weight})</span>
                </h3>
                <span className="text-xs text-fd-muted-foreground tabular-nums">
                  {n} of {skills.length} covered on PBIDocs
                </span>
              </div>
              {d.areas.map((a) => (
                <div key={a.name} className="mb-6">
                  <h4 className="mb-2 text-sm font-semibold tracking-wide text-fd-muted-foreground uppercase">
                    {a.name}
                  </h4>
                  <ul className="divide-y divide-fd-border rounded-lg border border-fd-border">
                    {a.skills.map((s) => (
                      <li key={s.text} className="grid gap-1.5 px-3 py-2.5 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
                        <span>{s.text}</span>
                        <span className="flex flex-wrap gap-x-3 gap-y-1">
                          {s.links.length > 0 ? (
                            s.links.map((x) => (
                              <Link key={x.href + x.label} href={x.href} className={linkClass}>
                                {x.label}
                              </Link>
                            ))
                          ) : (
                            <span className="text-fd-muted-foreground/70 italic">Not covered here yet</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
