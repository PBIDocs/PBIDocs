import type { Metadata } from 'next';
import Link from 'next/link';
import { FieldParameterGenerator } from '@/components/tools/field-parameter-generator';

export const metadata: Metadata = {
  title: 'Power BI Field Parameter Generator',
  description:
    'Build the DAX for a Power BI field parameter: custom display names, sort order, and grouped options for measures or columns, with a slicer preview and a dynamic title measure.',
  alternates: {
    canonical: '/tools/field-parameter-generator',
  },
};

export default function FieldParameterGeneratorPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">Field Parameter Generator</h1>
      <p className="mb-10 max-w-3xl text-lg text-fd-muted-foreground">
        Let report users pick which measure or column a visual shows. List the fields, give them
        friendly names, put them in order, and optionally group them. Get the parameter&apos;s DAX,
        a preview of the slicer, and a measure for titles that follow the selection.
      </p>

      <FieldParameterGenerator />

      <div className="mt-14 max-w-3xl space-y-3 border-t border-fd-border pt-8 text-sm text-fd-muted-foreground">
        <p>
          Free, with no sign-in and no request limit. Everything runs in your browser, and nothing
          you type is sent anywhere.
        </p>
        <p>
          <strong className="text-fd-foreground">Why edit the DAX at all?</strong> The Fields
          dialog is fine for a quick parameter, but renaming options, reordering them, or adding a
          grouping column all happen in the table&apos;s DAX. Writing it here first means one paste
          instead of a round of edits.
        </p>
        <p>
          See{' '}
          <Link href="/docs/visuals/field-parameters" className="text-fd-primary hover:underline">
            Field Parameters
          </Link>{' '}
          for how the parameter table works, or browse all the{' '}
          <Link href="/tools" className="text-fd-primary hover:underline">
            Power BI tools
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
