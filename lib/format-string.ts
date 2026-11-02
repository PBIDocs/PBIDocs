// Pure generation logic for the Format String Builder tool. The format string
// and the preview are both derived from the same options, so the preview shows
// what Power BI will display for that string (in an en-US model locale).

export type NumberKind = 'number' | 'currency' | 'percent';
export type Scale = 'none' | 'K' | 'M' | 'B' | 'auto';
export type NegativeStyle = 'minus' | 'parentheses';
export type ZeroStyle = 'number' | 'dash';

export interface FormatOptions {
  kind: NumberKind;
  scale: Scale;
  decimals: number; // 0-4
  thousands: boolean;
  currencySymbol: string;
  currencyAfter: boolean;
  negative: NegativeStyle;
  zero: ZeroStyle;
  suffix: string;
}

type FixedScale = Exclude<Scale, 'auto'>;

const SCALE_COMMAS: Record<FixedScale, string> = { none: '', K: ',', M: ',,', B: ',,,' };
const SCALE_DIVISOR: Record<FixedScale, number> = { none: 1, K: 1e3, M: 1e6, B: 1e9 };

function quote(text: string): string {
  return text ? `"${text.replace(/"/g, '')}"` : '';
}

function currencyToken(symbol: string): string {
  // Power BI's own currency formats escape the dollar sign rather than quote it.
  return symbol === '$' ? '\\$' : quote(symbol);
}

function positiveSection(opts: FormatOptions, scale: FixedScale): string {
  let s = opts.thousands ? '#,0' : '0';
  if (opts.decimals > 0) s += `.${'0'.repeat(opts.decimals)}`;
  if (opts.kind === 'percent') s += '%';
  else {
    s += SCALE_COMMAS[scale];
    if (scale !== 'none') s += quote(scale);
  }
  if (opts.kind === 'currency' && opts.currencySymbol) {
    s = opts.currencyAfter ? `${s}${quote(` ${opts.currencySymbol}`)}` : `${currencyToken(opts.currencySymbol)}${s}`;
  }
  if (opts.suffix.trim()) s += quote(` ${opts.suffix.trim()}`);
  return s;
}

export function formatStringFor(opts: FormatOptions, scale: FixedScale): string {
  const pos = positiveSection(opts, scale);
  const sections = [pos];
  if (opts.negative === 'parentheses' || opts.zero === 'dash') {
    sections.push(opts.negative === 'parentheses' ? `(${pos})` : `-${pos}`);
  }
  if (opts.zero === 'dash') sections.push('"-"');
  return sections.join(';');
}

const effectiveScale = (opts: FormatOptions): Scale => (opts.kind === 'percent' ? 'none' : opts.scale);

export function staticFormatString(opts: FormatOptions): string | null {
  const scale = effectiveScale(opts);
  return scale === 'auto' ? null : formatStringFor(opts, scale);
}

export function daxString(text: string): string {
  return `"${text.replace(/"/g, '""')}"`;
}

export function dynamicFormatExpression(opts: FormatOptions): string {
  return [
    'VAR Value = ABS(SELECTEDMEASURE())',
    'RETURN',
    '    SWITCH(',
    '        TRUE(),',
    `        Value >= 1E9, ${daxString(formatStringFor(opts, 'B'))},`,
    `        Value >= 1E6, ${daxString(formatStringFor(opts, 'M'))},`,
    `        Value >= 1E3, ${daxString(formatStringFor(opts, 'K'))},`,
    `        ${daxString(formatStringFor(opts, 'none'))}`,
    '    )',
  ].join('\n');
}

function autoScaleFor(value: number): FixedScale {
  const abs = Math.abs(value);
  return abs >= 1e9 ? 'B' : abs >= 1e6 ? 'M' : abs >= 1e3 ? 'K' : 'none';
}

export function previewValue(opts: FormatOptions, value: number): string {
  if (value === 0 && opts.zero === 'dash') return '-';
  const configured = effectiveScale(opts);
  const scale: FixedScale = configured === 'auto' ? autoScaleFor(value) : configured;
  const scaled = (opts.kind === 'percent' ? value * 100 : value / SCALE_DIVISOR[scale]);
  const digits = Math.abs(scaled).toLocaleString('en-US', {
    minimumFractionDigits: opts.decimals,
    maximumFractionDigits: opts.decimals,
    useGrouping: opts.thousands,
  });

  let body = digits;
  if (opts.kind === 'percent') body += '%';
  else if (scale !== 'none') body += scale;
  if (opts.kind === 'currency' && opts.currencySymbol) {
    body = opts.currencyAfter ? `${body} ${opts.currencySymbol}` : `${opts.currencySymbol}${body}`;
  }
  if (opts.suffix.trim()) body += ` ${opts.suffix.trim()}`;

  // A value that rounds to zero still uses the negative section.
  if (value < 0) return opts.negative === 'parentheses' ? `(${body})` : `-${body}`;
  return body;
}

export function sampleValues(kind: NumberKind): number[] {
  return kind === 'percent' ? [0.4567, 0.125, 1.5, 0.0004, 0, -0.032] : [2345678901, 1234567.891, 45210.5, 987.65, 0, -8650.25];
}
