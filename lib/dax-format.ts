// DAX formatter. Runs entirely in the browser: nothing is sent anywhere.
//
// Pipeline: lex (keeping comments) -> parse into a small tree -> print with a
// Wadler-style layout engine (a group goes on one line if it fits, otherwise
// its line breaks all break) -> verify. The verify step re-lexes input and
// output and refuses the result unless the two token streams are identical,
// ignoring only whitespace and the letter case of identifiers. So the
// formatter can change layout, never meaning.

import type { Separators } from '@/lib/dax-syntax';

export interface FormatOptions {
  width?: number; // target line length
  indent?: number; // spaces per level
  upperCaseFunctions?: boolean;
}

// ------------------------------------------------------------------- lexer

type TKind = 'string' | 'qname' | 'bname' | 'number' | 'ident' | 'op' | 'sep' | 'lparen' | 'rparen' | 'lbrace' | 'rbrace' | 'comment';
interface T {
  kind: TKind;
  text: string;
  ownLine?: boolean; // comment: started its own line in the source
  lineComment?: boolean; // comment: -- or //
  ref?: string; // ident/qname directly followed by a [column]
}

class FormatError extends Error {}

const TWO_CHAR_OPS = ['&&', '||', '<>', '<=', '>=', '==', ':=', '=>'];

function lex(src: string, sep: Separators): T[] {
  const out: T[] = [];
  const n = src.length;
  let i = 0;
  const numRe = sep === 'standard' ? /\d*\.?\d+(?:[eE][+-]?\d+)?/y : /\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?/y;
  const identRe = /[\p{L}_][\p{L}\p{N}_.]*/uy;
  const atLineStart = () => {
    let k = i - 1;
    while (k >= 0 && (src[k] === ' ' || src[k] === '\t' || src[k] === '\r')) k--;
    return k < 0 || src[k] === '\n';
  };
  const quoted = (q: string, multiline: boolean) => {
    const start = i;
    i++;
    while (i < n) {
      if (!multiline && src[i] === '\n') break;
      if (src[i] === q) {
        if (src[i + 1] === q) {
          i += 2;
          continue;
        }
        i++;
        return src.slice(start, i);
      }
      i++;
    }
    throw new FormatError('unterminated');
  };
  while (i < n) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if ((c === '/' && src[i + 1] === '/') || (c === '-' && src[i + 1] === '-')) {
      const own = atLineStart();
      const start = i;
      while (i < n && src[i] !== '\n') i++;
      out.push({ kind: 'comment', text: src.slice(start, i).trimEnd(), ownLine: own, lineComment: true });
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const own = atLineStart();
      const close = src.indexOf('*/', i + 2);
      if (close === -1) throw new FormatError('unterminated');
      out.push({ kind: 'comment', text: src.slice(i, close + 2), ownLine: own, lineComment: false });
      i = close + 2;
      continue;
    }
    if (c === '"') {
      out.push({ kind: 'string', text: quoted('"', true) });
      continue;
    }
    if (c === "'") {
      out.push({ kind: 'qname', text: quoted("'", false) });
      continue;
    }
    if (c === '[') {
      const start = i;
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
      if (!closed) throw new FormatError('unterminated');
      out.push({ kind: 'bname', text: src.slice(start, i) });
      continue;
    }
    if (/\d/.test(c) || (c === '.' && /\d/.test(src[i + 1] ?? ''))) {
      numRe.lastIndex = i;
      const m = numRe.exec(src);
      if (m) {
        i += m[0].length;
        out.push({ kind: 'number', text: m[0] });
        continue;
      }
    }
    identRe.lastIndex = i;
    const id = identRe.exec(src);
    if (id) {
      i += id[0].length;
      out.push({ kind: 'ident', text: id[0] });
      continue;
    }
    const two = src.slice(i, i + 2);
    if (TWO_CHAR_OPS.includes(two)) {
      i += 2;
      out.push({ kind: 'op', text: two });
      continue;
    }
    if ('=<>+-*/^&:'.includes(c)) {
      i++;
      out.push({ kind: 'op', text: c });
      continue;
    }
    const single: Record<string, TKind> = { ',': 'sep', ';': 'sep', '(': 'lparen', ')': 'rparen', '{': 'lbrace', '}': 'rbrace' };
    if (!single[c]) throw new FormatError(`unexpected ${c}`);
    if (c === ';' && sep === 'standard') throw new FormatError('separator');
    if (c === ',' && sep === 'locale') throw new FormatError('separator');
    out.push({ kind: single[c], text: c });
    i++;
  }
  return out;
}

// Words that may sit directly before a [name] without being its table.
const NOT_A_TABLE = new Set(['RETURN', 'NOT', 'BY', 'IN', 'VAR', 'EVALUATE', 'DEFINE', 'MEASURE', 'COLUMN', 'TABLE', 'FUNCTION', 'AT']);

function mergeRefs(toks: T[]): T[] {
  const out: T[] = [];
  for (const t of toks) {
    const prev = out[out.length - 1];
    if (
      t.kind === 'bname' &&
      prev &&
      !prev.ref &&
      (prev.kind === 'qname' || (prev.kind === 'ident' && !NOT_A_TABLE.has(prev.text.toUpperCase())))
    ) {
      out[out.length - 1] = { ...prev, ref: t.text };
      continue;
    }
    out.push({ ...t });
  }
  return out;
}

// ------------------------------------------------------------------ parser

type Comment = { t: 'comment'; text: string; ownLine: boolean; line: boolean };
type Node =
  | { t: 'atom'; text: string }
  | { t: 'op'; text: string }
  | Comment
  | { t: 'call'; name: string; args: Node[][] }
  | { t: 'paren'; items: Node[][] }
  | { t: 'brace'; items: Node[][] };

// Words that are never a function name even when followed by "(".
const NEVER_CALLEE = new Set(['RETURN', 'IN', 'VAR', 'EVALUATE', 'BY', 'AT', 'ASC', 'DESC', 'DEFINE', 'MEASURE', 'COLUMN', 'TABLE', 'FUNCTION']);

class Parser {
  i = 0;
  private toks: T[];
  constructor(toks: T[]) {
    this.toks = toks;
  }
  peek() {
    return this.toks[this.i];
  }
  expr(): Node[] {
    const parts: Node[] = [];
    for (;;) {
      const t = this.peek();
      if (!t || t.kind === 'sep' || t.kind === 'rparen' || t.kind === 'rbrace') return parts;
      this.i++;
      if (t.kind === 'comment') parts.push({ t: 'comment', text: t.text, ownLine: !!t.ownLine, line: !!t.lineComment });
      else if (t.kind === 'op') parts.push({ t: 'op', text: t.text });
      else if (t.kind === 'lparen') {
        const callee = this.toks[this.i - 2];
        const items = this.list('rparen');
        const prev = parts[parts.length - 1];
        if (prev?.t === 'atom' && callee?.kind === 'ident' && !callee.ref && !NEVER_CALLEE.has(callee.text.toUpperCase())) {
          parts[parts.length - 1] = { t: 'call', name: callee.text, args: items };
        } else parts.push({ t: 'paren', items });
      } else if (t.kind === 'lbrace') parts.push({ t: 'brace', items: this.list('rbrace') });
      else parts.push({ t: 'atom', text: t.text + (t.ref ?? '') });
    }
  }
  list(close: 'rparen' | 'rbrace'): Node[][] {
    const items: Node[][] = [];
    if (this.peek()?.kind === close) {
      this.i++;
      return items;
    }
    for (;;) {
      items.push(this.expr());
      const t = this.peek();
      if (!t) throw new FormatError('unclosed');
      this.i++;
      if (t.kind === close) return items;
      if (t.kind !== 'sep') throw new FormatError('mismatched');
    }
  }
}

// ------------------------------------------------------------- doc printer

// 'free' is text that doesn't count toward line width: trailing comments.
type Doc = string | Doc[] | { k: 'line'; flat: string } | { k: 'hard' } | { k: 'free'; s: string } | { k: 'nest'; d: Doc } | { k: 'group'; d: Doc };
const line: Doc = { k: 'line', flat: ' ' };
const hard: Doc = { k: 'hard' };
const nest = (d: Doc): Doc => ({ k: 'nest', d });
const group = (d: Doc): Doc => ({ k: 'group', d });

function hasHard(d: Doc): boolean {
  if (typeof d === 'string') return false;
  if (Array.isArray(d)) return d.some(hasHard);
  if (d.k === 'hard') return true;
  if (d.k === 'nest' || d.k === 'group') return hasHard(d.d);
  return false;
}

function flatWidth(d: Doc): number {
  if (typeof d === 'string') return d.length;
  if (Array.isArray(d)) return d.reduce((s: number, x) => s + flatWidth(x), 0);
  if (d.k === 'line') return d.flat.length;
  if (d.k === 'hard') return Infinity;
  if (d.k === 'free') return 0;
  return flatWidth(d.d);
}

type Frame = [number, boolean, Doc];

// Width of what follows on the same line, up to the next possible break.
function restWidth(stack: Frame[]): number {
  let w = 0;
  for (let k = stack.length - 1; k >= 0; k--) {
    const r = untilBreak(stack[k][2], stack[k][1]);
    w += r.w;
    if (r.stop) break;
  }
  return w;
}
function untilBreak(d: Doc, flat: boolean): { w: number; stop: boolean } {
  if (typeof d === 'string') return { w: d.length, stop: false };
  if (Array.isArray(d)) {
    let w = 0;
    for (const x of d) {
      const r = untilBreak(x, flat);
      w += r.w;
      if (r.stop) return { w, stop: true };
    }
    return { w, stop: false };
  }
  if (d.k === 'hard') return { w: 0, stop: true };
  if (d.k === 'free') return { w: 0, stop: false };
  if (d.k === 'line') return flat ? { w: d.flat.length, stop: false } : { w: 0, stop: true };
  return untilBreak(d.d, flat);
}

function render(doc: Doc, width: number, indentSize: number): string {
  let out = '';
  let col = 0;
  const newline = (ind: number) => {
    out = out.replace(/[ \t]+$/, '');
    if (!out.endsWith('\n')) out += '\n';
    out += ' '.repeat(ind);
    col = ind;
  };
  const stack: Frame[] = [[0, false, doc]];
  while (stack.length) {
    const [ind, flat, d] = stack.pop()!;
    if (typeof d === 'string') {
      out += d;
      col += d.length;
    } else if (Array.isArray(d)) {
      for (let k = d.length - 1; k >= 0; k--) stack.push([ind, flat, d[k]]);
    } else if (d.k === 'line') {
      if (flat) {
        out += d.flat;
        col += d.flat.length;
      } else newline(ind);
    } else if (d.k === 'hard') newline(ind);
    else if (d.k === 'free') {
      out += d.s;
      col += d.s.length;
    }
    else if (d.k === 'nest') stack.push([ind + indentSize, flat, d.d]);
    else {
      const fits = flat || (!hasHard(d.d) && col + flatWidth(d.d) + restWidth(stack) <= width);
      stack.push([ind, fits, d.d]);
    }
  }
  return out
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .trim();
}

// ------------------------------------------------------------- formatting

const UPPER_WORDS = new Set(['VAR', 'RETURN', 'IN', 'NOT', 'TRUE', 'FALSE', 'ASC', 'DESC']);
const UNARY_AFTER = new Set(['RETURN', 'IN', 'NOT']);
const isWord = (p: Node | undefined, w: string) => !!p && p.t === 'atom' && p.text.toUpperCase() === w;

class Printer {
  private opts: Required<FormatOptions>;
  private sep: string;
  constructor(opts: Required<FormatOptions>, sep: Separators) {
    this.opts = opts;
    this.sep = sep === 'locale' ? ';' : ',';
  }

  get separator() {
    return this.sep;
  }

  comment(n: Comment): Doc {
    return n.line ? [n.text, hard] : n.text;
  }

  expr(parts: Node[]): Doc {
    const v = parts.findIndex((p) => isWord(p, 'VAR'));
    return v === -1 ? this.flow(parts) : this.varBlock(parts, v);
  }

  varBlock(parts: Node[], start: number): Doc {
    const out: Doc[] = [];
    if (start > 0) out.push(this.flow(parts.slice(0, start)), hard);
    let i = start;
    while (i < parts.length) {
      const p = parts[i];
      if (isWord(p, 'VAR')) {
        let j = i + 1;
        const head: Node[] = [];
        while (j < parts.length && !(parts[j].t === 'op' && (parts[j] as { text: string }).text === '=')) head.push(parts[j++]);
        if (j >= parts.length) throw new FormatError('VAR without =');
        j++;
        const value: Node[] = [];
        while (j < parts.length && !isWord(parts[j], 'VAR') && !isWord(parts[j], 'RETURN')) value.push(parts[j++]);
        // Own-line comments at the end of the value belong to the next statement.
        const tail: Comment[] = [];
        while (value.length) {
          const last = value[value.length - 1];
          if (last.t !== 'comment' || !last.ownLine) break;
          tail.unshift(value.pop() as Comment);
        }
        // "VAR x = 1 -- note": keep the note on the VAR's line.
        const last = value[value.length - 1];
        const trailing = last?.t === 'comment' && !last.ownLine && value.length > 1 ? (value.pop() as Comment) : null;
        const valueDoc = this.flow(value);
        const firstIsComment = value[0]?.t === 'comment';
        out.push(
          group(['VAR ', this.flow(head), ' =', nest([firstIsComment ? ' ' : line, valueDoc])]),
          trailing ? { k: 'free', s: ' ' + trailing.text } : '',
          hard,
        );
        for (const c of tail) out.push(c.text, hard);
        i = j;
      } else if (isWord(p, 'RETURN')) {
        out.push('RETURN', nest([hard, this.flow(parts.slice(i + 1))]));
        i = parts.length;
      } else {
        out.push(p.t === 'comment' ? [p.text, hard] : this.flow([p]));
        i++;
      }
    }
    return out;
  }

  // Operands and operators on one logical line; && and || may break.
  flow(parts: Node[]): Doc {
    const out: Doc[] = [];
    let prev: Node | null = null;
    let breakable = false;
    for (const p of parts) {
      const afterLineComment = prev?.t === 'comment' && prev.line;
      if (p.t === 'comment') {
        if (prev) out.push(p.ownLine && !afterLineComment ? hard : afterLineComment ? '' : ' ');
        out.push(this.comment(p));
      } else if (p.t === 'op') {
        const unary =
          (p.text === '-' || p.text === '+') &&
          (!prev || prev.t === 'op' || prev.t === 'comment' || (prev.t === 'atom' && UNARY_AFTER.has(prev.text.toUpperCase())));
        if (unary) {
          if (prev?.t === 'atom') out.push(' ');
          out.push(p.text);
        } else if ((p.text === '&&' || p.text === '||') && !afterLineComment) {
          breakable = true;
          out.push(nest([line, p.text, ' ']));
        } else out.push(afterLineComment ? '' : ' ', p.text, ' ');
      } else {
        if (prev && prev.t !== 'op' && !afterLineComment) out.push(' ');
        out.push(this.node(p));
      }
      prev = p;
    }
    return breakable ? group(out) : out;
  }

  node(n: Node): Doc {
    switch (n.t) {
      case 'atom': {
        const w = n.text.toUpperCase();
        return UPPER_WORDS.has(w) ? w : n.text;
      }
      case 'op':
        return n.text;
      case 'comment':
        return this.comment(n);
      case 'call': {
        const name = this.opts.upperCaseFunctions ? n.name.toUpperCase() : n.name;
        if (n.args.length === 0) return `${name} ()`;
        return group([`${name} (`, this.items(n.args), ')']);
      }
      case 'paren':
        return n.items.length === 0 ? '()' : group(['(', this.items(n.items), ')']);
      case 'brace':
        return n.items.length === 0 ? '{}' : group(['{', this.items(n.items), '}']);
    }
  }

  items(items: Node[][]): Doc {
    const body: Doc[] = [];
    items.forEach((parts, k) => {
      const lead = parts[0];
      const sepDoc = k === 0 ? '' : this.sep;
      if (lead?.t === 'comment' && !lead.ownLine) {
        // "x, -- note" stays on the line it was written on.
        body.push(sepDoc, ' ', this.comment(lead));
        if (!lead.line) body.push(line);
        body.push(this.expr(parts.slice(1)));
      } else {
        body.push(sepDoc, line, this.expr(parts));
      }
    });
    return [nest(body), line];
  }
}

// ------------------------------------------------------------- top level

// "Total Sales =" or "Total Sales :=" at the start, after leading comments.
// Returns null when the text doesn't start with a measure name.
function splitHeader(src: string): { lead: string; name: string; assign: string; body: string } | null {
  const lead = /^(?:\s+|--[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\/)*/.exec(src)![0];
  const m = /^([^=\n"'[\],;{}]+?)\s*(:?=)(?![=>])/.exec(src.slice(lead.length));
  if (!m) return null;
  const name = m[1].trim();
  // "ETC (Estimate to Complete) =" is a name; "IF ( x =" is code. Names have
  // balanced parentheses and don't start with a function call.
  let depth = 0;
  for (const ch of name) {
    if (ch === '(') depth++;
    if (ch === ')' && --depth < 0) return null;
  }
  if (depth !== 0) return null;
  if (/^[\p{L}_][\p{L}\p{N}_.]*\s*\(/u.test(name) && !/\)\s*$/.test(name)) return null;
  if (/^(VAR|DEFINE|EVALUATE|RETURN|MEASURE)\b/i.test(name)) return null;
  if (/[<>!&|+*/^]$/.test(name)) return null;
  return { lead, name, assign: m[2], body: src.slice(lead.length + m[0].length) };
}

function isQuery(toks: T[]) {
  return toks.some((t) => t.kind === 'ident' && !t.ref && /^(EVALUATE|DEFINE)$/i.test(t.text));
}

const kw = (t: T | undefined, ...words: string[]) => !!t && t.kind === 'ident' && !t.ref && words.includes(t.text.toUpperCase());

function formatQuery(toks: T[], pr: Printer): Doc {
  const out: Doc[] = [];
  let i = 0;
  let inDefine = false;
  const isStmt = (t: T, k: number) =>
    kw(t, 'DEFINE', 'EVALUATE', 'MEASURE', 'COLUMN', 'TABLE', 'FUNCTION') ||
    (kw(t, 'VAR') && inDefine) ||
    (kw(t, 'ORDER') && kw(toks[k + 1], 'BY')) ||
    (kw(t, 'START') && kw(toks[k + 1], 'AT'));
  const take = () => {
    const start = i;
    let depth = 0;
    while (i < toks.length) {
      const t = toks[i];
      if (depth === 0 && isStmt(t, i)) break;
      if (t.kind === 'lparen' || t.kind === 'lbrace') depth++;
      if (t.kind === 'rparen' || t.kind === 'rbrace') depth--;
      i++;
    }
    const slice = toks.slice(start, i);
    // Own-line comments at the end belong to the next statement.
    let cut = slice.length;
    while (cut > 0 && slice[cut - 1].kind === 'comment' && slice[cut - 1].ownLine) cut--;
    i -= slice.length - cut;
    return slice.slice(0, cut);
  };
  const exprDoc = (ts: T[]) => {
    const p = new Parser(ts);
    const parts = p.expr();
    if (p.i !== ts.length) throw new FormatError('trailing');
    return pr.expr(parts);
  };
  const listDoc = (ts: T[]): Doc => {
    const p = new Parser([...ts, { kind: 'rparen', text: ')' }]);
    const items = p.list('rparen');
    if (p.i !== ts.length + 1) throw new FormatError('trailing');
    return group(nest(items.map((it, k) => [k === 0 ? '' : pr.separator, line, pr.expr(it)])));
  };
  while (i < toks.length) {
    const t = toks[i];
    if (t.kind === 'comment') {
      out.push(inDefine ? nest(t.text) : t.text, hard);
      i++;
    } else if (kw(t, 'DEFINE')) {
      i++;
      inDefine = true;
      out.push('DEFINE', hard);
    } else if (kw(t, 'EVALUATE')) {
      i++;
      inDefine = false;
      out.push('EVALUATE', hard, exprDoc(take()), hard);
    } else if (kw(t, 'ORDER') && kw(toks[i + 1], 'BY')) {
      i += 2;
      out.push('ORDER BY', listDoc(take()), hard);
    } else if (kw(t, 'START') && kw(toks[i + 1], 'AT')) {
      i += 2;
      out.push('START AT', listDoc(take()), hard);
    } else if (inDefine && kw(t, 'MEASURE', 'COLUMN', 'TABLE', 'VAR', 'FUNCTION')) {
      i++;
      const head: string[] = [];
      while (i < toks.length && !(toks[i].kind === 'op' && toks[i].text === '=')) head.push(toks[i].text + (toks[i++].ref ?? ''));
      if (i >= toks.length) throw new FormatError('no =');
      i++;
      const body = exprDoc(take());
      out.push(nest([hard, group([t.text.toUpperCase(), ' ', head.join(' '), ' =', nest([line, body])])]), hard);
    } else throw new FormatError('unexpected statement');
  }
  return out;
}

function signature(toks: T[]): string[] {
  return toks.map((t) => {
    const body = t.text + (t.ref ?? '');
    if (t.kind === 'ident') return `ident:${body.toUpperCase()}`;
    if (t.kind === 'comment') return `comment:${t.text.trim()}`;
    return `${t.kind}:${body}`;
  });
}

function sameTokens(a: string, b: string, sep: Separators) {
  const x = signature(mergeRefs(lex(a, sep)));
  const y = signature(mergeRefs(lex(b, sep)));
  return x.length === y.length && x.every((s, k) => s === y[k]);
}

// --------------------------------------------------------------------- api

// Returns the formatted DAX, or null when it can't be formatted safely
// (a syntax error, or anything the formatter doesn't understand).
export function formatDax(src: string, sep: Separators = 'standard', options: FormatOptions = {}): string | null {
  const opts: Required<FormatOptions> = { width: 80, indent: 4, upperCaseFunctions: true, ...options };
  if (src.trim() === '') return null;
  const pr = new Printer(opts, sep);
  try {
    const h = splitHeader(src);
    const bodySrc = h ? h.body : src;
    const toks = mergeRefs(lex(bodySrc, sep));
    if (!h && isQuery(toks)) {
      const out = render(formatQuery(toks, pr), opts.width, opts.indent);
      return sameTokens(src, out, sep) ? out : null;
    }
    const p = new Parser(toks);
    const parts = p.expr();
    if (p.i !== toks.length) return null;
    const body = render(pr.expr(parts), opts.width, opts.indent);
    if (!sameTokens(bodySrc, body, sep)) return null;
    if (!h) return body;
    const leadComments = lex(h.lead, sep).map((c) => c.text);
    return [...leadComments, `${h.name} ${h.assign}`, body].join('\n');
  } catch (e) {
    if (e instanceof FormatError) return null;
    throw e;
  }
}
