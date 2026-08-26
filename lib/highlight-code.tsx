const KEYWORDS = new Set([
  'VAR',
  'RETURN',
  'IF',
  'TRUE',
  'FALSE',
  'BLANK',
  'let',
  'in',
  'each',
  'if',
  'then',
  'else',
  'otherwise',
  'try',
  'catch',
  'type',
  'meta',
]);

const TOKEN_REGEX =
  /(\/\/[^\n]*|--[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|\b[A-Za-z_][A-Za-z0-9_.]*(?=\()|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;

export function highlightCode(code: string) {
  const tokens: { className: string; value: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TOKEN_REGEX.lastIndex = 0;
  while ((match = TOKEN_REGEX.exec(code))) {
    if (match.index > lastIndex) {
      tokens.push({ className: '', value: code.slice(lastIndex, match.index) });
    }
    const value = match[0];
    let className = '';
    if (value.startsWith('//') || value.startsWith('--') || value.startsWith('/*')) {
      className = 'italic text-fd-muted-foreground/70';
    } else if (value.startsWith('"')) {
      className = 'text-emerald-600 dark:text-emerald-400';
    } else if (/^\d/.test(value)) {
      className = 'text-amber-600 dark:text-amber-400';
    } else if (code[match.index + value.length] === '(') {
      className = 'font-medium text-sky-600 dark:text-sky-400';
    } else if (KEYWORDS.has(value)) {
      className = 'font-medium text-fd-primary';
    }
    tokens.push({ className, value });
    lastIndex = match.index + value.length;
  }
  if (lastIndex < code.length) {
    tokens.push({ className: '', value: code.slice(lastIndex) });
  }
  return tokens.map((token, i) =>
    token.className ? (
      <span key={i} className={token.className}>
        {token.value}
      </span>
    ) : (
      <span key={i}>{token.value}</span>
    ),
  );
}
