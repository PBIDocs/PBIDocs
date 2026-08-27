import type { D1Database } from '../_lib/types';
import { checkSubscriber } from '../_lib/subscriber';

interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL?: string;
  COOKIE_SIGNING_SECRET?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

type Mode = 'dax' | 'm';

const FREE_LIMIT_PER_DAY = 5;
const SUBSCRIBER_LIMIT_PER_DAY = 200;
const MAX_PROMPT_LENGTH = 300;
const DEFAULT_MODEL = 'claude-sonnet-5';

interface FunctionUsed {
  name: string;
  description: string;
}

interface BuilderResult {
  title?: unknown;
  formula?: unknown;
  explanation?: unknown;
  functionsUsed?: unknown;
  error?: unknown;
}

const RESPONSE_SHAPE = `{
  "title": "A short name for the result, e.g. \\"Total Sales\\" or \\"Filtered High-Value Orders\\"",
  "formula": "The complete expression, formatted with line breaks and indentation",
  "explanation": "2-4 plain-English sentences on what it does and why it's written this way",
  "functionsUsed": [{ "name": "FUNCTIONNAME", "description": "one sentence on what it does here" }]
}`;

const DAX_SYSTEM_PROMPT = `You are a DAX formula assistant for Power BI. Given a plain-English description of a calculation, produce a single well-formed DAX measure.

Respond with ONLY a JSON object (no markdown fences, no text outside the JSON) in exactly this shape:
${RESPONSE_SHAPE}
"title" is the measure name (the part before "="); "formula" is the expression after it.

Rules:
- Prefer DIVIDE() over the / operator for any division.
- Prefer VAR/RETURN once the expression needs more than one nested function call.
- If the request is ambiguous, make a reasonable assumption and state it briefly in the explanation — you cannot ask a follow-up question.
- If the request has nothing to do with DAX, Power BI, or a tabular data calculation, respond instead with {"error": "a short one-sentence explanation"} and omit the other fields.
- Never wrap the formula in markdown code fences.`;

const M_SYSTEM_PROMPT = `You are a Power Query M formula assistant for Power BI. Given a plain-English description of a data transformation, produce a single well-formed M expression or query step.

Respond with ONLY a JSON object (no markdown fences, no text outside the JSON) in exactly this shape:
${RESPONSE_SHAPE}
"title" is a short, PascalCase-with-spaces step name (e.g. "Filtered High-Value Orders"); "formula" is the M expression that step would evaluate to (a "let...in" block when multiple steps are needed, or a single expression for a simple transform).

Rules:
- Use "each" and the "_" placeholder for row-wise operations where idiomatic (e.g. Table.SelectRows, Table.AddColumn).
- Prefer built-in M functions (Table.*, List.*, Text.*, Date.*) over manual record/list manipulation when one exists.
- If the request is ambiguous, make a reasonable assumption and state it briefly in the explanation — you cannot ask a follow-up question.
- If the request has nothing to do with Power Query, M, or a data transformation, respond instead with {"error": "a short one-sentence explanation"} and omit the other fields.
- Never wrap the formula in markdown code fences.`;

function json(body: unknown, status: number, extraHeaders?: HeadersInit): Response {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (extraHeaders) {
    for (const [key, value] of new Headers(extraHeaders)) headers.append(key, value);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function hashClientId(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function onRequestPost({ request, env }: RequestContext): Promise<Response> {
  let prompt: unknown;
  let mode: unknown;
  try {
    const body = (await request.json()) as { prompt?: unknown; mode?: unknown };
    prompt = body?.prompt;
    mode = body?.mode;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return json({ error: 'Describe what you want to calculate.' }, 400);
  }

  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return json({ error: `Keep it under ${MAX_PROMPT_LENGTH} characters.` }, 400);
  }

  const resolvedMode: Mode = mode === 'm' ? 'm' : 'dax';

  const subscriber = await checkSubscriber(request, env);
  const setCookieHeader = subscriber.setCookieHeader
    ? { 'Set-Cookie': subscriber.setCookieHeader }
    : undefined;
  const limit = subscriber.isSubscriber ? SUBSCRIBER_LIMIT_PER_DAY : FREE_LIMIT_PER_DAY;

  const clientId = await hashClientId(request.headers.get('CF-Connecting-IP') ?? 'unknown');

  let usedToday = 0;
  try {
    const row = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM dax_builder_usage WHERE client_id = ? AND created_at >= datetime('now', '-1 day')`,
    )
      .bind(clientId)
      .first<{ count: number }>();
    usedToday = row?.count ?? 0;
  } catch {
    return json({ error: 'Something went wrong. Please try again.' }, 500, setCookieHeader);
  }

  if (usedToday >= limit) {
    return json(
      {
        error: subscriber.isSubscriber
          ? `You've used all ${limit} requests for today. Try again tomorrow.`
          : `You've used all ${limit} free requests for today. Upgrade for more, or try again tomorrow.`,
      },
      429,
      setCookieHeader,
    );
  }

  let result: BuilderResult;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
        max_tokens: 800,
        system: resolvedMode === 'm' ? M_SYSTEM_PROMPT : DAX_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: trimmedPrompt }],
      }),
    });

    if (!res.ok) {
      return json(
        { error: 'The formula builder is temporarily unavailable. Please try again shortly.' },
        500,
        setCookieHeader,
      );
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((block) => block.type === 'text')?.text ?? '';
    result = JSON.parse(text) as BuilderResult;
  } catch {
    return json(
      { error: 'The formula builder is temporarily unavailable. Please try again shortly.' },
      500,
      setCookieHeader,
    );
  }

  if (typeof result.error === 'string') {
    return json({ error: result.error }, 422, setCookieHeader);
  }

  if (typeof result.formula !== 'string' || typeof result.explanation !== 'string') {
    return json(
      { error: 'Something went wrong generating that formula. Please try again.' },
      500,
      setCookieHeader,
    );
  }

  try {
    await env.DB.prepare('INSERT INTO dax_builder_usage (client_id) VALUES (?)').bind(clientId).run();
  } catch {
    // Non-fatal — the generated formula is still returned even if usage logging fails.
  }

  const functionsUsed: FunctionUsed[] = Array.isArray(result.functionsUsed)
    ? result.functionsUsed.filter(
        (item): item is FunctionUsed =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as FunctionUsed).name === 'string' &&
          typeof (item as FunctionUsed).description === 'string',
      )
    : [];

  return json(
    {
      title: typeof result.title === 'string' ? result.title : resolvedMode === 'm' ? 'Query Step' : 'Measure',
      formula: result.formula,
      explanation: result.explanation,
      functionsUsed,
      remaining: Math.max(0, limit - usedToday - 1),
      isSubscriber: subscriber.isSubscriber,
    },
    200,
    setCookieHeader,
  );
}
