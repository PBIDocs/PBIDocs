// Window-level event name used to hand a pre-filled prompt to the AskAi
// panel from elsewhere on the page (e.g. a code block's "Ask AI" button).
// A plain event on `window` is enough here since only one AskAi instance
// is ever mounted per page -- no need for React context/prop drilling
// through the MDX-rendered content tree between them.
export const ASK_AI_PREFILL_EVENT = 'pbidocs:ask-ai-prefill';
