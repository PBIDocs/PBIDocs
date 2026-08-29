import type { Metadata } from 'next';
import { Mail, Bug, CreditCard } from 'lucide-react';
import { gitConfig } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'How to reach PBIDocs — for content corrections, billing questions, or anything else.',
  alternates: {
    canonical: '/contact',
  },
};

const reasons = [
  {
    icon: Mail,
    title: 'General questions',
    body: 'Anything not covered by the FAQ — feedback, a question about a tool, or anything else.',
  },
  {
    icon: CreditCard,
    title: 'Billing or subscription issues',
    body: 'A charge that looks wrong, trouble accessing the billing portal, or a Pro feature not reflecting your subscription.',
  },
  {
    icon: Bug,
    title: 'A content error or bug',
    body: 'A wrong example, an outdated screenshot, or something broken on the site.',
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-3">Contact</h1>
      <p className="text-lg text-fd-muted-foreground mb-10">
        There&apos;s no support ticket system here — just a real inbox that gets checked.
      </p>

      <div className="mb-10 rounded-xl border border-fd-border p-6">
        <p className="text-sm text-fd-muted-foreground mb-1">Email</p>
        <a
          href="mailto:contact@pbidocs.com"
          className="text-2xl font-semibold text-fd-primary hover:underline"
        >
          contact@pbidocs.com
        </a>
      </div>

      <div className="flex flex-col gap-6">
        {reasons.map((reason) => (
          <div key={reason.title} className="flex items-start gap-3">
            <reason.icon className="mt-0.5 size-5 shrink-0 text-fd-primary" />
            <div>
              <p className="font-medium text-fd-foreground">{reason.title}</p>
              <p className="text-sm text-fd-muted-foreground">{reason.body}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-fd-muted-foreground">
        For a content error specifically, every docs page also has a &quot;Report an issue&quot;
        link at the bottom that opens a pre-filled{' '}
        <a
          href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
          target="_blank"
          rel="noreferrer noopener"
          className="text-fd-primary hover:underline"
        >
          GitHub
        </a>{' '}
        issue — either path works.
      </p>
    </div>
  );
}
