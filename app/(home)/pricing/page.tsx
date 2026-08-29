import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { Faq } from '@/components/faq';
import { UpgradeBanner } from '@/components/upgrade-banner';
import { ManageBillingLink } from '@/components/manage-billing-link';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'DAX Formula Builder and Ask AI are free up to 5 requests a day each. PBIDocs Pro is $5/month for 200 requests a day on both, cancel anytime.',
  alternates: {
    canonical: '/pricing',
  },
};

const faqItems = [
  {
    question: 'What does the $5/month subscription actually include?',
    answer:
      'One subscription raises the daily limit on both AI tools — the DAX Formula Builder and the Ask AI panel on every docs page — from 5 requests a day each to 200 requests a day each.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes. Manage or cancel your subscription anytime from the billing portal — no minimum commitment, and no cancellation fee.',
  },
  {
    question: 'What happens to my usage if I cancel?',
    answer:
      "You'll drop back to the free tier (5 requests a day on each tool) at the end of your current billing period — nothing is deleted, and you can resubscribe anytime.",
  },
  {
    question: "Do I need an account to use the free tier?",
    answer:
      'No. Both AI tools are free to try immediately, with no sign-up — the daily limit is tracked anonymously per browser, not tied to an account.',
  },
  {
    question: 'Is this a one-time purchase or a recurring subscription?',
    answer: "It's a recurring monthly subscription, billed automatically until you cancel.",
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

const freeFeatures = [
  '5 requests a day on the DAX Formula Builder',
  '5 requests a day on Ask AI (every docs page)',
  'DAX measures and Power Query M, both modes',
  'No sign-up required',
];

const proFeatures = [
  '200 requests a day on the DAX Formula Builder',
  '200 requests a day on Ask AI (every docs page)',
  'Everything in Free',
  'Cancel anytime',
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="text-lg text-fd-muted-foreground">
          Every AI tool on PBIDocs is free to try, no sign-up required. Upgrade if you need more
          than a handful of requests a day.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-fd-border p-8">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-1 text-3xl font-bold tracking-tight">
            $0<span className="text-base font-normal text-fd-muted-foreground">/month</span>
          </p>
          <ul className="mt-6 flex flex-col gap-3 text-sm">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-fd-muted-foreground" />
                <span className="text-fd-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/tools/dax-formula-builder"
            className="mt-8 block rounded-lg border border-fd-border px-5 py-2.5 text-center text-sm font-semibold hover:bg-fd-accent"
          >
            Try it free
          </Link>
        </div>

        <div className="relative rounded-2xl border-2 border-fd-primary p-8">
          <span className="absolute -top-3 left-8 rounded-full bg-fd-primary px-3 py-1 text-xs font-semibold text-fd-primary-foreground">
            <Sparkles className="mr-1 inline size-3" />
            Most flexibility
          </span>
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="mt-1 text-3xl font-bold tracking-tight">
            $5<span className="text-base font-normal text-fd-muted-foreground">/month</span>
          </p>
          <ul className="mt-6 flex flex-col gap-3 text-sm">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-fd-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <UpgradeBanner variant="prominent" />
          </div>
          <p className="mt-3 text-center text-xs text-fd-muted-foreground">
            By subscribing you agree to the{' '}
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-fd-muted-foreground">
        Already subscribed? <ManageBillingLink />
      </p>

      <Faq items={faqItems} showHeading />
    </div>
  );
}
