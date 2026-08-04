import type { ThemeRegistrationRaw } from 'shiki';

// A properly differentiated syntax theme, not a full rainbow but distinct
// colors per token category: keywords, function/label names (brand violet,
// matching links/buttons elsewhere on the site), bracket/table references,
// and strings, plus muted italic comments. Operators (=, +, -, *, /) are
// deliberately left as plain default text - an earlier version accented
// those too and it read as noisy/inconsistent next to reference docs sites.
// All accent hex values are picked to individually clear WCAG AA (4.5:1)
// against the code block's background (--color-fd-secondary) in both themes.
const KEYWORD_SCOPES = ['keyword.control', 'keyword.other', 'storage.type', 'storage.modifier'];
const NAME_SCOPES = [
  'entity.name.function',
  'entity.name.tag',
  'entity.name.label',
  // DAX's built-in function names (SUM, DIVIDE, CALCULATE, ...) use this scope.
  // Deliberately NOT variable.other.constant: that's DAX's catch-all for any
  // bare identifier (including plain VAR names like Profit/Sales/Margin),
  // which would accent almost every word in a block instead of just the
  // meaningful ones.
  'variable.language',
  'constant.language',
];
const REFERENCE_SCOPES = ['support.function', 'support.class'];
const STRING_SCOPES = ['string'];

interface Palette {
  fg: string;
  comment: string;
  keyword: string;
  name: string;
  reference: string;
  string: string;
}

function makeTheme(name: string, type: 'light' | 'dark', p: Palette): ThemeRegistrationRaw {
  return {
    name,
    type,
    colors: {
      'editor.background': type === 'dark' ? '#1a1a1a' : '#ffffff',
      'editor.foreground': p.fg,
    },
    // shiki reads custom (non-bundled) theme objects via the TextMate
    // `settings` field, not the VS Code `tokenColors` field bundled themes use.
    settings: [
      { settings: { foreground: p.fg } },
      { scope: ['comment'], settings: { foreground: p.comment, fontStyle: 'italic' } },
      { scope: KEYWORD_SCOPES, settings: { foreground: p.keyword } },
      { scope: NAME_SCOPES, settings: { foreground: p.name } },
      { scope: REFERENCE_SCOPES, settings: { foreground: p.reference } },
      { scope: STRING_SCOPES, settings: { foreground: p.string } },
    ],
  };
}

export const pbidocsLightTheme = makeTheme('pbidocs-light', 'light', {
  fg: '#1f2328',
  comment: '#6e7781',
  keyword: '#b30029',
  name: '#7954DE',
  reference: '#0053a5',
  string: '#036819',
});

export const pbidocsDarkTheme = makeTheme('pbidocs-dark', 'dark', {
  fg: '#e6e6e6',
  comment: '#8b949e',
  keyword: '#F97583',
  name: '#AD94FF',
  reference: '#79B8FF',
  string: '#85E89D',
});
