// DAX Syntax Checker: a tokenizer plus targeted checks for the mistakes that
// produce "The syntax for '...' is incorrect". It isn't a full DAX parser and
// it doesn't know the model, so every check aims for no false alarms: each one
// fires only on text that can't be valid DAX, or (as a warning) almost never is.
// Each issue maps to a cause section of the blog post that explains it.

export type Separators = 'standard' | 'locale';
export type Severity = 'error' | 'warning';
export type Cause = 1 | 2 | 3 | 4 | 5 | 6;

export interface Edit {
  start: number;
  end: number;
  text: string;
}

export interface Issue {
  severity: Severity;
  cause: Cause | null;
  title: string;
  detail: string;
  start: number;
  end: number;
  fix?: Edit[];
  fixLabel?: string;
  // The fix is "convert every separator and decimal mark to the other style".
  convertSeparators?: boolean;
}

export const BLOG_POST = '/blog/dax-syntax-is-incorrect-error';

export const CAUSE_ANCHORS: Record<Cause, string> = {
  1: 'cause-1-a-trailing-or-missing-comma',
  2: 'cause-2-unbalanced-parentheses',
  3: 'cause-3-comma-vs-semicolon-separators',
  4: 'cause-4-smart-quotes-from-copy-paste',
  5: 'cause-5-table-names-with-spaces-missing-their-quotes',
  6: 'cause-6-var-without-return-or-other-keyword-slips',
};

// ---------------------------------------------------------------- tokenizer

type Kind =
  | 'string'
  | 'qname'
  | 'bname'
  | 'ref'
  | 'number'
  | 'ident'
  | 'op'
  | 'sep'
  | 'lparen'
  | 'rparen'
  | 'lbrace'
  | 'rbrace'
  | 'bad';

interface Tok {
  kind: Kind;
  text: string;
  start: number;
  end: number;
  // string / qname / bname
  unterminated?: boolean;
  // string / qname opened or closed with a curly quote: positions of those chars
  smartAt?: number[];
  // ref: the table part (ident or qname) in front of the [column]
  table?: Tok;
}

const DQ_SMART = '“”„‟';
const SQ_SMART = '‘’‚‛';

function tokenize(src: string, from: number, sep: Separators): { toks: Tok[]; issues: Issue[] } {
  const toks: Tok[] = [];
  const issues: Issue[] = [];
  const n = src.length;
  let i = from;
  const numRe = sep === 'standard' ? /\d*\.?\d+(?:[eE][+-]?\d+)?/y : /\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?/y;
  const identRe = /[\p{L}_][\p{L}\p{N}_.]*/uy;

  while (i < n) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    // Comments
    if ((c === '/' && src[i + 1] === '/') || (c === '-' && src[i + 1] === '-')) {
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const close = src.indexOf('*/', i + 2);
      if (close === -1) {
        issues.push({
          severity: 'error',
          cause: null,
          title: 'A /* comment */ never closes',
          detail: 'Everything after /* is treated as a comment until */. Close the comment, or DAX never sees the rest of the formula.',
          start: i,
          end: i + 2,
        });
        i = n;
      } else i = close + 2;
      continue;
    }
    const start = i;
    // Strings: straight quotes with "" as the escape, or a curly-quote pair.
    if (c === '"' || DQ_SMART.includes(c)) {
      const smartAt: number[] = [];
      if (c !== '"') smartAt.push(i);
      i++;
      let closed = false;
      while (i < n) {
        const d = src[i];
        if (c === '"' && d === '"') {
          if (src[i + 1] === '"') {
            i += 2;
            continue;
          }
          closed = true;
          i++;
          break;
        }
        if (c !== '"' && (d === '"' || DQ_SMART.includes(d))) {
          if (d !== '"') smartAt.push(i);
          closed = true;
          i++;
          break;
        }
        i++;
      }
      toks.push({ kind: 'string', text: src.slice(start, i), start, end: i, unterminated: !closed, smartAt });
      continue;
    }
    if (c === "'" || SQ_SMART.includes(c)) {
      const smartAt: number[] = [];
      if (c !== "'") smartAt.push(i);
      i++;
      let closed = false;
      while (i < n && src[i] !== '\n') {
        const d = src[i];
        if (c === "'" && d === "'") {
          if (src[i + 1] === "'") {
            i += 2;
            continue;
          }
          closed = true;
          i++;
          break;
        }
        if (c !== "'" && (d === "'" || SQ_SMART.includes(d))) {
          if (d !== "'") smartAt.push(i);
          closed = true;
          i++;
          break;
        }
        i++;
      }
      toks.push({ kind: 'qname', text: src.slice(start, i), start, end: i, unterminated: !closed, smartAt });
      continue;
    }
    if (c === '[') {
      i++;
      let closed = false;
      while (i < n && src[i] !== '\n') {
        if (src[i] === ']') {
          if (src[i + 1] === ']') {
            i += 2;
            continue;
          }
          closed = true;
          i++;
          break;
        }
        i++;
      }
      toks.push({ kind: 'bname', text: src.slice(start, i), start, end: i, unterminated: !closed });
      continue;
    }
    if (/\d/.test(c) || (c === '.' && /\d/.test(src[i + 1] ?? ''))) {
      numRe.lastIndex = i;
      const m = numRe.exec(src);
      if (m) {
        i += m[0].length;
        toks.push({ kind: 'number', text: m[0], start, end: i });
        continue;
      }
    }
    identRe.lastIndex = i;
    const id = identRe.exec(src);
    if (id) {
      i += id[0].length;
      toks.push({ kind: 'ident', text: id[0], start, end: i });
      continue;
    }
    const two = src.slice(i, i + 2);
    if (['&&', '||', '<>', '<=', '>=', '==', '!=', ':='].includes(two)) {
      i += 2;
      toks.push({ kind: 'op', text: two, start, end: i });
      continue;
    }
    if ('=<>+-*/^&'.includes(c)) {
      i++;
      toks.push({ kind: 'op', text: c, start, end: i });
      continue;
    }
    const single: Record<string, Kind> = { ',': 'sep', ';': 'sep', '(': 'lparen', ')': 'rparen', '{': 'lbrace', '}': 'rbrace' };
    i += c.length;
    toks.push({ kind: single[c] ?? 'bad', text: c, start, end: i });
  }
  return { toks, issues };
}

// ------------------------------------------------------------- vocabulary

// Words that sit between values without being a value themselves.
const STRUCTURAL = new Set(['VAR', 'RETURN', 'IN', 'NOT', 'ASC', 'DESC', 'DEFINE', 'EVALUATE', 'ORDER', 'BY', 'START', 'AT']);
// Declaration words that only act as keywords in a DAX query (DEFINE / EVALUATE).
const QUERY_DECL = new Set(['MEASURE', 'COLUMN', 'TABLE', 'FUNCTION']);

// Argument counts for common functions, [min, max]. Only signatures that are
// stable and well known, so a count mismatch is a sure error.
const INF = Number.POSITIVE_INFINITY;
const ARITY: Record<string, [number, number]> = {
  SUM: [1, 1], AVERAGE: [1, 1], COUNT: [1, 1], COUNTA: [1, 1], COUNTBLANK: [1, 1],
  DISTINCTCOUNT: [1, 1], DISTINCTCOUNTNOBLANK: [1, 1], MIN: [1, 2], MAX: [1, 2], COUNTROWS: [0, 1],
  SUMX: [2, 2], AVERAGEX: [2, 2], COUNTX: [2, 2], COUNTAX: [2, 2], MINX: [2, 3], MAXX: [2, 3],
  RELATED: [1, 1], RELATEDTABLE: [1, 1], VALUES: [1, 1], DISTINCT: [1, 1], FILTER: [2, 2],
  IF: [2, 3], IFERROR: [2, 2], DIVIDE: [2, 3], SELECTEDVALUE: [1, 2], HASONEVALUE: [1, 1],
  ISBLANK: [1, 1], BLANK: [0, 0], TODAY: [0, 0], NOW: [0, 0], TRUE: [0, 0], FALSE: [0, 0],
  LOOKUPVALUE: [3, INF], CALCULATE: [1, INF], CALCULATETABLE: [1, INF], SWITCH: [3, INF],
  FORMAT: [2, 3], SAMEPERIODLASTYEAR: [1, 1], USERELATIONSHIP: [2, 2], CROSSFILTER: [3, 3],
  KEEPFILTERS: [1, 1], ROUND: [2, 2], ABS: [1, 1], INT: [1, 1], LEN: [1, 1], LEFT: [1, 2],
  RIGHT: [1, 2], MID: [3, 3], UPPER: [1, 1], LOWER: [1, 1], TRIM: [1, 1], CONCATENATE: [2, 2],
  DATEDIFF: [3, 3], YEAR: [1, 1], MONTH: [1, 1], DAY: [1, 1], DATE: [3, 3], EOMONTH: [2, 2],
  NOT: [1, 1], AND: [2, 2], OR: [2, 2], COALESCE: [2, INF], ISFILTERED: [1, 1], ISINSCOPE: [1, 1],
  EARLIER: [1, 2], TOPN: [2, INF], RANKX: [2, 5],
};

// Excel functions people reach for that DAX doesn't have.
const EXCEL_ONLY: Record<string, string> = {
  SUMIF: 'CALCULATE(SUM(Table[Column]), <filter>)',
  SUMIFS: 'CALCULATE(SUM(Table[Column]), <filter>, <filter>)',
  COUNTIF: 'CALCULATE(COUNTROWS(Table), <filter>)',
  COUNTIFS: 'CALCULATE(COUNTROWS(Table), <filter>, <filter>)',
  AVERAGEIF: 'CALCULATE(AVERAGE(Table[Column]), <filter>)',
  AVERAGEIFS: 'CALCULATE(AVERAGE(Table[Column]), <filter>, <filter>)',
  MAXIFS: 'CALCULATE(MAX(Table[Column]), <filter>)',
  MINIFS: 'CALCULATE(MIN(Table[Column]), <filter>)',
  VLOOKUP: 'RELATED() across a relationship, or LOOKUPVALUE()',
  HLOOKUP: 'RELATED() across a relationship, or LOOKUPVALUE()',
  XLOOKUP: 'RELATED() across a relationship, or LOOKUPVALUE()',
  IFS: 'SWITCH(TRUE(), <condition>, <result>, ...)',
  IFNA: 'IFERROR()',
  TEXTJOIN: 'CONCATENATEX()',
};

// ---------------------------------------------------------------- helpers

function upper(t: Tok | undefined) {
  return t?.kind === 'ident' ? t.text.toUpperCase() : '';
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function arityText([min, max]: [number, number]) {
  if (min === max) return plural(min, 'argument');
  if (max === INF) return `at least ${plural(min, 'argument')}`;
  return `${min} or ${max} arguments`;
}

// Find the measure-name prefix ("Total Sales =" or "Total Sales :=") so the
// spaces in a measure name aren't read as missing commas.
function bodyStart(src: string): number {
  const m = /^\s*([^=\n"'[\],;{}]+?)\s*:?=(?!=)/.exec(src);
  if (!m) return 0;
  const name = m[1];
  // "IF(x = 1" is code, not a name: an identifier directly followed by "(".
  if (/^[\p{L}_][\p{L}\p{N}_.]*\(/u.test(name.trim())) return 0;
  if (/[<>!&|+*/^]$/.test(name)) return 0;
  // "VAR x = 1 ..." starts with code too.
  if (/^(VAR|DEFINE|EVALUATE|RETURN)\b/i.test(name.trim())) return 0;
  return m[0].length;
}

// Which separator style a formula is written in: any ';' outside strings,
// names, and comments means locale-based.
function styleOf(src: string, from: number): Separators {
  const { toks } = tokenize(src, from, 'standard');
  return toks.some((t) => t.kind === 'sep' && t.text === ';') ? 'locale' : 'standard';
}

// Rewrite every separator and decimal mark from one style to the other.
export function convertSeparators(src: string, from: Separators): string {
  const { toks } = tokenize(src, 0, from);
  let out = '';
  let last = 0;
  for (const t of toks) {
    let text = t.text;
    if (t.kind === 'sep') text = from === 'locale' ? (t.text === ';' ? ',' : t.text) : t.text === ',' ? ';' : t.text;
    else if (t.kind === 'number') text = from === 'locale' ? t.text.replace(',', '.') : t.text.replace('.', ',');
    else continue;
    out += src.slice(last, t.start) + text;
    last = t.end;
  }
  return out + src.slice(last);
}

export function applyEdits(src: string, edits: Edit[]): string {
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let out = src;
  let floor = Number.POSITIVE_INFINITY;
  for (const e of sorted) {
    if (e.end > floor) continue; // overlaps an edit already applied
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
    floor = e.start;
  }
  return out;
}

// ------------------------------------------------------------------ check

interface Frame {
  kind: 'root' | 'call' | 'group' | 'brace';
  open: Tok | null;
  name: string;
  nameStart: number;
  trailing: boolean; // a trailing separator was already reported
  args: number; // separators seen
  content: boolean; // anything inside yet
  pendingVar: Tok | null;
}

export interface CheckResult {
  issues: Issue[];
  style: Separators;
  mismatch: boolean;
}

export function checkDax(src: string, setting: Separators): CheckResult {
  const from = bodyStart(src);
  const style = styleOf(src, from);
  const { toks: raw, issues } = tokenize(src, from, style);

  // Merge Table[Column] and 'Table'[Column] into one reference token.
  const queryMode = raw.some((t) => ['EVALUATE', 'DEFINE'].includes(upper(t)));
  const isKeyword = (t: Tok | undefined) =>
    !!t && t.kind === 'ident' && (STRUCTURAL.has(upper(t)) || (queryMode && QUERY_DECL.has(upper(t))));
  const toks: Tok[] = [];
  for (const t of raw) {
    const prev = toks[toks.length - 1];
    if (t.kind !== 'bname') {
      toks.push(t);
      continue;
    }
    if (prev && (prev.kind === 'qname' || prev.kind === 'ident') && !isKeyword(prev)) {
      toks[toks.length - 1] = { kind: 'ref', text: src.slice(prev.start, t.end), start: prev.start, end: t.end, table: prev };
    } else toks.push({ ...t, kind: 'ref' });
    if (t.unterminated) {
      issues.push({
        severity: 'error',
        cause: null,
        title: 'A [ never closes',
        detail: 'Column and measure names sit inside square brackets, on one line. Add the closing ].',
        start: t.start,
        end: Math.min(t.end, t.start + 1),
      });
    }
  }

  if (from > 0 && toks.length === 0) {
    issues.push({
      severity: 'error',
      cause: null,
      title: 'Nothing after the =',
      detail: 'The formula has a name but no expression. Add the calculation after the equals sign.',
      start: from - 1,
      end: from,
    });
  }

  // Separator style vs the Desktop setting.
  const seps = toks.filter((t) => t.kind === 'sep');
  const mismatch = seps.length > 0 && style !== setting;
  if (mismatch) {
    const first = seps.find((t) => t.text === (style === 'locale' ? ';' : ',')) ?? seps[0];
    issues.push({
      severity: 'error',
      cause: 3,
      title: style === 'locale' ? 'Semicolon separators, but your setting expects commas' : 'Comma separators, but your setting expects semicolons',
      detail:
        style === 'locale'
          ? 'This formula is written with locale-based separators (; between arguments, comma as the decimal mark). With standard separators selected, every ; is a syntax error.'
          : 'This formula uses standard separators (, between arguments, period as the decimal mark). With locale-based separators selected, Desktop expects ; between arguments.',
      start: first.start,
      end: first.end,
      convertSeparators: true,
      fixLabel: `Convert to ${setting === 'standard' ? 'commas' : 'semicolons'}`,
    });
  }

  // Matching parentheses, for the IN ( ... ) check.
  const match = new Map<number, number>();
  {
    const stack: number[] = [];
    toks.forEach((t, idx) => {
      if (t.kind === 'lparen') stack.push(idx);
      else if (t.kind === 'rparen' && stack.length) match.set(stack.pop()!, idx);
    });
  }

  const isAndOrInfix = (idx: number) => ['AND', 'OR'].includes(upper(toks[idx])) && toks[idx + 1]?.kind !== 'lparen';
  const isCall = (idx: number) => toks[idx]?.kind === 'ident' && !isKeyword(toks[idx]) && toks[idx + 1]?.kind === 'lparen';
  const isValueEnd = (idx: number) => {
    const t = toks[idx];
    if (!t) return false;
    if (t.kind === 'ident') return !isKeyword(t) && !isAndOrInfix(idx) && !isCall(idx);
    return ['string', 'qname', 'ref', 'number', 'rparen', 'rbrace'].includes(t.kind);
  };
  const isValueStart = (idx: number) => {
    const t = toks[idx];
    if (!t) return false;
    if (t.kind === 'ident') return !isKeyword(t) && !isAndOrInfix(idx);
    return ['string', 'qname', 'ref', 'number', 'lparen', 'lbrace'].includes(t.kind);
  };
  const bareIdent = (t: Tok | undefined) => !!t && t.kind === 'ident' && !isKeyword(t);
  const sepText = setting === 'standard' ? ',' : ';';
  const spacedVars = new Set<string>(); // VAR names with spaces, already reported

  const stack: Frame[] = [{ kind: 'root', open: null, name: '', nameStart: 0, trailing: false, args: 0, content: false, pendingVar: null }];
  const missingReturn = (v: Tok): Issue => ({
    severity: 'error',
    cause: 6,
    title: 'VAR without a RETURN',
    detail: 'Variables only define values. A VAR block has to end with RETURN and the expression to return, or DAX reaches the end with nothing to give back.',
    start: v.start,
    end: v.end,
  });

  function closeFrame(f: Frame, closer: Tok | null) {
    if (f.pendingVar) issues.push(missingReturn(f.pendingVar));
    if (f.kind === 'call') {
      const name = f.name.toUpperCase();
      const count = (f.content || f.args > 0 ? f.args + 1 : 0) - (f.trailing ? 1 : 0);
      const arity = ARITY[name];
      if (arity && (count < arity[0] || count > arity[1])) {
        const andOr = (name === 'AND' || name === 'OR') && count > 2;
        issues.push({
          severity: 'error',
          cause: null,
          title: `${name} takes ${arityText(arity)}, but this call has ${count}`,
          detail: andOr
            ? `${name} only ever combines two conditions. For three or more, chain them with ${name === 'AND' ? '&&' : '||'} instead: a ${name === 'AND' ? '&&' : '||'} b ${name === 'AND' ? '&&' : '||'} c.`
            : 'Check the arguments against the function signature: a separator may be missing, extra, or in the wrong parentheses.',
          start: f.nameStart,
          end: closer ? closer.end : f.open ? f.open.end : 0,
        });
      }
    }
  }

  for (let idx = 0; idx < toks.length; idx++) {
    const t = toks[idx];
    const prev = toks[idx - 1];
    const next = toks[idx + 1];
    const frame = stack[stack.length - 1];
    const word = upper(t);

    // Curly quotes and unclosed strings / names.
    if ((t.kind === 'string' || t.kind === 'qname') && t.smartAt && t.smartAt.length > 0) {
      const straight = t.kind === 'string' ? '"' : "'";
      issues.push({
        severity: 'error',
        cause: 4,
        title: 'Curly “smart” quotes',
        detail: `DAX only recognizes the straight ${straight} character. Blogs, Word, Outlook, and Teams often swap in curly quotes when you copy a formula.`,
        start: t.start,
        end: t.end,
        fix: t.smartAt.map((p) => ({ start: p, end: p + 1, text: straight })),
        fixLabel: `Straighten the quotes`,
      });
    } else if ((t.kind === 'string' || t.kind === 'qname') && t.unterminated) {
      const set = t.kind === 'string' ? DQ_SMART : SQ_SMART;
      const straight = t.kind === 'string' ? '"' : "'";
      const rel = [...t.text].findIndex((ch, k) => k > 0 && set.includes(ch));
      if (rel > 0) {
        const p = t.start + t.text.slice(0, rel).length;
        issues.push({
          severity: 'error',
          cause: 4,
          title: 'A curly quote closes this text',
          detail: `It opens with a straight ${straight} but closes with a curly one, which DAX doesn't treat as a quote, so it reads the rest of the formula as part of the text.`,
          start: t.start,
          end: p + 1,
          fix: [{ start: p, end: p + 1, text: straight }],
          fixLabel: 'Straighten the quote',
        });
      } else {
        issues.push({
          severity: 'error',
          cause: null,
          title: t.kind === 'string' ? 'This text never closes' : "This ' table name never closes",
          detail:
            t.kind === 'string'
              ? 'Text in DAX goes between double quotes. Add the closing ". To put a quote inside text, double it: "Say ""hi""".'
              : "Quoted table names open and close with a single quote on one line: 'Sales Table'.",
          start: t.start,
          end: Math.min(t.end, t.start + 1),
        });
      }
    }

    if (t.kind === 'number' && setting === 'locale' && t.text.includes('.') && !mismatch) {
      issues.push({
        severity: 'error',
        cause: 3,
        title: 'Period as a decimal mark',
        detail: 'With locale-based separators, the decimal mark is a comma: 0,9 rather than 0.9.',
        start: t.start,
        end: t.end,
        fix: [{ start: t.start, end: t.end, text: t.text.replace('.', ',') }],
        fixLabel: 'Use a decimal comma',
      });
    }

    if (t.kind === 'bad') {
      issues.push({
        severity: 'error',
        cause: null,
        title: `DAX doesn't use ${t.text === '!' ? '!' : `the ${t.text} character`} here`,
        detail:
          t.text === '%'
            ? 'DAX has no % operator. Divide by 100, or keep the fraction and give the measure a percentage format string.'
            : t.text === '!'
              ? 'DAX has no ! operator. For "not", use NOT(...); for "not equal", use <>.'
              : 'This character has no meaning in DAX outside text or a [name]. If it belongs to a table name, wrap the whole name in single quotes.',
        start: t.start,
        end: t.end,
      });
    }

    if (t.kind === 'op' && t.text === '!=') {
      issues.push({
        severity: 'error',
        cause: 6,
        title: 'DAX has no != operator',
        detail: '"Not equal to" in DAX is <>.',
        start: t.start,
        end: t.end,
        fix: [{ start: t.start, end: t.end, text: '<>' }],
        fixLabel: 'Use <>',
      });
    } else if (t.kind === 'op' && t.text === ':=') {
      issues.push({
        severity: 'error',
        cause: null,
        title: ':= only belongs after a measure name',
        detail: 'Use = for comparisons. := is only accepted as the definition sign right after the name.',
        start: t.start,
        end: t.end,
      });
    }

    // Binary operators need a value on both sides.
    if (t.kind === 'op' && t.text !== '!=' && t.text !== ':=') {
      const unary = t.text === '+' || t.text === '-';
      const prevIsGap = !prev || ['lparen', 'lbrace', 'sep', 'op'].includes(prev.kind) || (isKeyword(prev) && upper(prev) !== 'NOT') || isAndOrInfix(idx - 1);
      if (!unary && prevIsGap && !(prev?.kind === 'op' && prev.text === '!=')) {
        issues.push({
          severity: 'error',
          cause: null,
          title: `Nothing before ${t.text}`,
          detail: `${t.text} compares or combines two values, and there's no value in front of it.`,
          start: t.start,
          end: t.end,
        });
      }
      if (!next || ['rparen', 'rbrace', 'sep'].includes(next.kind) || ['RETURN', 'VAR'].includes(upper(next))) {
        issues.push({
          severity: 'error',
          cause: null,
          title: `Nothing after ${t.text}`,
          detail: `The formula has an operator with no value after it. Finish the expression, or delete the ${t.text}.`,
          start: t.start,
          end: t.end,
        });
      }
    }

    // AND / OR written as operators.
    if (isAndOrInfix(idx)) {
      const op = word === 'AND' ? '&&' : '||';
      issues.push({
        severity: 'error',
        cause: 6,
        title: `${word} used as an operator`,
        detail: `In DAX, ${word} is a two-argument function: ${word}(a, b). Between two conditions, use the ${op} operator.`,
        start: t.start,
        end: t.end,
        fix: [{ start: t.start, end: t.end, text: op }],
        fixLabel: `Use ${op}`,
      });
    }

    // IN ( "a", "b" ) instead of IN { "a", "b" }
    if (word === 'IN' && next?.kind === 'lparen' && match.has(idx + 1)) {
      const close = match.get(idx + 1)!;
      let depth = 0;
      let listy = false;
      for (let k = idx + 2; k < close; k++) {
        const u = toks[k];
        if (u.kind === 'lparen' || u.kind === 'lbrace') depth++;
        else if (u.kind === 'rparen' || u.kind === 'rbrace') depth--;
        else if (u.kind === 'sep' && depth === 0) listy = true;
      }
      if (listy) {
        issues.push({
          severity: 'error',
          cause: 6,
          title: 'IN needs curly braces',
          detail: 'IN checks against a table, and a list of values becomes a table with the { } constructor: [Region] IN { "East", "West" }.',
          start: next.start,
          end: toks[close].end,
          fix: [
            { start: next.start, end: next.end, text: '{' },
            { start: toks[close].start, end: toks[close].end, text: '}' },
          ],
          fixLabel: 'Use { }',
        });
      }
    }

    // Excel-only function names.
    if (isCall(idx) && EXCEL_ONLY[word]) {
      issues.push({
        severity: 'error',
        cause: null,
        title: `${word} is an Excel function, not DAX`,
        detail: `DAX has no ${word}. The DAX way: ${EXCEL_ONLY[word]}.`,
        start: t.start,
        end: t.end,
      });
    }

    // VAR name checks.
    if (word === 'VAR') {
      if (!(queryMode && stack.length === 1)) frame.pendingVar ??= t;
      if (!bareIdent(next)) {
        issues.push({
          severity: 'error',
          cause: 6,
          title: 'VAR needs a name',
          detail: 'Write VAR, a name with no spaces, an equals sign, and the value: VAR TotalSales = SUM(Sales[Amount]).',
          start: t.start,
          end: t.end,
        });
      } else {
        let k = idx + 1;
        while (bareIdent(toks[k + 1])) k++;
        const after = toks[k + 1];
        if (k > idx + 1 && after?.kind === 'op' && after.text === '=') {
          const name = src.slice(toks[idx + 1].start, toks[k].end);
          spacedVars.add(name.replace(/\s+/g, ' '));
          issues.push({
            severity: 'error',
            cause: 6,
            title: 'Variable names can’t contain spaces',
            detail: `Rename "${name}" to something like ${name.replace(/\s+/g, '')} or _${name.replace(/\s+/g, '_')}, and update everywhere it's used.`,
            start: toks[idx + 1].start,
            end: toks[k].end,
          });
          idx = k; // the words of the name aren't missing commas
          frame.content = true;
          continue;
        }
        if (!after || !(after.kind === 'op' && after.text === '=')) {
          issues.push({
            severity: 'error',
            cause: 6,
            title: 'VAR name needs an = after it',
            detail: `Write VAR ${toks[idx + 1].text} = <value>.`,
            start: toks[idx + 1].start,
            end: toks[idx + 1].end,
          });
        }
      }
    }
    if (word === 'RETURN') {
      if (frame.pendingVar) frame.pendingVar = null;
      else {
        issues.push({
          severity: 'error',
          cause: 6,
          title: 'RETURN without a VAR before it',
          detail: 'RETURN ends a block of VAR definitions. Without any VAR in the same parentheses, delete RETURN.',
          start: t.start,
          end: t.end,
        });
      }
    }

    // Two values in a row: a missing comma, a missing RETURN, or a table name with spaces.
    if (idx > 0 && isValueEnd(idx - 1) && isValueStart(idx) && !(isCall(idx - 1) && t.kind === 'lparen')) {
      const tableWithSpace =
        bareIdent(prev) &&
        !isCall(idx - 1) &&
        ((t.kind === 'ref' && t.table?.kind === 'ident') || (bareIdent(t) && !isCall(idx))) &&
        !/\n/.test(src.slice(prev.end, t.start));
      if (tableWithSpace) {
        // Walk back over every word of the table name.
        let k = idx - 1;
        while (k > 0 && bareIdent(toks[k - 1]) && !isCall(k - 1) && !/\n/.test(src.slice(toks[k - 1].end, toks[k].start))) k--;
        const nameEnd = t.kind === 'ref' ? t.table!.end : t.end;
        const name = src.slice(toks[k].start, nameEnd);
        if (!spacedVars.has(name.replace(/\s+/g, ' '))) issues.push({
          severity: 'error',
          cause: 5,
          title: 'Table name with spaces needs single quotes',
          detail: `DAX reads "${name}" as separate words. A table name with spaces must be quoted: '${name}'${t.kind === 'ref' ? src.slice(t.table!.end, t.end) : ''}.`,
          start: toks[k].start,
          end: nameEnd,
          fix: [{ start: toks[k].start, end: nameEnd, text: `'${name}'` }],
          fixLabel: 'Quote the table name',
        });
      } else if (frame.pendingVar && /\n/.test(src.slice(prev.end, t.start))) {
        const lineStart = src.lastIndexOf('\n', t.start - 1) + 1;
        const indent = /^[ \t]*/.exec(src.slice(lineStart))![0];
        const atLineStart = src.slice(lineStart, t.start).trim() === '';
        issues.push({
          ...missingReturn(frame.pendingVar),
          title: 'Missing RETURN before this line',
          detail: 'The VAR definitions above end here, and the next expression needs RETURN in front of it.',
          start: t.start,
          end: t.end,
          fix: [{ start: t.start, end: t.start, text: atLineStart ? `RETURN\n${indent}` : 'RETURN ' }],
          fixLabel: 'Add RETURN',
        });
        frame.pendingVar = null;
      } else {
        const multi = t.kind === 'ident' && next?.kind === 'op' && next.text === '=';
        issues.push({
          severity: 'error',
          cause: 1,
          title: `Missing ${sepText} or operator before ${t.text.length > 28 ? t.text.slice(0, 26) + '…' : t.text}`,
          detail: multi
            ? 'This looks like the start of a second formula. Check one measure at a time.'
            : `DAX found two values in a row. Add ${sepText} if they're separate arguments, or an operator (+, &&, =, ...) if they belong together.`,
          start: t.start,
          end: t.end,
        });
      }
    }

    // Structure: brackets, separators, argument counts.
    if (t.kind === 'lparen' || t.kind === 'lbrace') {
      frame.content = true;
      stack.push({
        kind: t.kind === 'lbrace' ? 'brace' : isCall(idx - 1) ? 'call' : 'group',
        open: t,
        name: isCall(idx - 1) ? prev.text : '',
        nameStart: isCall(idx - 1) ? prev.start : t.start,
        trailing: false,
        args: 0,
        content: false,
        pendingVar: null,
      });
      continue;
    }
    if (t.kind === 'rparen' || t.kind === 'rbrace') {
      if (stack.length === 1) {
        issues.push({
          severity: 'error',
          cause: 2,
          title: `Extra ${t.text}`,
          detail: `This ${t.text} has no ${t.text === ')' ? '(' : '{'} to close. Delete it, or find where the matching opener went missing.`,
          start: t.start,
          end: t.end,
          fix: [{ start: t.start, end: t.end, text: '' }],
          fixLabel: `Delete the extra ${t.text}`,
        });
        continue;
      }
      if (prev?.kind === 'sep') {
        issues.push({
          severity: 'warning',
          cause: 1,
          title: `Trailing ${prev.text} before ${t.text}`,
          detail: `A separator right before the closing bracket promises another argument that never comes. That's almost always a syntax error.`,
          start: prev.start,
          end: prev.end,
          fix: [{ start: prev.start, end: prev.end, text: '' }],
          fixLabel: `Remove the ${prev.text}`,
        });
        frame.trailing = true;
      }
      let f = stack.pop()!;
      let wanted = f.kind === 'brace' ? '}' : ')';
      const below = stack[stack.length - 1];
      if (wanted !== t.text && stack.length > 1 && (below.kind === 'brace' ? '}' : ')') === t.text) {
        // The inner bracket was never closed; this closer belongs to the outer one.
        issues.push({
          severity: 'error',
          cause: 2,
          title: `This ${f.open!.text} never closes`,
          detail: `A ${t.text} arrives while this ${f.open!.text} is still open. Add a ${wanted} before it.`,
          start: f.open!.start,
          end: f.open!.end,
        });
        if (f.pendingVar) issues.push(missingReturn(f.pendingVar));
        f = stack.pop()!;
        wanted = t.text;
      }
      if (wanted !== t.text) {
        issues.push({
          severity: 'error',
          cause: 2,
          title: `${t.text} closes a ${f.open!.text}`,
          detail: `Brackets have to close in the order they opened. This ${f.open!.text} needs a ${wanted} first.`,
          start: t.start,
          end: t.end,
        });
      }
      closeFrame(f, t);
      continue;
    }
    if (t.kind === 'sep') {
      if (stack.length === 1 && !queryMode) {
        issues.push({
          severity: 'error',
          cause: 1,
          title: `${t.text} outside any function`,
          detail: `Separators only go between a function's arguments. This one isn't inside any parentheses, which usually means a ) closed the function too early.`,
          start: t.start,
          end: t.end,
        });
      } else if (!mismatch && setting === 'locale' && style === 'locale' && t.text === ',') {
        issues.push({
          severity: 'error',
          cause: 3,
          title: 'Comma between arguments',
          detail: 'With locale-based separators, arguments are separated by semicolons and the comma is the decimal mark.',
          start: t.start,
          end: t.end,
          fix: [{ start: t.start, end: t.end, text: ';' }],
          fixLabel: 'Use ;',
        });
      }
      if (prev?.kind === 'lparen' && frame.kind === 'call') {
        issues.push({
          severity: 'warning',
          cause: 1,
          title: 'Empty first argument',
          detail: `${frame.name} starts with a separator, so its first argument is missing.`,
          start: t.start,
          end: t.end,
        });
      }
      if (frame.pendingVar) {
        issues.push(missingReturn(frame.pendingVar));
        frame.pendingVar = null;
      }
      frame.args++;
      continue;
    }
    frame.content = true;
  }

  // Anything still open at the end. An unclosed string or name swallows the
  // rest of the formula, so skip these then: they'd only repeat that error.
  const swallowed = toks.some((t) => (t.kind === 'string' || t.kind === 'qname') && t.unterminated);
  if (swallowed) stack.length = 1;
  while (stack.length > 1) {
    const f = stack.pop()!;
    issues.push({
      severity: 'error',
      cause: 2,
      title: `This ${f.open!.text} never closes`,
      detail: `The formula ends while ${f.name ? `${f.name}(` : f.open!.text} is still open. Add a ${f.kind === 'brace' ? '}' : ')'} where it should end.`,
      start: f.nameStart,
      end: f.open!.end,
    });
    if (f.pendingVar) issues.push(missingReturn(f.pendingVar));
  }
  if (stack[0].pendingVar && !swallowed) issues.push(missingReturn(stack[0].pendingVar));
  const last = toks[toks.length - 1];
  if (last?.kind === 'sep') {
    issues.push({
      severity: 'error',
      cause: 1,
      title: `Formula ends with ${last.text}`,
      detail: 'Delete the separator at the end, or add the argument it promises.',
      start: last.start,
      end: last.end,
    });
  }

  issues.sort((a, b) => a.start - b.start || (a.severity === b.severity ? 0 : a.severity === 'error' ? -1 : 1));
  return { issues, style, mismatch };
}

// Apply every safe fix: the issue edits first, then the separator conversion.
export function autoFix(src: string, result: CheckResult, setting: Separators): string | null {
  const edits = result.issues.flatMap((i) => i.fix ?? []);
  if (edits.length === 0 && !result.mismatch) return null;
  let out = applyEdits(src, edits);
  if (result.mismatch) out = convertSeparators(out, setting === 'standard' ? 'locale' : 'standard');
  return out === src ? null : out;
}

export function lineCol(src: string, offset: number) {
  const before = src.slice(0, offset);
  const line = before.split('\n').length;
  const col = offset - before.lastIndexOf('\n');
  return { line, col };
}

export const EXAMPLES: { label: string; formula: string }[] = [
  {
    label: 'Mixed bag',
    formula: `Open High Risks =
VAR Threshold = 15
CALCULATE(
    COUNTROWS(Risk Register),
    Risk Register[Score] >= Threshold,
    Risk Register[Status] != “Closed”,
)`,
  },
  { label: 'Trailing comma', formula: 'Total Sales =\nSUM(Sales[Amount],)' },
  { label: 'Missing comma', formula: 'Bike Sales =\nCALCULATE(SUM(Sales[Amount]) Product[Category] = "Bikes")' },
  { label: 'Extra )', formula: 'Margin Flag =\nIF(DIVIDE([Profit], [Revenue]) > 0.2, "High", "Low"))' },
  { label: 'Semicolons', formula: 'Discounted =\n[Price] * 0,9 + IF([Qty] > 10; 5; 0)' },
  { label: 'Smart quotes', formula: 'Bike Sales =\nCALCULATE([Total Sales], Product[Category] = “Bikes”)' },
  { label: 'Table with spaces', formula: 'Total Sales =\nSUM(Sales Table[Amount])' },
  {
    label: 'VAR, no RETURN',
    formula: 'Profit Margin =\nVAR Profit = [Revenue] - [Cost]\nVAR Margin = DIVIDE(Profit, [Revenue])',
  },
  {
    label: 'Other-language habits',
    formula: `Open Tasks =
CALCULATE(
    COUNTROWS(Tasks),
    Tasks[Status] != "Closed" AND Tasks[Region] IN ("East", "West"),
    SUMIF(Tasks[Hours], ">0")
)`,
  },
  {
    label: 'Clean',
    formula: `Profit Margin =
VAR Profit = [Revenue] - [Cost]
RETURN
    DIVIDE(Profit, [Revenue])`,
  },
];
