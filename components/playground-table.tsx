import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function PlaygroundTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-fd-border">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="bg-fd-secondary/50 text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">
            <th className="px-3 py-2 text-left">Field</th>
            <th className="px-3 py-2 text-left">Value</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function PlaygroundRow({
  label,
  highlight,
  children,
}: {
  label: ReactNode;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <tr className={cn('border-t border-fd-border', highlight && 'bg-fd-primary/5')}>
      <td
        className={cn(
          'whitespace-nowrap px-3 py-2 align-middle font-mono',
          highlight ? 'font-semibold text-fd-primary' : 'text-fd-muted-foreground',
        )}
      >
        {label}
      </td>
      <td className="px-3 py-1.5 align-middle">
        <div className="flex flex-wrap items-center gap-1.5">{children}</div>
      </td>
    </tr>
  );
}
