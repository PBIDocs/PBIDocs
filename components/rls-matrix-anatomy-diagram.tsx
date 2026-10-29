import { cn } from '@/lib/cn';

// A small model shaped like the page's Example Matrix: DimRegion 1→* DimStore 1→* FactSales *←1 DimProduct,
// all single-direction.
const REGIONS = [
  { region: 'West', manager: 'dana@' },
  { region: 'East', manager: 'lee@' },
];
const STORES = [
  { store: 'S1', region: 'West', rep: 'sam@' },
  { store: 'S2', region: 'West', rep: 'ana@' },
  { store: 'S3', region: 'East', rep: 'raj@' },
];
const PRODUCTS = ['Bike', 'Helmet'];
const SALES = [
  { id: 1, store: 'S1', product: 'Bike', amount: 400 },
  { id: 2, store: 'S1', product: 'Helmet', amount: 120 },
  { id: 3, store: 'S2', product: 'Bike', amount: 350 },
  { id: 4, store: 'S2', product: 'Helmet', amount: 90 },
  { id: 5, store: 'S3', product: 'Bike', amount: 500 },
  { id: 6, store: 'S3', product: 'Helmet', amount: 150 },
];

type Table = 'DimRegion' | 'DimStore' | 'FactSales' | 'DimProduct';
const TABLES: Table[] = ['DimRegion', 'DimStore', 'FactSales', 'DimProduct'];

// Tables a filter on each table reaches by following single-direction relationships (one side → many side).
const DOWNSTREAM: Record<Table, Table[]> = {
  DimRegion: ['DimStore', 'FactSales'],
  DimStore: ['FactSales'],
  FactSales: [],
  DimProduct: ['FactSales'],
};

type Role = {
  key: string;
  short: string;
  user: string;
  table?: Table;
  dax: string;
  inMatrix: boolean;
};

const ROLES: Role[] = [
  {
    key: 'RegionalManager',
    short: 'Regional Mgr',
    user: 'dana@',
    table: 'DimRegion',
    dax: '[RegionManagerEmail] = USERPRINCIPALNAME()',
    inMatrix: true,
  },
  {
    key: 'SalesRep',
    short: 'Sales Rep',
    user: 'sam@',
    table: 'DimStore',
    dax: '[SalesRepEmail] = USERPRINCIPALNAME()',
    inMatrix: true,
  },
  { key: 'Executive', short: 'Executive', user: 'cfo@', dax: 'no filter — full access', inMatrix: true },
  { key: 'Contractor', short: 'Contractor', user: 'temp@', dax: 'added to unblock one user', inMatrix: false },
];

// Which rows of each table the role's user can see.
function visible(role: Role) {
  const regionOk = (r: string) => role.table !== 'DimRegion' || REGIONS.find((x) => x.region === r)!.manager === role.user;
  const storeOk = (s: (typeof STORES)[number]) =>
    regionOk(s.region) && (role.table !== 'DimStore' || s.rep === role.user);
  const stores = STORES.filter(storeOk).map((s) => s.store);
  return {
    // DimRegion is only filtered when the role filters it directly; DimStore's filter can't flow back up to it.
    DimRegion: REGIONS.filter((r) => regionOk(r.region)).length,
    DimStore: stores.length,
    FactSales: SALES.filter((f) => stores.includes(f.store)),
    DimProduct: PRODUCTS.length,
  };
}

const TOTALS: Record<Table, number> = {
  DimRegion: REGIONS.length,
  DimStore: STORES.length,
  FactSales: SALES.length,
  DimProduct: PRODUCTS.length,
};

type Status = 'direct' | 'propagated' | 'upstream' | 'documented' | 'unreviewed';

function statusOf(role: Role, table: Table): Status {
  if (!role.table) return role.inMatrix ? 'documented' : 'unreviewed';
  if (role.table === table) return 'direct';
  if (DOWNSTREAM[role.table].includes(table)) return 'propagated';
  return 'upstream';
}

const STATUS_STYLE: Record<Status, { cell: string; text: string; label: string }> = {
  direct: { cell: 'bg-violet-500/80 text-white', text: 'text-violet-600 dark:text-violet-400', label: 'DAX filter' },
  propagated: { cell: 'bg-sky-500/80 text-white', text: 'text-sky-600 dark:text-sky-400', label: 'propagated' },
  upstream: { cell: 'bg-fd-foreground/10 text-fd-muted-foreground', text: 'text-fd-muted-foreground', label: 'not reached' },
  documented: {
    cell: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'full, by design',
  },
  unreviewed: {
    cell: 'border border-dashed border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'full, unreviewed',
  },
};

const STATUS_BADGE: Record<Status, string> = {
  direct: '1',
  propagated: '2',
  upstream: '3',
  documented: '4',
  unreviewed: '5',
};

const VIS = ROLES.map(visible);
const countOf = (i: number, t: Table) => {
  const v = VIS[i][t];
  return Array.isArray(v) ? v.length : v;
};
const sumOf = (i: number) => VIS[i].FactSales.reduce((s, f) => s + f.amount, 0);
const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;

function Badge({ n, className }: { n: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white',
        className,
      )}
    >
      {n}
    </span>
  );
}

const BADGE_COLOR: Record<string, string> = {
  '1': 'bg-violet-500',
  '2': 'bg-sky-500',
  '3': 'bg-fd-muted-foreground',
  '4': 'bg-emerald-500',
  '5': 'bg-amber-500',
};

function TablePill({ name }: { name: Table }) {
  return (
    <div className="rounded-md border border-fd-border bg-fd-background px-1 py-1.5 text-center font-mono text-[10px] sm:text-xs">
      {name}
    </div>
  );
}

export function RlsMatrixAnatomyDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 rounded-xl border border-fd-border bg-fd-secondary/30 p-3 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wider text-fd-muted-foreground/70 uppercase">
        Anatomy of an RLS matrix
      </p>

      {/* The model the roles are written against */}
      <div className="rounded-lg border border-fd-border bg-fd-background/50 p-3">
        <p className="text-xs text-fd-muted-foreground">The model: every relationship filters one way, one → many</p>
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-1">
          <TablePill name="DimRegion" />
          <span className="text-xs text-fd-muted-foreground">→</span>
          <TablePill name="DimStore" />
          <span className="text-xs text-fd-muted-foreground">→</span>
          <TablePill name="FactSales" />
          <span className="text-xs text-fd-muted-foreground">←</span>
          <TablePill name="DimProduct" />
        </div>
      </div>

      {/* Role × table: how each table is filtered, and how many rows survive */}
      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">Rows each role&apos;s user can see, table by table</p>
        <table className="mt-2 w-full table-fixed border-collapse text-sm">
          <thead>
            <tr className="text-[10px] text-fd-muted-foreground">
              <th className="w-[4.75rem] px-1 py-1 text-left font-normal sm:w-28">Table</th>
              {ROLES.map((r) => (
                <th key={r.key} className="px-0.5 py-1 text-center font-normal">
                  <span className="block font-semibold text-fd-foreground">{r.short}</span>
                  <span className="block font-mono">{r.user}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {TABLES.map((t) => (
              <tr key={t} className="border-t border-fd-border">
                <td className="truncate px-1 py-1 text-[10px] sm:text-xs">{t}</td>
                {ROLES.map((r, i) => {
                  const st = statusOf(r, t);
                  const s = STATUS_STYLE[st];
                  return (
                    <td key={r.key} className="px-0.5 py-1">
                      <div className={cn('rounded px-0.5 py-1 text-center text-[11px] leading-tight', s.cell)}>
                        {countOf(i, t)}/{TOTALS[t]}
                        <span className="block font-sans text-[9px] opacity-80">{s.label}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t-2 border-fd-border">
              <td className="px-1 py-1.5 font-sans text-[10px] text-fd-muted-foreground sm:text-xs">Sales seen</td>
              {ROLES.map((r, i) => (
                <td key={r.key} className="px-0.5 py-1.5 text-center text-xs font-semibold text-fd-primary">
                  {fmt(sumOf(i))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-fd-muted-foreground sm:grid-cols-5">
          {(Object.keys(STATUS_BADGE) as Status[]).map((st) => (
            <span key={st} className="flex items-center gap-1">
              <Badge n={STATUS_BADGE[st]} className={cn('size-4 text-[9px]', BADGE_COLOR[STATUS_BADGE[st]])} />
              {STATUS_STYLE[st].label}
            </span>
          ))}
        </div>
      </div>

      {/* FactSales rows, with which roles see each */}
      <div className="mt-4 rounded-lg border border-fd-border bg-fd-background p-3">
        <p className="text-xs text-fd-muted-foreground">FactSales, row by row: what View as Roles should show</p>
        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="text-[10px] uppercase text-fd-muted-foreground">
              <th className="px-1 py-1 text-left font-normal">Store</th>
              <th className="px-1 py-1 text-left font-normal">Region</th>
              <th className="px-1 py-1 text-right font-normal">Amount</th>
              {ROLES.map((r) => (
                <th key={r.key} className="px-0.5 py-1 text-center font-normal normal-case">
                  {r.user}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {SALES.map((f) => {
              const region = STORES.find((s) => s.store === f.store)!.region;
              return (
                <tr key={f.id} className="border-t border-fd-border">
                  <td className="px-1 py-1 text-xs">{f.store}</td>
                  <td className="px-1 py-1 font-sans text-xs">{region}</td>
                  <td className="px-1 py-1 text-right text-xs">{fmt(f.amount)}</td>
                  {ROLES.map((r, i) => {
                    const seen = VIS[i].FactSales.includes(f);
                    return (
                      <td key={r.key} className="px-0.5 py-1 text-center">
                        <span
                          className={cn(
                            'inline-block size-3 rounded-full',
                            seen ? 'bg-sky-500' : 'bg-fd-foreground/10',
                            seen && !r.table && (r.inMatrix ? 'bg-emerald-500' : 'bg-amber-500'),
                          )}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Badge n="1" className="mt-0.5 bg-violet-500" />
          <p>
            <span className="font-mono text-violet-600 dark:text-violet-400">DAX filter</span> — the table the role is
            written against. RegionalManager keeps the DimRegion row whose manager is dana@ (West); SalesRep keeps the
            DimStore row whose rep is sam@ (S1). This is the &quot;Table&quot; column of the matrix.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="2" className="mt-0.5 bg-sky-500" />
          <p>
            <span className="font-mono text-sky-600 dark:text-sky-400">Propagated</span> — the &quot;Propagates To&quot;
            column. The filter follows relationships from the one side to the many side: dana@&apos;s West reaches
            DimStore (S1, S2) and then FactSales ({VIS[0].FactSales.length} of {SALES.length} rows,{' '}
            {fmt(sumOf(0))}).
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="3" className="mt-0.5 bg-fd-muted-foreground" />
          <p>
            <span className="font-mono text-fd-muted-foreground">Not reached</span> — tables the filter would have to
            flow <em>up</em> a relationship to get to. sam@&apos;s role filters DimStore, so DimRegion stays whole:
            East still appears in a Region slicer even though none of its sales are visible. DimProduct is never
            reached from either role. Make a relationship bidirectional, or apply its security filter in both
            directions, and these cells change, which is why the matrix needs re-validating when relationships change.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="4" className="mt-0.5 bg-emerald-500" />
          <p>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Full, by design</span> — Executive has no
            filter, and the matrix says so on its own row. A reviewer can tell it was a decision.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Badge n="5" className="mt-0.5 bg-amber-500" />
          <p>
            <span className="font-mono text-amber-600 dark:text-amber-400">Full, unreviewed</span> — an ad-hoc
            Contractor role added to unblock one user and never written into the matrix. Power BI treats it exactly
            like Executive: same {SALES.length} rows, same {fmt(sumOf(2))}. The two columns can only be told apart by
            the matrix.
          </p>
        </div>
      </div>
    </div>
  );
}
