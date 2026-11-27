import Link from 'next/link';
import { cn } from '@/lib/cn';

// The stages of a scheduled refresh in the Power BI Service, in the order they run,
// each with the error it typically produces and the post that explains the fix.
// Error text is quoted from those posts, which use the exact Power BI wording; a
// stage marked paraphrase shows a description instead, in normal (non-code) type.
const STAGES = [
  {
    name: 'The schedule fires',
    what: 'Before running anything, the Service works out every data source from the query text alone.',
    error:
      "This dataset includes a dynamic data source. Since dynamic data sources aren't refreshed in the Power BI service, this dataset won't be refreshed.",
    cause: 'A URL, server, or file path built from data, so the source isn’t known until the query runs.',
    fix: { href: '/blog/dynamic-data-source-refresh-error', label: 'Dynamic data source' },
    color: 'bg-slate-500',
    text: 'text-slate-600 dark:text-slate-300',
  },
  {
    name: 'Sign in to each source',
    what: 'The Service uses its own stored credentials for each source, not yours from Desktop.',
    error: "Your data source can't be refreshed because the credentials are invalid.",
    cause: 'An expired password or OAuth token, or a gateway connection nobody updated.',
    fix: { href: '/blog/refresh-credentials-invalid-error', label: 'Credentials are invalid' },
    color: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  {
    name: 'Reach the source',
    what: 'Cloud sources connect directly. On-premises sources go through a gateway machine.',
    error: 'Unable to connect to the data source. The gateway is either offline or could not be reached.',
    cause: 'A sleeping or rebooted gateway machine, a stopped service, or a blocked network path.',
    fix: { href: '/blog/gateway-offline-refresh-error', label: 'Gateway offline' },
    extra: { href: '/blog/ole-db-odbc-connection-error', label: 'OLE DB or ODBC error' },
    color: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
  },
  {
    name: 'Run every Power Query step',
    what: 'Each query runs from Source to the last step, against today’s data rather than the preview.',
    error: "Expression.Error: The field 'CustomerID' of the record wasn't found.",
    cause: 'The source changed shape: a renamed column, a renamed sheet, or a new file layout.',
    fix: { href: '/blog/power-query-expression-error-field-not-found', label: 'Field wasn’t found' },
    extra: { href: '/blog/key-didnt-match-any-rows-error', label: 'Key didn’t match any rows' },
    color: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    name: 'Load into the model',
    what: 'The rows load into memory and every relationship is checked again.',
    error: "The column 'ProductKey' in table 'DimProduct' contains a duplicate value '1001'…",
    cause: 'New data put a duplicate key on the "one" side of a relationship, or the model outgrew its size limit (1 GB per model on Pro).',
    fix: { href: '/blog/column-contains-duplicate-value-error', label: 'Duplicate value' },
    color: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
  },
  {
    name: 'Recalculate, within the time limit',
    what: 'Calculated columns and tables are rebuilt. The whole refresh has to finish in time.',
    error: 'Time limit: 2 hours per refresh on shared capacity (Pro), 5 hours on Premium.',
    paraphrase: true,
    cause: 'A refresh that has slowly grown, often because query folding broke and the source is read in full.',
    fix: { href: '/blog/refresh-suddenly-slow-query-folding-broke', label: 'Refresh got slower' },
    color: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-400',
  },
] as const;

function Badge({ n, className }: { n: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
        className,
      )}
    >
      {n}
    </span>
  );
}

export function RefreshAnatomyDiagram() {
  return (
    <div id="refresh-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-1 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of a scheduled refresh
      </p>
      <p className="mb-4 text-xs text-fd-muted-foreground">
        The stages run in this order, and the first one that fails stops the refresh. The error in the refresh history
        tells you which stage it was.
      </p>

      <ol className="relative space-y-3">
        {STAGES.map((s, i) => (
          <li key={s.name} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <Badge n={String(i + 1)} className={s.color} />
              {i < STAGES.length - 1 && <span className="mt-1 w-px flex-1 bg-fd-border" aria-hidden />}
            </div>
            <div className="min-w-0 flex-1 rounded-lg border border-fd-border bg-fd-background p-3">
              <p className={cn('text-sm font-semibold', s.text)}>{s.name}</p>
              <p className="mt-0.5 text-xs text-fd-muted-foreground">{s.what}</p>
              <p
                className={cn(
                  'mt-2 rounded border border-red-500/30 bg-red-500/5 px-2 py-1.5 leading-snug break-words text-red-700 dark:text-red-300',
                  'paraphrase' in s ? 'text-xs' : 'font-mono text-[11px]',
                )}
              >
                {s.error}
              </p>
              <p className="mt-2 text-xs text-fd-muted-foreground">
                <span className="font-semibold text-fd-foreground">Usual cause:</span> {s.cause}
              </p>
              <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <Link href={s.fix.href} className="font-medium text-fd-primary hover:underline">
                  Fix: {s.fix.label} →
                </Link>
                {'extra' in s && (
                  <Link href={s.extra.href} className="font-medium text-fd-primary hover:underline">
                    {s.extra.label} →
                  </Link>
                )}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Badge n="✓" className="size-5 bg-emerald-500 text-[11px]" />
            Every stage succeeds
          </p>
          <p className="mt-1 text-xs text-fd-muted-foreground">
            The new data replaces the old in one step. Report viewers never see a half-loaded model.
          </p>
        </div>
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-300">
            <Badge n="✗" className="size-5 bg-red-500 text-[11px]" />
            Any stage fails
          </p>
          <p className="mt-1 text-xs text-fd-muted-foreground">
            Reports keep showing the last successful refresh, with no warning on the page. After four failures in a
            row, Power BI{' '}
            <Link href="/blog/scheduled-refresh-turned-off" className="text-fd-primary hover:underline">
              switches the schedule off
            </Link>
            , and fixing the cause doesn&apos;t switch it back on.
          </p>
        </div>
      </div>
    </div>
  );
}
