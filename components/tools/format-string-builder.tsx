'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/highlight-code';
import {
  daxString,
  dynamicFormatExpression,
  previewValue,
  sampleValues,
  staticFormatString,
  type FormatOptions,
  type NegativeStyle,
  type NumberKind,
  type Scale,
  type ZeroStyle,
} from '@/lib/format-string';

const DEFAULT_OPTIONS: FormatOptions = {
  kind: 'currency',
  scale: 'M',
  decimals: 1,
  thousands: true,
  currencySymbol: '$',
  currencyAfter: false,
  negative: 'minus',
  zero: 'number',
  suffix: '',
};

const CURRENCIES = ['$', '€', '£', '¥', '₹', 'kr', 'CHF'];

const inputClass =
  'w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

function Segmented<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        'inline-flex w-fit flex-wrap rounded-full border border-fd-border p-1 text-sm',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-full px-3 py-1 font-medium transition-colors',
            value === o.value
              ? 'bg-fd-primary text-fd-primary-foreground'
              : 'text-fd-muted-foreground hover:text-fd-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </div>
  );
}

function CopyBlock({ title, help, code }: { title: string; help: ReactNode; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm text-fd-muted-foreground">{help}</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-fd-secondary px-4 py-3 text-sm">
        <code>{highlightCode(code)}</code>
      </pre>
    </div>
  );
}

export function FormatStringBuilder() {
  const [opts, setOpts] = useState<FormatOptions>(DEFAULT_OPTIONS);
  const [customValue, setCustomValue] = useState('');

  function update<K extends keyof FormatOptions>(key: K, value: FormatOptions[K]) {
    setOpts((prev) => ({ ...prev, [key]: value }));
  }

  const isPercent = opts.kind === 'percent';
  const formatString = useMemo(() => staticFormatString(opts), [opts]);
  const dynamicExpr = useMemo(() => dynamicFormatExpression(opts), [opts]);
  const custom = customValue.trim() === '' ? null : Number(customValue.replace(/,/g, ''));
  const values = [...sampleValues(opts.kind), ...(custom !== null && Number.isFinite(custom) ? [custom] : [])];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-xl border border-fd-border p-5">
        <Field label="Number type">
          <Segmented<NumberKind>
            value={opts.kind}
            onChange={(v) => update('kind', v)}
            options={[
              { value: 'number', label: 'Number' },
              { value: 'currency', label: 'Currency' },
              { value: 'percent', label: 'Percentage' },
            ]}
          />
        </Field>

        <Field label="Show in">
          <Segmented<Scale>
            value={isPercent ? 'none' : opts.scale}
            onChange={(v) => update('scale', v)}
            disabled={isPercent}
            options={[
              { value: 'none', label: 'Units' },
              { value: 'K', label: 'Thousands (K)' },
              { value: 'M', label: 'Millions (M)' },
              { value: 'B', label: 'Billions (B)' },
              { value: 'auto', label: 'Auto K / M / B' },
            ]}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Decimal places">
            <select
              value={opts.decimals}
              onChange={(e) => update('decimals', Number(e.target.value))}
              className={inputClass}
            >
              {[0, 1, 2, 3, 4].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          {opts.kind === 'currency' && (
            <>
              <Field label="Currency symbol">
                <select
                  value={opts.currencySymbol}
                  onChange={(e) => update('currencySymbol', e.target.value)}
                  className={inputClass}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Symbol position">
                <select
                  value={opts.currencyAfter ? 'after' : 'before'}
                  onChange={(e) => update('currencyAfter', e.target.value === 'after')}
                  className={inputClass}
                >
                  <option value="before">Before ({opts.currencySymbol}1,234)</option>
                  <option value="after">After (1,234 {opts.currencySymbol})</option>
                </select>
              </Field>
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Negative numbers">
            <Segmented<NegativeStyle>
              value={opts.negative}
              onChange={(v) => update('negative', v)}
              options={[
                { value: 'minus', label: '-1,234' },
                { value: 'parentheses', label: '(1,234)' },
              ]}
            />
          </Field>
          <Field label="Zero">
            <Segmented<ZeroStyle>
              value={opts.zero}
              onChange={(v) => update('zero', v)}
              options={[
                { value: 'number', label: 'Show the number' },
                { value: 'dash', label: 'Show a dash' },
              ]}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={opts.thousands}
              onChange={(e) => update('thousands', e.target.checked)}
              className="size-4 accent-fd-primary"
            />
            Thousands separator
          </label>
          <Field label="Unit after the number (optional)">
            <input
              type="text"
              value={opts.suffix}
              onChange={(e) => update('suffix', e.target.value)}
              placeholder="e.g. hrs, units, kg"
              maxLength={20}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-xl border border-fd-border p-5">
        {formatString !== null ? (
          <>
            <CopyBlock
              title="Format string"
              help={
                <>
                  Select the measure, then type this into the{' '}
                  <strong className="text-fd-foreground">Format</strong> box on the{' '}
                  <strong className="text-fd-foreground">Measure tools</strong> ribbon.
                </>
              }
              code={formatString}
            />
            <CopyBlock
              title="Same format as text, with FORMAT()"
              help="Only for titles and labels: FORMAT() returns text, so the result no longer sorts or sums as a number."
              code={`FORMAT([Total Sales], ${daxString(formatString)})`}
            />
          </>
        ) : (
          <CopyBlock
            title="Dynamic format string"
            help={
              <>
                A fixed format string can&apos;t switch between K, M, and B, so this picks one per value.
                Select the measure, set <strong className="text-fd-foreground">Measure tools → Format</strong> to{' '}
                <strong className="text-fd-foreground">Dynamic</strong>, and paste this into the formula bar.
              </>
            }
            code={dynamicExpr}
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">Preview</h2>
          <label className="flex items-center gap-2 text-sm">
            Try a value
            <input
              type="text"
              inputMode="decimal"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder={isPercent ? '0.25' : '1500000'}
              className="w-36 rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
            />
          </label>
        </div>
        <div className="overflow-hidden rounded-lg border border-fd-border">
          <table className="w-full text-sm">
            <thead className="bg-fd-secondary/60 text-left text-xs">
              <tr>
                <th className="px-3 py-2 font-semibold">Stored value</th>
                <th className="px-3 py-2 text-right font-semibold">Displays as</th>
              </tr>
            </thead>
            <tbody>
              {values.map((v, i) => (
                <tr key={`${v}-${i}`} className="border-t border-fd-border">
                  <td className="px-3 py-1.5 font-mono text-fd-muted-foreground">{v}</td>
                  <td className="px-3 py-1.5 text-right font-mono font-medium">{previewValue(opts, v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-fd-muted-foreground">
          {isPercent
            ? 'The % sign multiplies by 100, so store percentages as fractions: 0.25 displays as 25%. '
            : 'Each comma at the end of the number part divides by 1,000 for display only; the stored value is unchanged. '}
          In a format string, the comma and period mean &ldquo;thousands separator&rdquo; and &ldquo;decimal
          point&rdquo;, so a model with a German or French locale shows them its own way.
        </p>
      </div>
    </div>
  );
}
