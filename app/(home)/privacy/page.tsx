import type { Metadata } from 'next';
import Link from 'next/link';
import { Cookie, Database, Mail, ShieldCheck } from 'lucide-react';
import { gitConfig } from '@/lib/shared';
import { PageToc } from '@/components/page-toc';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What PBIDocs collects, what it doesn\'t, and how the newsletter and analytics actually work.',
  alternates: {
    canonical: '/privacy',
  },
};

const summary = [
  {
    icon: Mail,
    text: 'We collect your email only if you sign up for the newsletter — nothing else, ever.',
  },
  {
    icon: Cookie,
    text: 'Analytics is cookieless (Cloudflare Web Analytics) — no tracking, no cross-site profiles.',
  },
  {
    icon: ShieldCheck,
    text: 'No ads or ad trackers, anywhere on this site — the only cookie is one that remembers an active Pro subscription.',
  },
  {
    icon: Database,
    text: 'Your email is never sold, rented, or shared with any third party.',
  },
];

const toc = [
  { title: 'What We Collect', url: '#what-we-collect', depth: 2 },
  { title: "What We Don't Do", url: '#what-we-dont-do', depth: 2 },
  { title: 'How Your Email Is Used', url: '#how-your-email-is-used', depth: 2 },
  { title: 'The Subscriber Cookie', url: '#the-subscriber-cookie', depth: 2 },
  { title: 'Removing Your Data', url: '#removing-your-data', depth: 2 },
  { title: 'Third-Party Services', url: '#third-party-services', depth: 2 },
  { title: 'Changes to This Policy', url: '#changes-to-this-policy', depth: 2 },
  { title: 'Questions', url: '#questions', depth: 2 },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl lg:mx-0">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-lg text-fd-muted-foreground mb-2">
          A plain description of what this site actually collects, stores, and does with it.
        </p>
        <p className="text-sm text-fd-muted-foreground/70 mb-10">Last updated: August 29, 2026</p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <article className="min-w-0 max-w-3xl flex-1">
          <div
            className="mb-14 grid grid-cols-1 gap-4 rounded-xl border border-transparent p-6 sm:grid-cols-2"
            style={{
              background: `
                linear-gradient(color-mix(in srgb, var(--color-fd-background) 97%, var(--color-fd-primary)), color-mix(in srgb, var(--color-fd-background) 97%, var(--color-fd-primary))) padding-box,
                linear-gradient(135deg, color-mix(in srgb, var(--color-fd-primary) 45%, transparent), transparent 55%, color-mix(in srgb, var(--color-fd-primary) 25%, transparent)) border-box
              `,
            }}
          >
            {summary.map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <item.icon className="mt-0.5 size-5 shrink-0 text-fd-primary" />
                <p className="text-sm text-fd-foreground">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="prose-sm max-w-none space-y-10 text-fd-muted-foreground [&_h2]:text-fd-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:scroll-mt-24 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">
            <section>
              <h2 id="what-we-collect">What We Collect</h2>
              <ul>
                <li>
                  <strong className="text-fd-foreground">Newsletter subscribers:</strong> just an
                  email address, submitted voluntarily through the signup form.
                </li>
                <li>
                  <strong className="text-fd-foreground">Page feedback</strong> (the &quot;Was this
                  helpful?&quot; widget): just the page path and a yes/no — nothing that identifies
                  who submitted it.
                </li>
                <li>
                  <strong className="text-fd-foreground">Analytics:</strong> aggregate page-view
                  counts via Cloudflare Web Analytics, which doesn&apos;t use cookies or track
                  individuals across sites.
                </li>
              </ul>
            </section>

            <section>
              <h2 id="what-we-dont-do">What We Don&apos;t Do</h2>
              <ul>
                <li>No Google Analytics, Facebook Pixel, or similar third-party ad trackers.</li>
                <li>No selling, renting, or sharing your data with anyone.</li>
                <li>No cross-site tracking or ad profiles built from your visit.</li>
              </ul>
            </section>

            <section>
              <h2 id="how-your-email-is-used">How Your Email Is Used</h2>
              <p>
                An email address submitted through the newsletter form is stored solely to send
                updates about new PBIDocs content. It&apos;s stored in Cloudflare&apos;s D1 database —
                the same infrastructure that hosts the rest of the site — and isn&apos;t used for
                anything else, analyzed, or shared with any third party.
              </p>
            </section>

            <section>
              <h2 id="the-subscriber-cookie">The Subscriber Cookie</h2>
              <p>
                Subscribing to Pro sets one cookie that lets the site recognize you as a
                subscriber without asking you to sign in on every visit. It holds a signed
                reference back to your Stripe customer record — not your email, name, or payment
                details — and is used only to unlock the higher daily limit on the DAX Formula
                Builder and Ask AI. Nothing else on the site sets a cookie.
              </p>
            </section>

            <section>
              <h2 id="removing-your-data">Removing Your Data</h2>
              <p>
                There isn&apos;t a self-service unsubscribe link for the newsletter yet. To have
                an email address removed, email{' '}
                <a href="mailto:contact@pbidocs.com" className="text-fd-primary hover:underline">
                  contact@pbidocs.com
                </a>{' '}
                or open an issue on{' '}
                <a
                  href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fd-primary hover:underline"
                >
                  GitHub
                </a>{' '}
                and it will be deleted.
              </p>
            </section>

            <section>
              <h2 id="third-party-services">Third-Party Services</h2>
              <p>
                PBIDocs runs on Cloudflare — Pages for hosting, D1 for the newsletter, feedback,
                and subscription data, and Web Analytics for traffic counts. Pro subscriptions
                are billed through Stripe, which handles and stores all payment details
                directly — PBIDocs never sees or stores your card information. AI tool prompts
                (DAX Formula Builder and Ask AI) are sent to Anthropic&apos;s API to generate a
                response. Each provider&apos;s own privacy practices apply to the data it
                processes on PBIDocs&apos; behalf.
              </p>
            </section>

            <section>
              <h2 id="changes-to-this-policy">Changes to This Policy</h2>
              <p>
                This page may be updated as the site changes. Meaningful changes will be
                reflected here, with the date at the top kept current.
              </p>
            </section>

            <section>
              <h2 id="questions">Questions</h2>
              <p>
                Email{' '}
                <a href="mailto:contact@pbidocs.com" className="text-fd-primary hover:underline">
                  contact@pbidocs.com
                </a>
                , open an issue on{' '}
                <a
                  href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fd-primary hover:underline"
                >
                  GitHub
                </a>
                , or see the{' '}
                <Link href="/faq" className="text-fd-primary hover:underline">
                  FAQ
                </Link>{' '}
                for common questions about the site itself. Billing questions are also covered
                in{' '}
                <Link href="/terms" className="text-fd-primary hover:underline">
                  Terms of Service
                </Link>
                .
              </p>
            </section>
          </div>
        </article>

        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <PageToc toc={toc} />
          </div>
        </aside>
      </div>
    </div>
  );
}
