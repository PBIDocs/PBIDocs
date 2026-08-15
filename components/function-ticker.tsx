import Link from 'next/link';

const functions = [
  { name: 'CALCULATE', href: '/docs/dax/calculate' },
  { name: 'FILTER', href: '/docs/dax/filter' },
  { name: 'ALL', href: '/docs/dax/filter-functions' },
  { name: 'RELATED', href: '/docs/dax/related' },
  { name: 'LOOKUPVALUE', href: '/docs/dax/lookupvalue' },
  { name: 'USERELATIONSHIP', href: '/docs/dax/userelationship' },
  { name: 'SUMMARIZE', href: '/docs/dax/summarize' },
  { name: 'RANKX', href: '/docs/dax/rankx' },
  { name: 'TOPN', href: '/docs/dax/topn' },
  { name: 'SWITCH', href: '/docs/dax/switch' },
  { name: 'SELECTEDVALUE', href: '/docs/dax/selectedvalue' },
  { name: 'Table.NestedJoin', href: '/docs/power-query/merge-queries' },
  { name: 'Table.ExpandTableColumn', href: '/docs/power-query/merge-queries' },
  { name: 'Text.Trim', href: '/docs/power-query/m-language' },
  { name: 'List.Select', href: '/docs/power-query/m-language' },
];

export function FunctionTicker() {
  return (
    <div className="w-full">
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-fd-muted-foreground/70">
        Functions covered in the reference docs
      </p>
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
          {[...functions, ...functions].map((fn, i) => (
            <Link
              key={`${fn.name}-${i}`}
              href={fn.href}
              className="shrink-0 font-mono text-sm text-fd-muted-foreground transition-colors hover:text-fd-primary"
            >
              {fn.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
