import type { Metadata } from 'next';
import Link from 'next/link';
import { appName, gitConfig } from '@/lib/shared';
import { PageToc } from '@/components/page-toc';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern using PBIDocs, the free docs and tutorials, and the paid DAX Formula Builder / Ask AI subscription.',
  alternates: {
    canonical: '/terms',
  },
};

const toc = [
  { title: 'Agreement to Terms', url: '#agreement-to-terms', depth: 2 },
  { title: 'The Service', url: '#the-service', depth: 2 },
  { title: 'Free Tier and Pro Subscription', url: '#free-tier-and-pro-subscription', depth: 2 },
  { title: 'AI-Generated Content', url: '#ai-generated-content', depth: 2 },
  { title: 'Acceptable Use', url: '#acceptable-use', depth: 2 },
  { title: 'Content and Intellectual Property', url: '#content-and-intellectual-property', depth: 2 },
  { title: 'Third-Party Services', url: '#third-party-services', depth: 2 },
  { title: 'Disclaimer of Warranties', url: '#disclaimer-of-warranties', depth: 2 },
  { title: 'Limitation of Liability', url: '#limitation-of-liability', depth: 2 },
  { title: 'Changes to These Terms', url: '#changes-to-these-terms', depth: 2 },
  { title: 'Contact', url: '#contact', depth: 2 },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl lg:mx-0">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
        <p className="text-lg text-fd-muted-foreground mb-2">
          The terms that apply to using PBIDocs, in plain language.
        </p>
        <p className="text-sm text-fd-muted-foreground/70 mb-10">Last updated: August 29, 2026</p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <article className="min-w-0 max-w-3xl flex-1">
          <div className="prose-sm max-w-none space-y-10 text-fd-muted-foreground [&_h2]:text-fd-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:scroll-mt-24 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">
            <section>
              <h2 id="agreement-to-terms">Agreement to Terms</h2>
              <p>
                By using {appName} — reading the docs, using the DAX Formula Builder or Ask AI, or
                subscribing to Pro — you agree to these terms. If you don&apos;t agree with them,
                the site&apos;s free content is still available to read, but the AI tools and
                subscription described below aren&apos;t offered to you.
              </p>
            </section>

            <section>
              <h2 id="the-service">The Service</h2>
              <p>
                {appName} is an independent, unofficial Power BI documentation site: docs,
                tutorials, and blog content, all free to read with no sign-up. It also offers two
                AI-assisted tools — the DAX Formula Builder and the Ask AI panel on docs pages —
                free up to a daily limit, with a paid Pro subscription available for a higher
                limit. {appName} isn&apos;t affiliated with, endorsed by, or sponsored by
                Microsoft.
              </p>
            </section>

            <section>
              <h2 id="free-tier-and-pro-subscription">Free Tier and Pro Subscription</h2>
              <ul>
                <li>Both AI tools are usable without an account, up to 5 requests a day each.</li>
                <li>
                  Pro is a $5/month recurring subscription that raises both limits to 200
                  requests a day each. It renews automatically each month until cancelled.
                </li>
                <li>
                  Billing is handled entirely by Stripe. {appName} never sees or stores your card
                  details.
                </li>
                <li>
                  You can cancel anytime from the billing portal, linked wherever your
                  subscription status is shown. Cancelling stops future renewal; access continues
                  until the end of the billing period already paid for.
                </li>
                <li>
                  Charges are non-refundable except where required by law. If a charge was made
                  in error, contact{' '}
                  <a href="mailto:contact@pbidocs.com" className="text-fd-primary hover:underline">
                    contact@pbidocs.com
                  </a>{' '}
                  and it will be looked at.
                </li>
              </ul>
            </section>

            <section>
              <h2 id="ai-generated-content">AI-Generated Content</h2>
              <p>
                The DAX Formula Builder and Ask AI generate DAX and Power Query M based on your
                prompt, using a third-party AI model. This output is a starting point, not a
                verified answer:
              </p>
              <ul>
                <li>It can be wrong, inefficient, or not fit your actual data model.</li>
                <li>
                  It isn&apos;t a substitute for understanding what a formula does before using
                  it in a real report.
                </li>
                <li>
                  You&apos;re responsible for reviewing and testing anything generated before
                  relying on it, especially in a production report or dataset.
                </li>
              </ul>
              <p>
                {appName} provides this output &quot;as is&quot;, with no warranty that it&apos;s
                accurate, complete, or suitable for any particular purpose.
              </p>
            </section>

            <section>
              <h2 id="acceptable-use">Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>
                  Circumvent the daily rate limits (e.g., automated scripting, rotating
                  identifiers, or other means of evading the limit rather than subscribing).
                </li>
                <li>Use the AI tools to generate content unrelated to DAX or Power Query M.</li>
                <li>
                  Attempt to disrupt, overload, or gain unauthorized access to the site or its
                  underlying infrastructure.
                </li>
                <li>Use the service for any unlawful purpose.</li>
              </ul>
              <p>
                {appName} may suspend or terminate access, including a paid subscription without
                refund of the current period, for violating these terms.
              </p>
            </section>

            <section>
              <h2 id="content-and-intellectual-property">Content and Intellectual Property</h2>
              <p>
                No license has been set for the site&apos;s written content, so all rights are
                reserved by default. If you&apos;d like to reuse content from the site, open an
                issue on{' '}
                <a
                  href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fd-primary hover:underline"
                >
                  GitHub
                </a>{' '}
                to ask. DAX and Power Query M code generated for you by the AI tools, and any
                code snippets shown in the docs, are yours to use freely in your own work.
              </p>
            </section>

            <section>
              <h2 id="third-party-services">Third-Party Services</h2>
              <p>
                {appName} runs on Cloudflare (hosting and data storage), uses Stripe for
                billing, and uses Anthropic&apos;s API to generate AI tool responses. Each of
                these providers processes the data necessary to perform its function (payment
                details with Stripe, your prompt with Anthropic) under its own terms and privacy
                practices. See{' '}
                <Link href="/privacy" className="text-fd-primary hover:underline">
                  Privacy Policy
                </Link>{' '}
                for what {appName} itself stores.
              </p>
            </section>

            <section>
              <h2 id="disclaimer-of-warranties">Disclaimer of Warranties</h2>
              <p>
                The site and its tools are provided &quot;as is&quot; and &quot;as
                available&quot;, without warranties of any kind, express or implied. {appName}{' '}
                doesn&apos;t guarantee the service will be uninterrupted, error-free, or that its
                content is accurate or current at all times.
              </p>
            </section>

            <section>
              <h2 id="limitation-of-liability">Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, {appName} isn&apos;t liable for any
                indirect, incidental, or consequential damages arising from your use of the site
                or its tools — including damages resulting from relying on AI-generated DAX or
                Power Query M in a report or dataset without independently reviewing it.
              </p>
            </section>

            <section>
              <h2 id="changes-to-these-terms">Changes to These Terms</h2>
              <p>
                These terms may be updated as the site changes. Meaningful changes will be
                reflected here, with the date at the top kept current. Continuing to use the
                site after a change means you accept the updated terms.
              </p>
            </section>

            <section>
              <h2 id="contact">Contact</h2>
              <p>
                Questions about these terms, billing, or anything else:{' '}
                <a href="mailto:contact@pbidocs.com" className="text-fd-primary hover:underline">
                  contact@pbidocs.com
                </a>
                . For a content error or bug, opening an issue on{' '}
                <a
                  href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fd-primary hover:underline"
                >
                  GitHub
                </a>{' '}
                works too.
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
