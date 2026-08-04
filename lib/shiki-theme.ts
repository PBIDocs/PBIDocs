import type { ThemeRegistrationRaw } from 'shiki';

// A minimal, restrained syntax theme: one brand-violet accent for structural
// keywords/identifiers, muted italic comments, and everything else (including
// operators like =, +, -, *, /) left as plain default text. Modeled after
// Supabase's docs, which use one accent color instead of a full rainbow.
const ACCENT_SCOPES = [
  'keyword.control',
  'keyword.other',
  'storage.type',
  'storage.modifier',
  'entity.name.function',
  'entity.name.tag',
  'entity.name.label',
  'support.function',
  'support.class',
  // Deliberately NOT variable.other.constant: DAX's grammar uses that scope
  // as a catch-all for every bare identifier (including plain VAR names
  // like Profit/Sales/Margin, not just function/table/column names), which
  // accented almost every word in a block and made it read as "all purple"
  // instead of a restrained accent on the actually-important tokens.
  'variable.language',
  'constant.language',
];

function makeTheme(name: string, type: 'light' | 'dark', fg: string, comment: string, accent: string): ThemeRegistrationRaw {
  return {
    name,
    type,
    colors: {
      'editor.background': type === 'dark' ? '#1a1a1a' : '#ffffff',
      'editor.foreground': fg,
    },
    // shiki reads custom (non-bundled) theme objects via the TextMate
    // `settings` field, not the VS Code `tokenColors` field bundled themes use.
    settings: [
      { settings: { foreground: fg } },
      { scope: ['comment'], settings: { foreground: comment, fontStyle: 'italic' } },
      { scope: ACCENT_SCOPES, settings: { foreground: accent } },
    ],
  };
}

export const pbidocsLightTheme = makeTheme('pbidocs-light', 'light', '#1f2328', '#6e7781', '#7954DE');
export const pbidocsDarkTheme = makeTheme('pbidocs-dark', 'dark', '#e6e6e6', '#8b949e', '#AD94FF');
