// Window-level event name used to hand a pre-filled prompt to the AskAi
// panel from elsewhere on the page (e.g. a code block's "Ask AI" button,
// or a playground's "Ask AI about this result" button). A plain event on
// `window` is enough here since only one AskAi instance is ever mounted per
// page -- no need for React context/prop drilling through the MDX-rendered
// content tree between them.
export const ASK_AI_PREFILL_EVENT = 'pbidocs:ask-ai-prefill';

// Must match MAX_MESSAGE_LENGTH in functions/api/ask-ai.ts. That limit is
// sized for a typed chat question, so anything built from real page content
// (a full code block, a playground's formula + result) can exceed it --
// truncating client-side keeps every prompt within what the server accepts,
// with an explicit notice rather than a silent cut or an outright rejection.
const MAX_MESSAGE_LENGTH = 500;
const TRUNCATION_NOTICE = '\n… (truncated)';

/** Builds `prefix + body + suffix`, truncating `body` so the total never exceeds MAX_MESSAGE_LENGTH. */
export function buildAskAiPrompt(prefix: string, body: string, suffix = ''): string {
  const budget = MAX_MESSAGE_LENGTH - prefix.length - suffix.length;
  const truncatedBody =
    body.length <= budget ? body : body.slice(0, Math.max(0, budget - TRUNCATION_NOTICE.length)) + TRUNCATION_NOTICE;
  return `${prefix}${truncatedBody}${suffix}`;
}

/** Sends a prompt straight to the page's AskAi panel, opening it if needed. */
export function askAi(prompt: string) {
  window.dispatchEvent(new CustomEvent(ASK_AI_PREFILL_EVENT, { detail: prompt }));
}
