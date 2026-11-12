import type { Metadata } from 'next';
import Link from 'next/link';
import { DaxSyntaxChecker } from '@/components/tools/dax-syntax-checker';

export const metadata: Metadata = {
  title: 'DAX Syntax Checker',
  description:
    'Paste a DAX formula to find what causes "The syntax for \'...\' is incorrect": missing or trailing commas, unbalanced parentheses, semicolon separators, smart quotes, unquoted table names, and VAR without RETURN, with one-click fixes.',
  alternates: {
    canonical: '/tools/dax-syntax-checker',
  },
};

export default function DaxSyntaxCheckerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">DAX Syntax Checker</h1>
      <p className="mb-10 text-lg text-fd-muted-foreground">
        Power BI says &ldquo;The syntax for &lsquo;)&rsquo; is incorrect&rdquo; and points at the wrong character.
        Paste the formula here to see the real mistake marked in place, why it breaks, and a fix you can apply
        with one click.
      </p>

      <DaxSyntaxChecker />

      <div className="mt-14 space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing you paste is
          sent anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">What it checks:</strong> brackets and parentheses, commas and
          semicolons, straight vs. curly quotes, table names that need quoting, VAR and RETURN, operators borrowed
          from other languages (!=, AND, IN with parentheses), Excel-only functions, and the argument counts of
          common functions. It doesn&apos;t know your model, so it can&apos;t tell whether a table, column, or
          measure name actually exists.
        </p>
        <p>
          Every cause is explained with examples in{' '}
          <Link href="/blog/dax-syntax-is-incorrect-error" className="text-fd-primary hover:underline">
            The Syntax for &lsquo;...&rsquo; Is Incorrect
          </Link>
          . Formula parses but gives the wrong number? Start with{' '}
          <Link href="/docs/dax/basics" className="text-fd-primary hover:underline">
            DAX basics
          </Link>
          , or browse all the{' '}
          <Link href="/tools" className="text-fd-primary hover:underline">
            Power BI tools
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
